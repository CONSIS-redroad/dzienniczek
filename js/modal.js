const Modal={
 open(key){
  AppState.currentDay=key;if(!AppState.days[key])AppState.days[key]=blankDay();const day=AppState.days[key];
  document.getElementById("modal-date").textContent=displayDate(key);const box=document.getElementById("symptoms-box");box.replaceChildren();
  SYMPTOMS.forEach((sym,i)=>{const label=document.createElement("label");label.className="symptom-row";const cb=document.createElement("input");cb.type="checkbox";cb.checked=!!day.symptoms[i];cb.addEventListener("change",()=>{day.symptoms[i]=cb.checked;this.clean();App.persist();});const num=document.createElement("span");num.className="symptom-num";num.textContent=`${i+1}.`;const name=document.createElement("span");name.textContent=sym;label.append(cb,num,name);box.append(label);});
  const note=document.getElementById("note-box");note.value=day.note||"";document.getElementById("note-count").textContent=`${note.value.length} / 500`;
  const overlay=document.getElementById("modal-overlay");overlay.classList.add("open");overlay.setAttribute("aria-hidden","false");document.body.classList.add("modal-open");
 },
 close(){document.getElementById("modal-overlay").classList.remove("open");document.getElementById("modal-overlay").setAttribute("aria-hidden","true");document.body.classList.remove("modal-open");AppState.currentDay=null;},
 noteChanged(value){const key=AppState.currentDay;if(!key)return;AppState.days[key].note=value;document.getElementById("note-count").textContent=`${value.length} / 500`;this.clean();App.persist();},
 clean(){const key=AppState.currentDay;if(key&&AppState.days[key]&&!hasEntry(AppState.days[key]))delete AppState.days[key];}
};
