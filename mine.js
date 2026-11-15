// ---- Mine ----
const ORE_COLORS={iron:'#aab0b8',copper:'#d08a50',gold:'#ffd34d'};
const minerals={iron:0,copper:0,gold:0};
const mineExit={x:30,y:230};
const mineNodes=[[150,100],[300,80],[450,120],[600,90],[200,230],[380,260],[560,240],[130,370],[320,380],[520,360],[650,330],[440,200]]
  .map(([x,y])=>{
    const r=Math.random();
    return {x,y,type:r<0.55?'iron':r<0.85?'copper':'gold',hp:3,respawnAt:0};
  });

function nearestOre(){
  let best=null, bd=34;
  mineNodes.forEach(n=>{
    if(n.hp<=0) return;
    const d=Math.hypot(n.x-player.x,n.y-player.y);
    if(d<bd){ bd=d; best=n; }
  });
  return best;
}

function mineOre(){
  const n=nearestOre();
  if(!n) return;
  n.hp--;
  if(n.hp<=0){
    minerals[n.type]++;
    n.respawnAt=Date.now()+20000;      // ore grows back after 20s
    toast('Mined '+n.type+'!');
  } else toast('Chip! '+n.hp+' more');
}

function updateMineNodes(){
  const now=Date.now();
  mineNodes.forEach(n=>{ if(n.hp<=0 && now>=n.respawnAt) n.hp=3; });
}

function enterMine(){ scene='mine'; player.x=60; player.y=230; moveTarget=null; }

function exitMine(){
  scene='outside';
  player.x=mineSite.door.x+mineSite.door.w/2;
  player.y=mineSite.door.y+60;
  moveTarget=null;
}

