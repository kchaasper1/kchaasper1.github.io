// ---- Input: keyboard, touch, buttons ----
const touchMode = window.matchMedia('(pointer: coarse)').matches; // set to true to test on desktop

// Keyboard
document.addEventListener('keydown',e=>{
  if(e.target.tagName==='INPUT' || document.querySelector('.modal.active')) return;
  keys[e.key.toLowerCase()]=true;
  if(e.key.toLowerCase()==='e' && !e.repeat) onInteract();
  if(e.key===' '){ e.preventDefault(); fireBullet(); }
});
document.addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
window.addEventListener('blur',()=>{ for(const k in keys) keys[k]=false; });

// On-screen buttons
runBtn.addEventListener('pointerdown',e=>{
  e.preventDefault();
  runOn=!runOn;
  runBtn.textContent=runOn?'🏃 Run: ON':'🏃 Run: OFF';
});
fireBtn.addEventListener('pointerdown',e=>{ e.preventDefault(); fireBullet(); });
playCta.onclick=()=>onInteract();

// Touch / tap-to-move
function canvasPoint(e){
  const r=canvas.getBoundingClientRect();
  let x=(e.clientX-r.left)*canvas.width/r.width+cam.x;
  let y=(e.clientY-r.top)*canvas.height/r.height+cam.y;
  if(scene==='outside'){ x=wrapX(x); y=wrapY(y); }
  return {x,y};
}

// returns the interactive spot under a tap (door, alley, exit, mini-game pad, ore), if any
function tappedInteractable(x,y){
  if(scene==='outside'){
    const doors=[
      {x:outside.door.x+outside.door.w/2,y:outside.door.y},
      {x:bankDoor.x+bankDoor.w/2,y:bankDoor.y},
      ...enterables.map(en=>({x:en.door.x+en.door.w/2,y:en.door.y}))
    ];
    for(const d of doors) if(Math.hypot(x-d.x,y-d.y)<40) return {x:d.x,y:d.y,r:35};
    if(x>alley.x&&x<alley.x+alley.w&&y>alley.y&&y<alley.y+alley.h)
      return {x:alley.x+alley.w/2,y:alley.y+alley.h/2,r:70};
  } else if(scene==='mine'){
    if(Math.hypot(x-mineExit.x,y-mineExit.y)<40) return {x:mineExit.x,y:mineExit.y,r:35};
    for(const n of mineNodes)
      if(n.hp>0 && Math.hypot(x-n.x,y-n.y)<28) return {x:n.x,y:n.y,r:34};
  } else {
    if(Math.hypot(x-insideExit.x,y-insideExit.y)<40) return {x:insideExit.x,y:insideExit.y,r:35};
    for(const r of rooms)
      if(Math.hypot(x-r.pad.x,y-r.pad.y)<40) return {x:r.pad.x,y:r.pad.y,r:40};
  }
  return null;
}

let pointerDown=false;
canvas.addEventListener('pointerdown',e=>{
  if(!touchMode) return;
  e.preventDefault();
  pointerDown=true;
  const p=canvasPoint(e);
  const t=tappedInteractable(p.x,p.y);
  if(t){
    if(Math.hypot(player.x-t.x,player.y-t.y)<t.r) onInteract(); // already there: act
    else moveTarget={x:t.x,y:t.y};                              // otherwise walk there first
  } else {
    moveTarget=p;
  }
});
canvas.addEventListener('pointermove',e=>{       // dragging a finger steers
  if(!touchMode||!pointerDown) return;
  const p=canvasPoint(e);
  if(!tappedInteractable(p.x,p.y)) moveTarget=p;
});
window.addEventListener('pointerup',()=>pointerDown=false);

