const App={
 async onLogin(){
  if(!AppState.user)return;Storage.migrateOldLocalDates();const saved=Storage.load();AppState.days=saved.days||{};AppState.quotes=saved.quotes||{};UI.init();
 },
 onLogout(){UI.reset();},
 persist(){Storage.save();Calendar.render();Statistics.render();}
};
const UI={
 init(){document.getElementById("today-label").textContent=`${new Date().getDate()} ${Polish.monthsGen[new Date().getMonth()]} ${new Date().getFullYear()} r.`;Calendar.render();Statistics.render();Quotes.render();},
 reset(){document.getElementById("calendar").replaceChildren();}
};
document.addEventListener("DOMContentLoaded",()=>{
 Auth.init();
 document.getElementById("btn-demo-login")?.addEventListener("click",()=>Auth.demo());document.getElementById("btn-logout")?.addEventListener("click",()=>Auth.logout());
 document.getElementById("btn-clear-data")?.addEventListener("click",()=>{if(confirm("Czy na pewno chcesz usunąć wszystkie zapisane wpisy dla tego konta?")){Storage.clear();AppState.days={};Calendar.render();Statistics.render();showToast("Wpisy zostały usunięte");}});
 document.getElementById("btn-refresh-quote")?.addEventListener("click",()=>Quotes.random());
 const panel=document.getElementById("add-quote-panel"),input=document.getElementById("quote-input");document.getElementById("btn-add-quote-toggle")?.addEventListener("click",()=>{panel.hidden=!panel.hidden;if(!panel.hidden)input.focus();});input?.addEventListener("input",()=>document.getElementById("quote-char-count").textContent=`${input.value.length} / 200`);document.getElementById("btn-save-quote")?.addEventListener("click",()=>{Quotes.save(input.value);input.value="";document.getElementById("quote-char-count").textContent="0 / 200";panel.hidden=true;showToast("Cytat dodany ✓");});
 document.getElementById("btn-prev-month")?.addEventListener("click",()=>Calendar.prev());document.getElementById("btn-next-month")?.addEventListener("click",()=>Calendar.next());document.getElementById("btn-month-view")?.addEventListener("click",()=>MonthView.open());document.getElementById("btn-close-month")?.addEventListener("click",()=>MonthView.close());document.getElementById("btn-print-month")?.addEventListener("click",()=>MonthView.print());
 document.getElementById("month-overlay")?.addEventListener("click",e=>{if(e.target===e.currentTarget)MonthView.close();});document.getElementById("modal-overlay")?.addEventListener("click",e=>{if(e.target===e.currentTarget)Modal.close();});document.getElementById("btn-close-modal")?.addEventListener("click",()=>Modal.close());document.getElementById("btn-close-modal-2")?.addEventListener("click",()=>Modal.close());document.getElementById("note-box")?.addEventListener("input",e=>Modal.noteChanged(e.target.value));
 document.getElementById("btn-toggle-side")?.addEventListener("click",e=>{const p=document.getElementById("side-panels"),open=p.classList.toggle("open");e.currentTarget.setAttribute("aria-expanded",String(open));if(open)p.scrollIntoView({behavior:"smooth",block:"nearest"});});document.getElementById("btn-scroll-login")?.addEventListener("click",()=>document.getElementById("landing")?.scrollIntoView({behavior:"smooth"}));
 document.addEventListener("keydown",e=>{if(e.key==="Escape"){Modal.close();MonthView.close();}});
 let deferredPrompt=null;window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;const b=document.getElementById("btn-install");b.style.display="flex";document.getElementById("install-divider").style.display="block";});document.getElementById("btn-install")?.addEventListener("click",async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;document.getElementById("btn-install").style.display="none";document.getElementById("install-divider").style.display="none";});
 Pwa.init();
});
