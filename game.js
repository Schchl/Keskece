let CATS={};
const $=id=>document.getElementById(id);
const show=id=>{document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('on',s.id===id))};
let cat,deck=[],cur="",score=0,left=60,timer=null,state="menu",locked=true,log=[],tiltOn=false,wake=null;
let duration=60,cd=null,qt=null;
try{duration=+localStorage.getItem('kk_dur')||60}catch(e){}
function setDur(s){duration=s;try{localStorage.setItem('kk_dur',s)}catch(e){}
  document.querySelectorAll('#durs button').forEach(b=>b.classList.toggle('on',+b.dataset.s===s))}
$('durs').onclick=e=>{const b=e.target.closest('button');if(b)setDur(+b.dataset.s)};
setDur(duration);

// Menu (chargé depuis data.json)
function buildMenu(){$('grid').innerHTML=Object.entries(CATS).map(([k,v])=>`<button class="cat" style="--c:${v.c}" data-k="${k}"><span class="em">${v.e}</span><b>${v.n}</b></button>`).join('');}
fetch('data.json').then(r=>r.json()).then(d=>{CATS=d;buildMenu()}).catch(()=>{$('grid').innerHTML='<p>Impossible de charger data.json (ouvre le jeu via GitHub Pages ou un serveur local).</p>'});
$('grid').onclick=e=>{const b=e.target.closest('.cat');if(!b)return;cat=b.dataset.k;
  document.documentElement.style.setProperty('--c',CATS[cat].c);$('rEm').textContent=CATS[cat].e;
  $('rTitle').textContent=CATS[cat].n;show('ready')};
$('back').onclick=()=>show('menu');
$('menuBtn').onclick=()=>show('menu');
$('again').onclick=()=>start();
$('go').onclick=start;

function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a}
function nextWord(){if(!deck.length)deck=shuffle(CATS[cat].w);cur=deck.pop();$('word').textContent=cur}

// Capteur d'orientation (iOS demande une autorisation)
async function enableTilt(){
  if(tiltOn)return;
  try{
    if(typeof DeviceOrientationEvent!=="undefined"&&typeof DeviceOrientationEvent.requestPermission==="function"){
      const r=await DeviceOrientationEvent.requestPermission();if(r!=="granted")return}
    addEventListener('deviceorientation',onTilt);tiltOn=true;
  }catch(e){}
}
function onTilt(e){
  if(state!=="play"||e.beta==null||e.gamma==null)return;
  const z=Math.cos(e.beta*Math.PI/180)*Math.cos(e.gamma*Math.PI/180); // +1 écran vers le ciel, -1 vers le sol
  if(locked){if(Math.abs(z)<0.3)locked=false;return}
  if(z<-0.6)act(true);else if(z>0.6)act(false);
}

async function start(){
  await enableTilt();
  try{await document.documentElement.requestFullscreen();await screen.orientation.lock('landscape')}catch(e){}
  try{wake=await navigator.wakeLock.request('screen')}catch(e){}
  resetQuit();deck=shuffle(CATS[cat].w);score=0;log=[];left=duration;
  $('score').textContent=0;$('time').textContent=duration;$('bar').style.transition='none';$('bar').style.width='100%';
  show('play');state="count";locked=true;
  let n=3;$('word').textContent="Prépare-toi… "+n;
  cd=setInterval(()=>{n--;if(n>0)$('word').textContent="Prépare-toi… "+n;
    else{clearInterval(cd);state="play";nextWord();beep(660,.15);run()}},1000);
}
function run(){
  $('bar').style.transition='width '+duration+'s linear';$('bar').style.width='0%';
  timer=setInterval(()=>{left--;$('time').textContent=left;if(left<=5&&left>0)beep(880,.08);if(left<=0)finish()},1000);
}
function act(ok){
  if(state!=="play")return;
  locked=true;log.push({w:cur,ok});
  if(ok){score++;$('score').textContent=score;beep(900,.15)}else beep(300,.15);
  if(navigator.vibrate)navigator.vibrate(ok?[160]:[70,60,70]); // trouvé = 1 vibration longue, passé = 2 courtes
  const p=$('play'),f=$('flash');
  p.classList.add(ok?'ok':'no');f.textContent=ok?"TROUVÉ !":"PASSE";f.classList.remove('show');void f.offsetWidth;f.classList.add('show');
  $('word').style.visibility='hidden';state="flash";
  setTimeout(()=>{p.classList.remove('ok','no');$('word').style.visibility='visible';
    if(state==="flash"&&left>0){state="play";nextWord()}},600);
}
function finish(){
  resetQuit();clearInterval(timer);
  if(state==="play")log.push({w:cur,ok:false}); // mot affiché à la fin du temps = non deviné
  state="end";beep(440,.5);
  if(wake)wake.release().catch(()=>{});
  if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});
  $('eScore').textContent=score+(score>1?" mots trouvés":" mot trouvé");
  $('eCat').textContent=CATS[cat].e+" "+CATS[cat].n;
  $('eList').innerHTML=log.map(l=>`<li class="${l.ok?'ok':'no'}">${l.w}</li>`).join('');
  show('end');
}

// Quitter la partie (2 touches pour éviter un appui par erreur)
function resetQuit(){clearTimeout(qt);$('quit').classList.remove('sure');$('quit').textContent='✕'}
function quit(){
  clearInterval(cd);clearInterval(timer);state="menu";resetQuit();
  if(wake)wake.release().catch(()=>{});
  if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});
  $('play').classList.remove('ok','no');$('word').style.visibility='visible';
  show('menu');
}
$('quit').onclick=e=>{e.stopPropagation();
  if($('quit').classList.contains('sure'))return quit();
  $('quit').classList.add('sure');$('quit').textContent='Quitter ?';qt=setTimeout(resetQuit,2500)};

// Secours : toucher l'écran ou clavier
$('play').addEventListener('click',e=>{if(state==="play")act(e.clientX>innerWidth/2)});
addEventListener('keydown',e=>{if(e.key==="ArrowDown"||e.key==="ArrowRight")act(true);if(e.key==="ArrowUp"||e.key==="ArrowLeft")act(false)});

// Sons
let ac;function beep(f,d){try{ac=ac||new(window.AudioContext||window.webkitAudioContext)();const o=ac.createOscillator(),g=ac.createGain();
  o.frequency.value=f;g.gain.value=.15;o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+d)}catch(e){}}