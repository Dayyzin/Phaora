(()=>{
'use strict';
const $=s=>document.querySelector(s);
const au=$('#au'),list=$('#list'),q=$('#q');
let DB,tracks=[],favs=new Set(),recent=[],mode='all',src=null,artistSel=null,cur=-1,queue=[],shuf=false,rep=0,objURL=null;

// ---------- storage ----------
function openDB(){return new Promise((ok,no)=>{const r=indexedDB.open('sertanejo',1);r.onupgradeneeded=()=>{const d=r.result;d.createObjectStore('tracks',{keyPath:'id'});d.createObjectStore('meta')};r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)})}
const tx=(st,m='readonly')=>DB.transaction(st,m).objectStore(st);
const req=r=>new Promise((ok,no)=>{r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)});
async function loadAll(){
 tracks=(await req(tx('tracks').getAll())).map(t=>({...t,blob:undefined}));
 tracks.sort((a,b)=>a.artist.localeCompare(b.artist,'pt')||a.title.localeCompare(b.title,'pt'));
 favs=new Set((await req(tx('meta').get('favs')))||[]);
 recent=(await req(tx('meta').get('recent')))||[];
 const s=(await req(tx('meta').get('settings')))||{};shuf=!!s.shuf;rep=s.rep||0;au.volume=s.vol??1;$('#vol').value=Math.round(au.volume*100);
}
const saveMeta=(k,v)=>req(tx('meta','readwrite').put(v,k));
const saveSettings=()=>saveMeta('settings',{shuf,rep,vol:au.volume});
async function getBlob(id){const t=await req(tx('tracks').get(id));return t&&t.blob}

// ---------- tags ----------
function synch(b){return (b[0]&127)<<21|(b[1]&127)<<14|(b[2]&127)<<7|(b[3]&127)}
function dec(bytes,enc){try{if(enc===1||enc===2){const le=enc===1?(bytes[0]===0xFF):false;let s=new TextDecoder(le||enc===1?'utf-16le':'utf-16be').decode(enc===1?bytes.subarray(2):bytes);return s}return new TextDecoder(enc===3?'utf-8':'latin1').decode(bytes)}catch{return''}}
async function id3(file){
 try{const h=new Uint8Array(await file.slice(0,10).arrayBuffer());if(h[0]!==73||h[1]!==68||h[2]!==51)return{};
  const v=h[3],size=synch(h.subarray(6,10)),b=new Uint8Array(await file.slice(10,10+Math.min(size,262144)).arrayBuffer());const out={};let i=0;
  while(i+10<b.length){const id=String.fromCharCode(...b.subarray(i,i+4));if(!/^[A-Z0-9]{4}$/.test(id))break;
   const fs=v===4?synch(b.subarray(i+4,i+8)):(b[i+4]<<24|b[i+5]<<16|b[i+6]<<8|b[i+7])>>>0;
   if(id==='TIT2'||id==='TPE1'||id==='TALB'){const d=b.subarray(i+10,i+10+fs);out[id]=dec(d.subarray(1),d[0]).replace(/\0/g,'').trim()}
   i+=10+fs}
  return{title:out.TIT2,artist:out.TPE1,album:out.TALB}}catch{return{}}
}
function fromName(n){n=n.replace(/\.[^.]+$/,'').replace(/_/g,' ').replace(/^\d{1,3}[\s.\-]+/,'').trim();const m=n.split(/\s+[-–—]\s+/);return m.length>1?{artist:m[0].trim(),title:m.slice(1).join(' - ').trim()}:{title:n}}
const dur=f=>new Promise(ok=>{const a=new Audio();const u=URL.createObjectURL(f);a.preload='metadata';a.onloadedmetadata=()=>{ok(a.duration||0);URL.revokeObjectURL(u)};a.onerror=()=>{ok(0);URL.revokeObjectURL(u)};a.src=u});

async function importFiles(files){
 files=[...files].filter(f=>/^audio\//.test(f.type)||/\.(mp3|m4a|aac|wav|flac|ogg|opus)$/i.test(f.name));if(!files.length)return;
 const label=(prompt('Nome da coletânea:','Importadas '+new Date().toLocaleDateString('pt-BR'))||'Sem coletânea').trim();
 badge(`Importando 0/${files.length}`);let n=0;
 for(const f of files){
  const tag=await id3(f),nm=fromName(f.name);
  const t={id:'t'+Date.now().toString(36)+Math.random().toString(36).slice(2,7),title:tag.title||nm.title,artist:tag.artist||nm.artist||'Desconhecido',album:tag.album||'',src:label,dur:await dur(f),added:Date.now(),type:f.type,blob:f};
  await req(tx('tracks','readwrite').put(t));n++;badge(`Importando ${n}/${files.length}`)}
 await loadAll();render();badge();
}
async function removeTrack(id){if(!confirm('Remover esta faixa do aparelho?'))return;await req(tx('tracks','readwrite').delete(id));favs.delete(id);recent=recent.filter(x=>x!==id);saveMeta('favs',[...favs]);saveMeta('recent',recent);const playing=queue[cur]===id;await loadAll();if(playing){au.pause();cur=-1;queue=[];setNow(null)}render()}

// ---------- view ----------
const fmt=s=>!isFinite(s)||s<0?'0:00':Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');
const hue=s=>{let h=0;for(const c of s)h=(h*31+c.charCodeAt(0))%360;return h};
const grad=s=>`linear-gradient(140deg,hsl(${hue(s)} 55% 42%),hsl(${(hue(s)+40)%360} 60% 20%))`;
const ini=s=>s.split(/\s+/).filter(w=>/^[\p{L}\p{N}]/u.test(w)).slice(0,2).map(w=>w[0]).join('').toUpperCase()||'S';
const esc=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function badge(t){$('#badge').textContent=t||`${tracks.length} faixas · offline`}
function visible(){
 let v=tracks;
 if(mode==='fav')v=v.filter(t=>favs.has(t.id));
 if(mode==='recent'){const m=new Map(tracks.map(t=>[t.id,t]));v=recent.map(id=>m.get(id)).filter(Boolean)}
 if(src)v=v.filter(t=>t.src===src);
 if(artistSel)v=v.filter(t=>t.artist===artistSel);
 const s=q.value.trim().toLowerCase();if(s)v=v.filter(t=>(t.title+' '+t.artist+' '+t.album).toLowerCase().includes(s));
 return v}
function render(){
 $('#c-all').textContent=tracks.length||'';$('#c-fav').textContent=favs.size||'';
 const srcs=[...new Set(tracks.map(t=>t.src))].sort();
 $('#srcs').innerHTML=srcs.map(s=>`<button data-src="${esc(s)}" class="${s===src?'on':''}">${esc(s)}</button>`).join('')+`<button data-act="import">＋ Adicionar músicas</button>`;
 if(!tracks.length){list.innerHTML=`<div class="empty">Nenhuma música no aparelho ainda.<br><br><button class="big" style="width:auto;height:auto;padding:12px 20px;border-radius:99px;display:inline-block" data-act="import">＋ Adicionar músicas do Arquivos</button><br><br><small>As músicas ficam só neste aparelho e tocam sem internet.</small></div>`;return}
 if(mode==='artists'&&!artistSel&&!q.value.trim()){
  const a=new Map();for(const t of (src?tracks.filter(x=>x.src===src):tracks))a.set(t.artist,(a.get(t.artist)||0)+1);
  list.innerHTML=`<div class="lhead">Artistas<span class="sp"></span>${a.size}</div>`+[...a].sort((x,y)=>x[0].localeCompare(y[0],'pt')).map(([n,c])=>`<div class="row" data-artist="${esc(n)}"><div class="mini" style="background:${grad(n)}">${esc(ini(n))}</div><div class="mid"><div class="t">${esc(n)}</div><div class="a">${c} faixa${c>1?'s':''}</div></div></div>`).join('');return}
 const v=visible(),playing=queue[cur];
 const title=artistSel?`← ${esc(artistSel)}`:{all:'Todas as faixas',fav:'Favoritas',recent:'Recentes',artists:'Busca'}[mode];
 list.innerHTML=`<div class="lhead"><span ${artistSel?'data-act="back" style="cursor:pointer"':''}>${title}</span><span class="sp"></span>${v.length}</div>`+(v.length?v.map((t,i)=>`<div class="row${t.id===playing?' on':''}" data-id="${t.id}"><span class="num">${i+1}</span><div class="mini" style="background:${grad(t.artist)}">${esc(ini(t.artist))}</div><div class="mid"><div class="t">${esc(t.title)}</div><div class="a">${esc(t.artist)}${t.dur?' · '+fmt(t.dur):''}</div></div><span class="eq"><i></i><i></i><i></i></span><button class="fav${favs.has(t.id)?' on':''}" data-fav="${t.id}" aria-label="Favoritar">${favs.has(t.id)?'♥':'♡'}</button><button class="fav" data-del="${t.id}" aria-label="Remover">✕</button></div>`).join(''):`<div class="empty">Nada aqui.</div>`);
}
function setNow(t){
 $('#nt').textContent=t?t.title:'Nada tocando';
 $('#na').innerHTML=t?`${esc(t.artist)} <span>·</span> ${esc(t.src)}`:`Escolha uma faixa <span>·</span> aleatório ${shuf?'ligado':'desligado'}`;
 $('#cover').style.background=t?grad(t.artist):'';$('#ini').textContent=t?ini(t.artist):'S';
 document.title=t?`${t.title} · ${t.artist}`:'Sertanejo';
 if('mediaSession' in navigator)navigator.mediaSession.metadata=t?new MediaMetadata({title:t.title,artist:t.artist,album:t.src}):null;
}
function setBtns(){$('#shuf').classList.toggle('on',shuf);$('#rep').classList.toggle('on',rep>0);$('#rep').title=['Repetir: desligado','Repetir: tudo','Repetir: uma'][rep]+' (R)';$('#rep').style.opacity=rep===2?1:'';$('#rep').dataset.one=rep===2?'1':''}

// ---------- playback ----------
async function playAt(i){
 if(i<0||i>=queue.length)return;cur=i;const id=queue[i],t=tracks.find(x=>x.id===id);if(!t)return;
 const b=await getBlob(id);if(!b)return;if(objURL)URL.revokeObjectURL(objURL);objURL=URL.createObjectURL(b);
 au.src=objURL;setNow(t);try{await au.play()}catch{}
 recent=[id,...recent.filter(x=>x!==id)].slice(0,60);saveMeta('recent',recent);render()}
function buildQueue(startId){const ids=visible().map(t=>t.id);if(shuf){const rest=ids.filter(x=>x!==startId);for(let i=rest.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[rest[i],rest[j]]=[rest[j],rest[i]]}queue=startId?[startId,...rest]:rest}else queue=ids;return Math.max(0,queue.indexOf(startId))}
function next(auto){if(!queue.length){if(tracks.length)playAt(buildQueue(null));return}if(auto&&rep===2)return playAt(cur);if(cur+1<queue.length)playAt(cur+1);else if(rep===1||!auto)playAt(0);else{au.pause()}}
function prev(){if(au.currentTime>3){au.currentTime=0;return}playAt(cur>0?cur-1:queue.length-1)}
function toggle(){if(!au.src){if(tracks.length)playAt(buildQueue(visible()[0]?.id));return}au.paused?au.play():au.pause()}

au.addEventListener('play',()=>{document.body.classList.add('playing');$('#ic-play').style.display='none';$('#ic-pause').style.display=''});
au.addEventListener('pause',()=>{document.body.classList.remove('playing');$('#ic-play').style.display='';$('#ic-pause').style.display='none'});
au.addEventListener('ended',()=>next(true));
au.addEventListener('timeupdate',()=>{const p=au.duration?au.currentTime/au.duration:0;$('#seek').value=Math.round(p*1000);$('#seek').style.setProperty('--p',p*100+'%');$('#cur').textContent=fmt(au.currentTime);$('#dur').textContent=fmt(au.duration)});
$('#seek').addEventListener('input',e=>{if(au.duration)au.currentTime=e.target.value/1000*au.duration});
$('#vol').addEventListener('input',e=>{au.volume=e.target.value/100;au.muted=false;saveSettings()});
$('#mute').onclick=()=>{au.muted=!au.muted;$('#mute').style.opacity=au.muted?.4:1};
$('#play').onclick=toggle;$('#next').onclick=()=>next(false);$('#prev').onclick=prev;
$('#shuf').onclick=()=>{shuf=!shuf;if(cur>=0){const id=queue[cur];cur=buildQueue(id)}setBtns();setNow(tracks.find(t=>t.id===queue[cur])||null);saveSettings()};
$('#rep').onclick=()=>{rep=(rep+1)%3;setBtns();saveSettings()};
if('mediaSession' in navigator){const ms=navigator.mediaSession;ms.setActionHandler('play',()=>au.play());ms.setActionHandler('pause',()=>au.pause());ms.setActionHandler('nexttrack',()=>next(false));ms.setActionHandler('previoustrack',prev);try{ms.setActionHandler('seekto',d=>{au.currentTime=d.seekTime})}catch{}}

// ---------- events ----------
const fi=document.createElement('input');fi.type='file';fi.multiple=true;fi.accept='audio/*,.mp3,.m4a,.aac,.wav,.flac,.ogg,.opus';fi.style.display='none';document.body.appendChild(fi);
fi.onchange=()=>{importFiles(fi.files);fi.value=''};
document.addEventListener('click',e=>{
 const el=e.target.closest('[data-act],[data-src],[data-artist],[data-fav],[data-del],[data-id],[data-mode]');if(!el)return;
 if(el.dataset.act==='import')return fi.click();
 if(el.dataset.act==='back'){artistSel=null;return render()}
 if(el.dataset.mode){mode=el.dataset.mode;artistSel=null;src=null;document.querySelectorAll('#nav button').forEach(b=>b.classList.toggle('on',b===el));return render()}
 if(el.dataset.src!==undefined){src=src===el.dataset.src?null:el.dataset.src;return render()}
 if(el.dataset.artist){artistSel=el.dataset.artist;return render()}
 if(el.dataset.fav){e.stopPropagation();const id=el.dataset.fav;favs.has(id)?favs.delete(id):favs.add(id);saveMeta('favs',[...favs]);return render()}
 if(el.dataset.del){e.stopPropagation();return removeTrack(el.dataset.del)}
 if(el.dataset.id){playAt(buildQueue(el.dataset.id))}
});
q.addEventListener('input',render);
document.addEventListener('keydown',e=>{if(e.target===q)return;if(e.code==='Space'){e.preventDefault();toggle()}else if(e.key==='ArrowRight')next(false);else if(e.key==='ArrowLeft')prev();else if(e.key==='s'||e.key==='S')$('#shuf').click();else if(e.key==='r'||e.key==='R')$('#rep').click()});
document.addEventListener('dragover',e=>e.preventDefault());document.addEventListener('drop',e=>{e.preventDefault();importFiles(e.dataTransfer.files)});

// ---------- visualizer (drawn, no audio graph, so iPhone keeps playing in background) ----------
const cv=$('#viz'),cx=cv.getContext('2d');const N=48;const lv=new Array(N).fill(0);
(function draw(){const w=cv.width,h=cv.height;cx.clearRect(0,0,w,h);const on=!au.paused;const t=performance.now()/1000;
 for(let i=0;i<N;i++){const target=on?(.25+.75*Math.abs(Math.sin(t*2.1+i*.55)*Math.cos(t*1.3+i*.21)))*(.55+.45*Math.sin(i/N*Math.PI)):.06;lv[i]+=(target-lv[i])*.18;
  const bw=w/N,bh=Math.max(3,lv[i]*h);cx.fillStyle=i/N<(au.duration?au.currentTime/au.duration:0)?'#d4a94a':'#3a3a46';cx.fillRect(i*bw+1,(h-bh)/2,bw-3,bh)}
 requestAnimationFrame(draw)})();

// ---------- start ----------
(async()=>{
 if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
 if(navigator.storage&&navigator.storage.persist)navigator.storage.persist().catch(()=>{});
 DB=await openDB();await loadAll();setBtns();setNow(null);render();badge();
})();
})();
