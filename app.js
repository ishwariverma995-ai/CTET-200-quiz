(() => {
"use strict";

/*
  ROBUST ROUTER:
  - No subject name is hard-coded in navigation.
  - Every class/subject/chapter/topic has a unique ID.
  - URL hash stores the complete state.
  - Browser refresh/back/forward preserves the exact screen.
  - Future subjects are added ONLY to data.json.
*/
const $ = s => document.querySelector(s);
const app = $("#app");
let DATA = null;

const esc = s => String(s).replace(/[&<>"']/g, c => ({
 "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
}[c]));

function path(){
  const raw = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  return raw.map(decodeURIComponent);
}
function go(parts){
  location.hash = "/" + parts.map(encodeURIComponent).join("/");
}
function cls(id){ return DATA.classes[id]; }
function sub(cid,sid){ return DATA.classes[cid]?.subjects[sid]; }
function chapter(sid,chid){
  for(const c of Object.values(DATA.classes)){
    const s=c.subjects[sid]; if(s){ return s.chapters.find(x=>x.id===chid); }
  }
}
function topic(chid,tid){
  const ch=chapter("",chid);
  return ch?.topics.find(x=>x.id===tid);
}
function crumbs(items){
  return `<div class="crumb"><button class="back" onclick="history.back()">← पीछे</button>${
    items.map((x,i)=>`<button onclick='${x.go}'>${esc(x.name)}</button>`).join("")
  }</div>`;
}

function home(){
  const entries=Object.entries(DATA.classes);
  app.innerHTML=`<h2>कक्षा चुनें</h2><div class="grid">${
    entries.map(([id,c])=>`<div class="card" onclick='go(["${id}"])'>
      <div class="num">SST QUIZ</div><div class="title">कक्षा ${esc(id)}</div>
      <div class="num">${Object.keys(c.subjects).length} विषय</div>
    </div>`).join("")
  }</div>`;
}
function subjects(cid){
  const c=cls(cid); if(!c)return home();
  app.innerHTML=crumbs([{name:"कक्षा "+cid,go:"go([])"}])+`<h2>कक्षा ${esc(cid)} — विषय</h2>
  <div class="grid">${Object.entries(c.subjects).map(([sid,s])=>`
  <div class="card" onclick='go(["${cid}","${sid}"])'>
   <div class="num">विषय</div><div class="title">${esc(s.name)}</div>
   <div class="num">${s.chapters.length} chapters</div>
  </div>`).join("")}</div>`;
}
function chapters(cid,sid){
  const s=sub(cid,sid); if(!s)return subjects(cid);
  app.innerHTML=crumbs([
    {name:"कक्षा "+cid,go:`go(["${cid}"])`},
    {name:s.name,go:`go(["${cid}","${sid}"])`}
  ])+`<h2>${esc(s.name)} — Chapter</h2>
  ${s.chapters.map(ch=>`<section class="chapter">
   <h3>${esc(ch.name)}</h3>
   ${ch.topics.map(t=>`<button class="topic" onclick='go(["${cid}","${sid}","${ch.id}","${t.id}"])'>${esc(t.name)}</button>`).join("")}
  </section>`).join("")}`;
}
function quiz(cid,sid,chid,tid){
  const s=sub(cid,sid), ch=s?.chapters.find(x=>x.id===chid), t=ch?.topics.find(x=>x.id===tid);
  if(!t)return chapters(cid,sid);
  const qs=t.questions || [];
  app.innerHTML=crumbs([
    {name:"कक्षा "+cid,go:`go(["${cid}"])`},
    {name:s.name,go:`go(["${cid}","${sid}"])`},
    {name:ch.name,go:`go(["${cid}","${sid}","${chid}"])`}
  ])+`<h2>${esc(t.name)}</h2>`;
  if(!qs.length){
    app.innerHTML += `<div class="empty">इस topic में अभी प्रश्न नहीं जोड़े गए हैं।<br><br>
    <small>Questions इसी topic के <b>questions</b> array में डालें। बाकी routing अपने-आप सही रहेगी।</small></div>`;
    return;
  }
  let score=0;
  app.innerHTML += `<div class="score" id="score">स्कोर: 0 / ${qs.length}</div>`+
  qs.map((q,i)=>`<div class="q" data-i="${i}">
    <b>${i+1}. ${esc(q.q)}</b>
    <div>${q.options.map((o,j)=>`<button class="opt" data-j="${j}">${String.fromCharCode(65+j)}. ${esc(o)}</button>`).join("")}</div>
    <div class="solution" hidden><b>समाधान:</b> ${esc(q.solution||"सही उत्तर: "+q.options[q.answer])}</div>
  </div>`).join("");
  app.querySelectorAll(".q").forEach((box,i)=>{
    box.querySelectorAll(".opt").forEach((btn,j)=>btn.onclick=()=>{
      if(box.dataset.done)return;
      box.dataset.done="1";
      const correct=qs[i].answer;
      box.querySelectorAll(".opt")[correct]?.classList.add("ok");
      if(j!==correct)btn.classList.add("bad"); else score++;
      box.querySelector(".solution").hidden=false;
      $("#score").textContent=`स्कोर: ${score} / ${qs.length}`;
    });
  });
}
function render(){
  const p=path();
  if(p.length===0)return home();
  if(p.length===1)return subjects(p[0]);
  if(p.length===2)return chapters(p[0],p[1]);
  if(p.length===4)return quiz(p[0],p[1],p[2],p[3]);
  return home();
}
fetch("data.json",{cache:"no-store"}).then(r=>r.json()).then(d=>{
  DATA=d; render();
  window.addEventListener("hashchange",render);
}).catch(e=>app.innerHTML=`<div class="empty">data.json लोड नहीं हुआ। ZIP की सभी files एक साथ upload करें।</div>`);
window.go=go;
})();