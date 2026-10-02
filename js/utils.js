const Polish = {
  months: ["styczeń","luty","marzec","kwiecień","maj","czerwiec","lipiec","sierpień","wrzesień","październik","listopad","grudzień"],
  monthsGen: ["stycznia","lutego","marca","kwietnia","maja","czerwca","lipca","sierpnia","września","października","listopada","grudnia"]
};
function dateKey(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;}
function todayKey(){return dateKey(new Date());}
function displayDate(key){return key.split("-").reverse().join(".");}
function hasEntry(day){return !!day && ((Array.isArray(day.symptoms) && day.symptoms.some(Boolean)) || !!day.note?.trim());}
function blankDay(){return {symptoms:Array(SYMPTOMS.length).fill(false),note:""};}
function showToast(message,type="ok"){const el=document.getElementById("toast");if(!el)return;el.textContent=message;el.className=`toast toast--${type} toast--visible`;clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>el.className="toast",2800);}
