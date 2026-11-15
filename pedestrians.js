// ---- Pedestrians ----
function spawnPedestrian(fromEdge){
  const y=305+Math.random()*85;
  const x=fromEdge ? (Math.random()<0.5 ? -15 : WORLD_W+15) : 20+Math.random()*(WORLD_W-40);
  const p={
    id:myId+'_'+(pedCounter++),
    x, y, tx:x, ty:y, leaving:false,
    speed:0.6+Math.random()*0.4,
    money:1+Math.floor(Math.random()*10),
    color:`hsl(${Math.floor(Math.random()*360)},35%,65%)`
  };
  pedestrians.push(p);
  if(firebaseOk&&!fbFailed) fbGuard(pedsRef.child(p.id).set({money:p.money,color:p.color,speed:p.speed,x0:Math.round(x),y0:Math.round(y)}));
}

let lastPedSync=0;
function syncPedsHost(){
  if(!firebaseOk||fbFailed) return;
  const now=Date.now();
  if(now-lastPedSync<150) return;
  lastPedSync=now;
  const pos={};
  pedestrians.forEach(p=>pos[p.id]={x:Math.round(p.x),y:Math.round(p.y)});
  fbGuard(pedPosRef.set(pos));
}

function updatePedestrians(){
  const host=isHost();
  pedestrians.forEach(p=>{
    if(!host){ // everyone else just glides toward the host's latest position
      if(p.rx!==undefined){ p.x+=(p.rx-p.x)*0.25; p.y+=(p.ry-p.y)*0.25; }
      return;
    }
    if(p.tx===undefined){ p.tx=p.x; p.ty=p.y; } // after a host handover
    if(!p.leaving && Math.random()<LEAVE_CHANCE){
      p.leaving=true;
      p.tx = p.x<WORLD_W/2 ? -30 : WORLD_W+30;
      p.ty = p.y;
    }
    if(!p.leaving && Math.hypot(p.tx-p.x,p.ty-p.y)<4){
      p.tx=10+Math.random()*(WORLD_W-20);
      p.ty=305+Math.random()*85;
    }
    const ang=Math.atan2(p.ty-p.y,p.tx-p.x);
    p.x+=Math.cos(ang)*p.speed;
    p.y+=Math.sin(ang)*p.speed;
    if(!p.leaving && p.money<10 && Math.random()<0.001){
      if(firebaseOk&&!fbFailed) pedsRef.child(p.id+'/money').transaction(m=>m===null?m:Math.min(10,m+1),(err)=>{ if(err) noteFbError(err); });
      else p.money++;
    }
    if(p.leaving && (p.x<-20||p.x>WORLD_W+20)){
      p.gone=true;
      if(firebaseOk&&!fbFailed) fbGuard(pedsRef.child(p.id).remove());
    }
  });
  pedestrians=pedestrians.filter(p=>!p.gone);
  pedestrians.forEach(trackHeading);
  if(host){
    const chance=pedestrians.length<10 ? 0.05 : SPAWN_CHANCE; // fill the street quickly at first
    if(pedestrians.length<MAX_PEDS && Math.random()<chance) spawnPedestrian(true);
    syncPedsHost();
  }
}

function trackHeading(p){
  if(p.lx!==undefined){
    const dx=p.x-p.lx, dy=p.y-p.ly, d=Math.hypot(dx,dy);
    if(d>0.05){
      const hx=(p.hx||0)*0.9+dx/d*0.1, hy=(p.hy||0)*0.9+dy/d*0.1;
      const hl=Math.hypot(hx,hy)||1;
      p.hx=hx/hl; p.hy=hy/hl;
    }
  }
  p.lx=p.x; p.ly=p.y;
}

// Shared kill/steal helpers: transactions make sure only one player gets the money
function killPed(p,who){
  const payout=(loot)=>{
    money+=loot;
    toast((who==='goon'?'A goon':'You')+' shot a pedestrian'+(loot?' (+$'+loot+')':''));
  };
  if(!firebaseOk || fbFailed || !p.synced){       // not confirmed by the database: resolve locally
    pedestrians=pedestrians.filter(q=>q!==p);
    if(firebaseOk) pedsRef.child(p.id).remove().catch(()=>{});
    payout(p.money);
    return;
  }
  let loot=0, got=false;
  pedsRef.child(p.id).transaction(cur=>{
    got=false;
    if(cur===null) return null;     // may just be uncached: Firebase re-checks with the real value
    got=true; loot=cur.money; return null;
  },(err,committed)=>{
    if(err){ noteFbError(err); pedestrians=pedestrians.filter(q=>q!==p); payout(p.money); return; }
    if(committed && got) payout(loot);
  });
}

function stealFromPed(p,amt){
  if(!firebaseOk || fbFailed || !p.synced){
    const t=Math.min(amt,p.money); if(t<=0) return;
    p.money-=t; money+=t; toast('Goon stole $'+t+'!');
    return;
  }
  let taken=0;
  pedsRef.child(p.id).transaction(cur=>{
    taken=0;
    if(cur===null) return null;
    if(cur.money<=0) return cur;
    taken=Math.min(amt,cur.money);
    cur.money-=taken;
    return cur;
  },(err,committed)=>{
    if(err){ noteFbError(err); return; }
    if(committed && taken>0){ money+=taken; toast('Goon stole $'+taken+'!'); }
  });
}

