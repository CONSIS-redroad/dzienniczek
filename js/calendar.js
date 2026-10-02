const Calendar={
 render(){
  const ref=AppState.calendarDate,y=ref.getFullYear(),m=ref.getMonth(),cal=document.getElementById("calendar");
  document.getElementById("month-label").textContent=`${Polish.months[m]} ${y}`;cal.replaceChildren();
  const first=new Date(y,m,1),start=(first.getDay()+6)%7,total=new Date(y,m+1,0).getDate();let day=1;
  for(let r=0;r<6;r++){const tr=document.createElement("tr");for(let c=0;c<7;c++){const td=document.createElement("td");if((r===0&&c<start)||day>total){td.className="cal-empty";}else{const d=new Date(y,m,day),key=dateKey(d);td.textContent=day++;td.dataset.key=key;td.tabIndex=0;if(key===todayKey())td.classList.add("cal-today");if(hasEntry(AppState.days[key]))td.classList.add("cal-has-entry");const open=()=>Modal.open(key);td.addEventListener("click",open);td.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();open();}});}tr.appendChild(td);}cal.appendChild(tr);}
 },
 prev(){this.shift(-1);},
 next(){this.shift(1);},
 shift(n){const d=AppState.calendarDate;AppState.calendarDate=new Date(d.getFullYear(),d.getMonth()+n,1);this.render();}
};
