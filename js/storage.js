const Storage = {
  box(){ return AppState.user?.guest ? sessionStorage : localStorage; },
  key(){ return AppState.user?.guest ? CONFIG.guestStorageKey : (AppState.user ? CONFIG.storagePrefix + AppState.user.sub : null); },
  load(){ try { return JSON.parse(this.box().getItem(this.key()) || '{"days":{},"quotes":{}}'); } catch { return {days:{},quotes:{}}; } },
  save(){ try { this.box().setItem(this.key(), JSON.stringify({days:AppState.days,quotes:AppState.quotes})); return true; } catch { showToast("Nie udało się zapisać danych.","error"); return false; } },
  clear(){ this.box().removeItem(this.key()); },
  migrateOldLocalDates(){
    if(AppState.user?.guest) return;
    const key=this.key(); if(!key || localStorage.getItem(`${key}_${CONFIG.migrationKey}`)==="1") return;
    const raw=localStorage.getItem(key);
    if(!raw){localStorage.setItem(`${key}_${CONFIG.migrationKey}`,"1");return;}
    try{
      const parsed=JSON.parse(raw);
      const backupKey=`${key}_backup_v3_${Date.now()}`;
      localStorage.setItem(backupKey,raw);
      const days={};
      for(const [k,v] of Object.entries(parsed.days||{})){
        const p=k.split("-").map(Number);
        if(p.length!==3 || p.some(Number.isNaN)){days[k]=v;continue;}
        const d=new Date(p[0],p[1]-1,p[2]); d.setDate(d.getDate()+1);
        const nk=dateKey(d);
        if(days[nk] && JSON.stringify(days[nk])!==JSON.stringify(v)){
          days[k]=v;
        }else days[nk]=v;
      }
      localStorage.setItem(key,JSON.stringify({days,quotes:parsed.quotes||{}}));
      localStorage.setItem(`${key}_${CONFIG.migrationKey}`,"1");
    }catch(e){ console.warn("Migracja dat nieudana",e); }
  }
};
