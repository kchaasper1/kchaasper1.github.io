// ---- Main: simulation loop and start button ----
statusEl.textContent = firebaseOk
  ? "Multiplayer connected."
  : "Running solo — add your Firebase config in js/config.js to enable multiplayer.";

// One simulation step (called 60 times per second of game time)
function update(){
  updatePlayer();
  updateBullets();
  updatePedestrians();
  updatePayroll();
  updateBankInterest();
  updateMineNodes();
  updateGoons();
  refreshHud();
  updateCta();
}

const STEP_MS=1000/60;
let lastTick=Date.now();
function tick(){
  const now=Date.now();
  const raw=Math.floor((now-lastTick)/STEP_MS);
  if(raw<1) return;
  const steps=Math.min(raw,180);               // catch up at most ~3s at once
  lastTick = raw>180 ? now : lastTick+steps*STEP_MS;
  for(let i=0;i<steps;i++) update();
}

function startSimulation(){
  lastTick=Date.now();
  try{
    // a Web Worker's timer isn't throttled as hard as the page's own timers in background tabs
    const w=new Worker(URL.createObjectURL(new Blob(['setInterval(()=>postMessage(0),16)'],{type:'text/javascript'})));
    w.onmessage=tick;
  }catch(e){
    setInterval(tick,16);
  }
}

document.getElementById('startBtn').onclick=()=>{
  if(touchMode){
    document.getElementById('hint').textContent='Tap to walk. Tap a door, the alley or a mini-game spot while standing at it to use it.';
    fireBtn.style.display='inline-block';
    runBtn.style.display='inline-block';
  }

  myName=document.getElementById('nameInput').value.trim() || 'Guest';
  myId='p'+Math.random().toString(36).slice(2,9);
  myColor=`hsl(${Math.floor(Math.random()*360)},70%,60%)`;
  startScreen.style.display='none';
  gameWrap.style.display='flex';
  initMultiplayer();
  requestAnimationFrame(loop);
  startSimulation();
};

