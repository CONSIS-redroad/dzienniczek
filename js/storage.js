const Storage = {
  box(){ return AppState.user?.guest ? sessionStorage : localStorage; },
  key(){ return AppState.user?.guest ? CONFIG.guestStorageKey : (AppState.user ? CONFIG.storagePrefix + AppState.user.sub : null); },
  load(){ try { return JSON.parse(this.box().getItem(this.key()) || '{"days":{},"quotes":{}}'); } catch { return {days:{},quotes:{}}; } },
  save(){ try { this.box().setItem(this.key(), JSON.stringify({schemaVersion:CONFIG.schemaVersion,days:AppState.days,quotes:AppState.quotes})); return true; } catch { showToast("Nie udało się zapisać danych.","error"); return false; } },
  clear(){ this.box().removeItem(this.key()); },
  // Format v3 zapisywał klucz dnia jako toISOString() północy czasu lokalnego (w Polsce = dzień wcześniej).
  v3Key(d){ return d.toISOString().slice(0,10); },
  // Odtwarza lokalną datę, z której wyliczono klucz v3 w BIEŻĄCEJ strefie czasowej (nie przesuwa kluczy, które już są poprawne).
  legacyKeyToLocal(k){
    const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(k); if(!m) return null;
    const y=+m[1],mo=+m[2]-1,da=+m[3];
    for(const off of [1,0,-1]){
      const d=new Date(y,mo,da+off);
      if(this.v3Key(d)===k) return dateKey(d);
    }
    return null;
  },
  migrateOldLocalDates(){
    if(AppState.user?.guest) return;
    const key=this.key(); if(!key) return;
    const flag=`${key}_${CONFIG.migrationKey}`;
    if(localStorage.getItem(flag)==="1") return;
    const raw=localStorage.getItem(key);
    if(!raw){localStorage.setItem(flag,"1");return;}
    try{
      const parsed=JSON.parse(raw);
      // Dane z schemaVersion >= 2 mają już daty lokalne — nic nie przesuwamy.
      if((parsed.schemaVersion||1)>=CONFIG.schemaVersion){localStorage.setItem(flag,"1");return;}
      localStorage.setItem(`${key}_backup_v3_${Date.now()}`,raw);
      const days={};
      for(const [k,v] of Object.entries(parsed.days||{})){
        const nk=this.legacyKeyToLocal(k)||k;
        if(days[nk] && JSON.stringify(days[nk])!==JSON.stringify(v)){
          // kolizja: scal wpisy zamiast nadpisywać
          const a=days[nk],b=v||{};
          days[nk]={symptoms:(a.symptoms||[]).map((x,i)=>!!x||!!(b.symptoms||[])[i]),note:[a.note,b.note].filter(Boolean).join("\n")};
        }else days[nk]=v;
      }
      localStorage.setItem(key,JSON.stringify({schemaVersion:CONFIG.schemaVersion,days,quotes:parsed.quotes||{}}));
      localStorage.setItem(flag,"1");
    }catch(e){ console.warn("Migracja dat nieudana",e); }
  }
};
