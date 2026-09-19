
const app=document.getElementById("app");let DATA=null;
const colors=["","green","orange","pink","cyan"];
async function load(){
 try{
  const r=await fetch("data.json?"+Date.now(),{cache:"no-store"});
  if(!r.ok) throw new Error("HTTP "+r.status);
  DATA=await r.json(); renderClasses();
 }catch(e){
  app.innerHTML=`<div class="error"><b>❌ data.json लोड नहीं हुआ</b><br>GitHub में index.html, app.js, style.css और data.json एक ही folder में रखें।<br><small>${e.message}</small></div>`;
 }
}
function box(title,sub=""){
 app.innerHTML="";
 const c=document.createElement("div");c.className="card";
 c.innerHTML=`<div class="title">${title}</div>${sub?`<div class="sub">${sub}</div>`:""}`;
 app.appendChild(c);return c;
}
function button(name,fn,cl=""){
 const b=document.createElement("button");b.className=`btn ${cl}`;b.textContent=name;b.onclick=fn;return b;
}
function back(c,fn){let b=button("← वापस",fn,"back");c.prepend(b)}
function renderClasses(){
 const c=box("📚 कक्षा चुनें","अपनी कक्षा चुनें और फिर विषय → अध्याय → Topic पर जाएँ।");
 const g=document.createElement("div");g.className="grid";
 Object.keys(DATA.classes).forEach((k,i)=>g.appendChild(button(`कक्षा ${k}`,()=>renderSubjects(k),colors[i%colors.length])));
 c.appendChild(g);
}
function renderSubjects(k){
 const c=box(`🎓 कक्षा ${k}`,"विषय चुनें");
 back(c,renderClasses);const g=document.createElement("div");g.className="grid";
 Object.values(DATA.classes[k].subjects).forEach((s,i)=>g.appendChild(button(`📘 ${s.name}`,()=>renderChapters(k,s),colors[i%colors.length])));
 c.appendChild(g);
}
function renderChapters(k,s){
 const c=box(`📖 ${s.name}`,"अध्याय चुनें — प्रत्येक अध्याय के अंदर Topic-wise प्रश्न हैं।");
 back(c,()=>renderSubjects(k));const g=document.createElement("div");g.className="grid";
 s.chapters.forEach((ch,i)=>{
   let n=ch.topics.reduce((a,t)=>a+(t.questions||[]).length,0);
   let b=button(`📕 ${ch.name}`,()=>renderTopics(k,s,ch),colors[i%colors.length]);
   b.innerHTML=`📕 ${ch.name}<small>${ch.topics.length} Topic • ${n} प्रश्न</small>`;
   g.appendChild(b);
 });
 c.appendChild(g);
}
function renderTopics(k,s,ch){
 const c=box(`🧩 ${ch.name}`,"नीचे किसी भी Topic पर क्लिक करें। हर Topic में 25 प्रश्न हैं।");
 back(c,()=>renderChapters(k,s));const g=document.createElement("div");g.className="grid";
 ch.topics.forEach((t,i)=>{
   let b=button(`📝 ${t.name}`,()=>quiz(k,s,ch,t),colors[i%colors.length]);
   b.className+=" topic";
   b.innerHTML=`📝 ${t.name}<small>25 प्रश्न • उत्तर + Concept</small>`;
   g.appendChild(b);
 });
 c.appendChild(g);
}
function quiz(k,s,ch,t){
 const qs=t.questions||[];
 const c=box(`📝 ${t.name}`,`कक्षा ${k} • ${s.name} • ${ch.name}`);
 back(c,()=>renderTopics(k,s,ch));
 const st=document.createElement("div");st.className="stats";
 st.innerHTML=`<span class="pill">कुल प्रश्न: ${qs.length}</span><span class="pill">सही उत्तर: Green</span><span class="pill">गलत उत्तर: Red</span>`;
 c.appendChild(st);
 if(!qs.length){c.insertAdjacentHTML("beforeend",`<div class="error">इस Topic में अभी प्रश्न नहीं हैं।</div>`);return}
 qs.forEach((q,i)=>{
  const card=document.createElement("div");card.className="card qcard";
  card.innerHTML=`<span class="qnum">प्रश्न ${i+1} / ${qs.length}</span><div class="q">${esc(q.q)}</div>`;
  q.options.forEach((o,j)=>{
   const b=document.createElement("button");b.className="opt";b.textContent=String.fromCharCode(65+j)+". "+o;
   b.onclick=()=>{
    card.querySelectorAll(".opt").forEach((x,n)=>{x.disabled=true;if(n===q.answer)x.classList.add("ok");else if(n===j)x.classList.add("bad")});
    card.querySelector(".solution").style.display="block";
   };
   card.appendChild(b);
  });
  const sol=document.createElement("div");sol.className="solution";sol.innerHTML=`<b>✅ उत्तर / Concept:</b> ${esc(q.solution||"सही उत्तर ऊपर Green में दिखाया गया है।")}`;
  card.appendChild(sol);c.appendChild(card);
 });
 window.scrollTo({top:0,behavior:"smooth"});
}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]))}
load();
