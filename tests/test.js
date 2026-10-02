// Testy offline (Node, bez zależności): TZ=Europe/Warsaw node tests/test.js  (powtórz dla innych stref)
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert');
const root=path.join(__dirname,'..');
function mk(){
  const store=()=>{const m={};return{getItem:k=>k in m?m[k]:null,setItem:(k,v)=>{m[k]=String(v)},removeItem:k=>{delete m[k]},m}};
  const els={};
  const ctx={console,Date,JSON,Object,Array,Number,String,Math,setTimeout,clearTimeout,
    document:{getElementById:id=>els[id]||(els[id]={textContent:'',className:'',replaceChildren(){},appendChild(){},dataset:{}})},
    localStorage:store(),sessionStorage:store()};
  vm.createContext(ctx);
  for(const f of ['config','state','symptoms','utils','storage','calendar'])
    vm.runInContext(fs.readFileSync(path.join(root,'js',f+'.js'),'utf8').replace(/^const (\w+)\s*=/mg,'var $1 ='),ctx,{filename:f});
  return ctx;
}
const pad=n=>String(n).padStart(2,'0');
const local=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
let n=0;const ok=(c,m)=>{assert(c,m);n++;};
console.log('TZ =',process.env.TZ||'(domyślna)');

// 1. dateKey = data lokalna (cały zakres 2024-2027, w tym zmiany czasu)
{const c=mk();const dk=vm.runInContext('dateKey',c);
 for(let t=new Date(2024,0,1);t<new Date(2028,0,1);t.setDate(t.getDate()+1)) assert.strictEqual(dk(t),local(t));n++;}

// 2. migracja danych v3 (klucze = toISOString północy lokalnej) -> daty lokalne, w każdej strefie
{const c=mk();const key='dzienniczek_user_SUB',days={};
 for(let t=new Date(2024,0,1);t<new Date(2028,0,1);t.setDate(t.getDate()+1)) days[new Date(t).toISOString().slice(0,10)]={symptoms:Array(27).fill(false),note:'n'+local(t)};
 c.localStorage.setItem(key,JSON.stringify({days,quotes:{1:'q'}}));
 vm.runInContext('AppState.user={sub:"SUB",guest:false}',c);
 vm.runInContext('Storage.migrateOldLocalDates()',c);
 const out=JSON.parse(c.localStorage.getItem(key));
 ok(out.schemaVersion===2,'schemaVersion po migracji');
 ok(Object.keys(out.days).length===Object.keys(days).length,'liczba wpisów bez zmian');
 for(const [k,v] of Object.entries(out.days)) assert.strictEqual(v.note,'n'+k,'klucz '+k);n++;
 ok(Object.keys(c.localStorage.m).some(k=>k.includes('_backup_v3_')),'kopia zapasowa');
 const snap=c.localStorage.getItem(key);
 vm.runInContext('Storage.migrateOldLocalDates()',c);
 ok(c.localStorage.getItem(key)===snap,'idempotentność');}

// 3. dane z schemaVersion:2 (już lokalne) NIE są przesuwane, nawet bez flagi
{const c=mk();const key='dzienniczek_user_SUB',days={};
 for(let t=new Date(2026,0,1);t<new Date(2027,0,1);t.setDate(t.getDate()+1)) days[local(t)]={symptoms:Array(27).fill(false),note:'n'+local(t)};
 const raw=JSON.stringify({schemaVersion:2,days,quotes:{}});c.localStorage.setItem(key,raw);
 vm.runInContext('AppState.user={sub:"SUB",guest:false}',c);
 vm.runInContext('Storage.migrateOldLocalDates()',c);
 ok(c.localStorage.getItem(key)===raw,'dane v2 nietknięte');
 ok(!Object.keys(c.localStorage.m).some(k=>k.includes('_backup_v3_')),'brak kopii dla v2');}

// 4. save() zapisuje schemaVersion; gość nie jest migrowany
{const c=mk();vm.runInContext('AppState.user={sub:"S",guest:false};AppState.days={"2026-10-02":{symptoms:[],note:"x"}};Storage.save()',c);
 ok(JSON.parse(c.localStorage.getItem('dzienniczek_user_S')).schemaVersion===2,'save -> schemaVersion');
 vm.runInContext('AppState.user={guest:true};Storage.migrateOldLocalDates()',c);ok(true);}

// 5. nawigacja miesięcy z 31. dnia
{const c=mk();const f=(y,m,d,op)=>{vm.runInContext(`AppState.calendarDate=new Date(${y},${m},${d})`,c);vm.runInContext(`Calendar.render=function(){};Calendar.${op}()`,c);const r=vm.runInContext('AppState.calendarDate',c);return [r.getFullYear(),r.getMonth()];};
 assert.deepStrictEqual(f(2026,9,31,'next'),[2026,10]);n++;   // 31.10 -> listopad (nie grudzień)
 assert.deepStrictEqual(f(2026,2,31,'prev'),[2026,1]);n++;    // 31.03 -> luty
 assert.deepStrictEqual(f(2026,0,31,'prev'),[2025,11]);n++;
 assert.deepStrictEqual(f(2026,11,31,'next'),[2027,0]);n++;}

// 6. manifest, SW i HTML wskazują istniejące pliki
{const man=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
 for(const i of man.icons) ok(fs.existsSync(path.join(root,i.src)),'ikona '+i.src);
 ok(man.icons.some(i=>i.sizes==='192x192')&&man.icons.some(i=>i.sizes==='512x512'),'PNG 192 i 512');
 const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
 const shell=JSON.parse(/const SHELL\s*=\s*(\[[\s\S]*?\]);/.exec(sw)[1].replace(/\s+/g,' '));
 for(const f of shell) if(f!=='./') ok(fs.existsSync(path.join(root,f)),'SHELL '+f);
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 for(const m of html.matchAll(/(?:href|src)="((?:icons|css|js)\/[^"]+)"/g)) ok(fs.existsSync(path.join(root,m[1])),'index.html '+m[1]);}

// 7. wersjonowanie: jedna stała APP_VERSION, spójna z sw.js, index.html i listą SHELL
{const ver=fs.readFileSync(path.join(root,'js','version.js'),'utf8');
 const m=/const APP_VERSION\s*=\s*"(\d+\.\d+\.\d+)"/.exec(ver);ok(!!m,'js/version.js definiuje APP_VERSION (x.y.z)');
 const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 ok(/importScripts\(\s*"\.\/js\/version\.js"\s*\)/.test(sw),'sw.js importuje js/version.js');
 ok(/CACHE_NAME\s*=\s*`\$\{CACHE_PREFIX\}\$\{APP_VERSION\}`/.test(sw),'nazwa cache zależy od APP_VERSION');
 ok(!/\d+\.\d+\.\d+/.test(sw.replace(/\/\*.*?\*\//g,'')),'sw.js nie ma wpisanej na stałe wersji');
 ok(!/dzienniczek-v\d|shell-\d/.test(sw),'sw.js bez ręcznej nazwy cache');
 ok(html.indexOf('js/version.js')>-1&&html.indexOf('js/version.js')<html.indexOf('js/app.js'),'index.html ładuje version.js przed app.js');
 ok(/data-app-version/.test(html),'wersja widoczna w UI');
 const shell=JSON.parse(/const SHELL = (\[[\s\S]*?\]);/.exec(sw)[1].replace(/\s+/g,' '));
 ok(shell.includes('./js/version.js')&&shell.includes('./js/pwa.js'),'SHELL zawiera version.js i pwa.js');
 // każdy plik js/css/ikon w repo jest w SHELL (nie zostanie pominięty offline) i odwrotnie
 const onDisk=[];for(const d of ['css','js','icons'])for(const f of fs.readdirSync(path.join(root,d))){if(d!=='icons'||/\.(png|svg)$/.test(f))onDisk.push('./'+d+'/'+f);}
 for(const f of onDisk)ok(shell.includes(f),'brak w SHELL: '+f);
 for(const f of shell)if(f!=='./')ok(fs.existsSync(path.join(root,f)),'SHELL: nie istnieje '+f);
 ok(/updateViaCache:\s*"none"/.test(fs.readFileSync(path.join(root,'js','pwa.js'),'utf8')),'rejestracja z updateViaCache:none');}

// 8. zachowanie SW (symulacja): install, activate czyści tylko stare cache aplikacji, fetch network-first z fallbackiem do cache
{const listeners={},store={};const cache=n=>store[n]||(store[n]=new Map());
 const key=r=>typeof r==='string'?new URL(r,'https://x.test/').href:r.url;
 const caches={open:async n=>({addAll:async rs=>{for(const r of rs)cache(n).set(key(r),'shell')},put:async(r,v)=>{cache(n).set(key(r),v)}}),
  keys:async()=>Object.keys(store),delete:async n=>delete store[n],
  match:async r=>{for(const n of Object.keys(store)){const v=store[n].get(key(r).split('?')[0]);if(v)return v}}};
 let skipped=false,claimed=false,online=true;
 class Req{constructor(u,o){this.url=new URL(u,'https://x.test/').href;this.method='GET';this.mode=(o&&o.mode)||'cors';}}
 const g={importScripts:()=>{},caches,Request:Req,URL,Response:{error:()=>'ERR'},AbortController,setTimeout,clearTimeout,
  fetch:async r=>{if(!online)throw new Error('offline');return{ok:true,body:'net:'+r.url,clone(){return this}}},
  self:{location:{origin:'https://x.test'},addEventListener:(t,f)=>{listeners[t]=f},skipWaiting:()=>{skipped=true},clients:{claim:async()=>{claimed=true}}}};
 g.self.self=g.self;vm.createContext(g);
 vm.runInContext('var APP_VERSION="9.9.9";'+fs.readFileSync(path.join(root,'sw.js'),'utf8').replace(/^importScripts.*$/m,''),g);
 const run=async(t,ev)=>{let p;ev.waitUntil=x=>{p=x};ev.respondWith=x=>{p=x};listeners[t](ev);return p;};
 (async()=>{
  store['dzienniczek-4.0.0']=new Map([['a','1']]);store['cudza-apka']=new Map([['a','1']]);
  await run('install',{});ok(skipped,'skipWaiting po install');ok(!!store['dzienniczek-9.9.9']&&store['dzienniczek-9.9.9'].size>20,'cache aktualnej wersji wypełniony');
  await run('activate',{});ok(claimed,'clients.claim po activate');
  ok(!store['dzienniczek-4.0.0'],'stary cache usunięty');ok(!!store['cudza-apka'],'cudzy cache nietknięty');
  const req=new Req('https://x.test/js/app.js?v=1');
  ok(await run('fetch',{request:req})&&(await run('fetch',{request:req})).body==='net:'+req.url,'network-first: online -> sieć');
  store['dzienniczek-9.9.9'].set('https://x.test/js/app.js','cached');
  online=false;ok((await run('fetch',{request:req}))==='cached','offline -> cache (ignoruje ?v=)');
  store['dzienniczek-9.9.9'].set('https://x.test/index.html','INDEX');
  ok((await run('fetch',{request:new Req('https://x.test/cokolwiek',{mode:'navigate'})}))==='INDEX','offline nawigacja -> index.html');
  console.log('OK (SW), asercji:',n);
 })().catch(e=>{console.error(e);process.exit(1)});}

// 9. UI: każdy id używany w JS istnieje w index.html; belka „Statystyki i profil” jest spójna
{const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const ids=new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]));
 for(const f of fs.readdirSync(path.join(root,'js'))){const src=fs.readFileSync(path.join(root,'js',f),'utf8');
  for(const m of src.matchAll(/getElementById\("([^"]+)"\)/g)) ok(ids.has(m[1]),`id #${m[1]} z js/${f} istnieje w index.html`);}
 ok(/id="btn-toggle-side"[^>]*aria-expanded="false"[^>]*aria-controls="side-panels"/.test(html)&&ids.has('side-panels'),'belka: aria-expanded + aria-controls -> #side-panels');
 const css=fs.readFileSync(path.join(root,'css','responsive.css'),'utf8');
 ok(/\.btn-icon\{width:44px;height:44px\}/.test(css)&&/\.btn\{min-height:44px\}/.test(css),'cele dotykowe >= 44px na telefonie');
 ok(/viewport-fit=cover/.test(html)&&/safe-area-inset/.test(fs.readFileSync(path.join(root,'css','layout.css'),'utf8')),'safe-area uwzględnione');}

console.log('OK, asercji:',n);
