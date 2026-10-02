const MonthView={
 open(){
  const ref=AppState.calendarDate,y=ref.getFullYear(),m=ref.getMonth(),days=new Date(y,m+1,0).getDate();document.getElementById("month-modal-title").textContent=`${Polish.months[m]} ${y}`;
  const wrap=document.getElementById("month-table-wrap"),table=document.createElement("table");table.className="month-table";const head=table.createTHead().insertRow();let th=document.createElement("th");th.textContent="Objaw";head.append(th);
  for(let d=1;d<=days;d++){th=document.createElement("th");th.textContent=d;head.append(th);}const body=table.createTBody();
  SYMPTOMS.forEach((sym,i)=>{const tr=body.insertRow(),name=tr.insertCell();name.textContent=`${i+1}. ${sym}`;for(let d=1;d<=days;d++){const td=tr.insertCell(),key=dateKey(new Date(y,m,d));if(AppState.days[key]?.symptoms?.[i]){td.textContent="✓";td.className="has-sym";}}});
  const sum=body.insertRow();sum.className="sum-row";sum.insertCell().textContent="SUMA";for(let d=1;d<=days;d++){const td=sum.insertCell(),key=dateKey(new Date(y,m,d)),n=(AppState.days[key]?.symptoms||[]).filter(Boolean).length;td.textContent=n||"";}
  wrap.replaceChildren(table);const overlay=document.getElementById("month-overlay");overlay.classList.add("open");overlay.setAttribute("aria-hidden","false");document.body.classList.add("modal-open");
 },
 close(){document.getElementById("month-overlay").classList.remove("open");document.getElementById("month-overlay").setAttribute("aria-hidden","true");document.body.classList.remove("modal-open");},
 print(){window.print();}
};
