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
 const shell=JSON.parse(/const SHELL=(\[.*?\]);/.exec(sw)[1]);
 for(const f of shell) if(f!=='./') ok(fs.existsSync(path.join(root,f)),'SHELL '+f);
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 for(const m of html.matchAll(/(?:href|src)="((?:icons|css|js)\/[^"]+)"/g)) ok(fs.existsSync(path.join(root,m[1])),'index.html '+m[1]);}

console.log('OK, asercji:',n);
