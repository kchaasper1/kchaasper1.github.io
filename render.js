// ---- Rendering ----
const cam={x:0,y:0};

function draw(){
  ctx.clearRect(0,0,720,460);
  if(scene==='outside'){
    cam.x=player.x-360; cam.y=player.y-230;
    const ix0=Math.floor(cam.x/WORLD_W), ix1=Math.floor((cam.x+719)/WORLD_W);
    const iy0=Math.floor(cam.y/WORLD_H), iy1=Math.floor((cam.y+459)/WORLD_H);
    for(let ix=ix0; ix<=ix1; ix++){
      for(let iy=iy0; iy<=iy1; iy++){
        ctx.save();
        ctx.translate(ix*WORLD_W-cam.x, iy*WORLD_H-cam.y);
        drawOutside();
        drawEntities();
        ctx.restore();
      }
    }
    drawMinimap();
  } else {
    cam.x=0; cam.y=0;
    if(scene==='mine') drawMine(); else drawInside();
    drawEntities();
  }
}

function drawEntities(){
  bullets.forEach(b=>{
    if(b.owner==='goon' && scene!=='outside') return;
    ctx.beginPath(); ctx.arc(b.x,b.y,4,0,Math.PI*2);
    ctx.fillStyle=b.owner==='goon' ? '#ff8a5c' : '#ffe066'; ctx.fill();
  });
  Object.values(otherPlayers).forEach(p=>{
    if(p.scene===scene) drawAvatar(p.x,p.y,p.color,p.name);
  });
  drawAvatar(player.x,player.y,myColor,myName+' (you)');
  if(Date.now()<hitUntil){
    ctx.beginPath(); ctx.arc(player.x,player.y,16,0,Math.PI*2);
    ctx.strokeStyle='#f44'; ctx.lineWidth=3; ctx.stroke(); ctx.lineWidth=1;
  }
}

function drawGoon(x,y,label){
  ctx.beginPath(); ctx.arc(x,y,10,0,Math.PI*2);
  ctx.fillStyle='#444'; ctx.fill();
  ctx.strokeStyle='#999'; ctx.stroke();
  ctx.fillStyle='#ddd'; ctx.font='10px sans-serif'; ctx.textAlign='center';
  ctx.fillText(label, x, y-15);
}

function drawOutside(){
  ctx.fillStyle='#4a6b4a'; ctx.fillRect(0,0,WORLD_W,WORLD_H);
  ctx.fillStyle='#5a8a52'; ctx.fillRect(park.x,park.y,park.w,park.h);
  ctx.fillStyle='#2f5f8f'; ctx.beginPath();
  ctx.ellipse(lake.cx,lake.cy,lake.rx,lake.ry,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#555'; roads.forEach(r=>ctx.fillRect(r.x,r.y,r.w,r.h));
  ctx.fillStyle='#777'; ctx.fillRect(0,380,WORLD_W,20); // sidewalk

  trees.forEach(t=>{
    ctx.fillStyle='#3b7a3b'; ctx.beginPath(); ctx.arc(t.x,t.y,t.r,0,Math.PI*2); ctx.fill();
  });

  ctx.textAlign='center'; ctx.font='12px sans-serif';
  obstacles.forEach(o=>{
    ctx.fillStyle=o.color; ctx.fillRect(o.x,o.y,o.w,o.h);
    ctx.fillStyle='#fff'; ctx.fillText(o.label,o.x+o.w/2,o.y+o.h/2);
  });

  const b=outside.building;
  ctx.fillStyle='#8a7054'; ctx.fillRect(b.x,b.y,b.w,b.h);
  ctx.fillStyle='#5b4a38'; ctx.fillRect(outside.door.x,outside.door.y,outside.door.w,outside.door.h+(b.y+b.h-outside.door.y));
  ctx.fillStyle='#fff'; ctx.font='14px sans-serif'; ctx.textAlign='center';
  ctx.fillText('SUPERMARKET', outside.label.x, outside.label.y);
  ctx.fillStyle='#9a9a9a'; ctx.fillRect(bank.x,bank.y,bank.w,bank.h);
  ctx.fillStyle='#5b5b6b'; ctx.fillRect(bankDoor.x,bankDoor.y,bankDoor.w,bankDoor.h);
  ctx.fillStyle='#fff'; ctx.font='14px sans-serif'; ctx.textAlign='center';
  ctx.fillText('BANK', bank.x+bank.w/2, bank.y+bank.h/2-40);

  enterables.forEach(en=>{
    const b=en.b, d=en.door;
    ctx.fillStyle=en.color; ctx.fillRect(b.x,b.y,b.w,b.h);
    ctx.fillStyle='#2a2623'; ctx.fillRect(d.x,d.y,d.w,d.h);
    ctx.fillStyle='#fff'; ctx.font='14px sans-serif'; ctx.textAlign='center';
    ctx.fillText(en.label,b.x+b.w/2,b.y+b.h/2-20);
  });

  // cross on the church
  ctx.fillStyle='#fff';
  ctx.fillRect(church.x+church.w/2-5,church.y+14,10,50);
  ctx.fillRect(church.x+church.w/2-16,church.y+27,32,10);

  ctx.fillStyle='#1a1a1a'; ctx.fillRect(alley.x,alley.y,alley.w,alley.h);
  ctx.fillStyle='#ccc'; ctx.font='13px sans-serif';
  ctx.fillText('DARK ALLEY', alley.x+alley.w/2, alley.y+20);
  ctx.font='11px sans-serif'; ctx.fillStyle='#999';
  ctx.fillText('Hire goon: $'+GOON_COST, alley.x+alley.w/2, alley.y+38);

  pedestrians.forEach(p=>{
    ctx.beginPath(); ctx.arc(p.x,p.y,9,0,Math.PI*2);
    ctx.fillStyle=p.color; ctx.fill();
    ctx.fillStyle='#8f8'; ctx.font='bold 11px sans-serif'; ctx.textAlign='center';
    ctx.fillText('$'+p.money, p.x, p.y-14);
  });

  goons.forEach(g=>drawGoon(g.x,g.y,myName+"'s goon"));
  Object.keys(otherGoons).forEach(oid=>{
    const owner=otherPlayers[oid];
    if(oid===myId || !owner) return;
    Object.values(otherGoons[oid]||{}).forEach(g=>drawGoon(g.x,g.y,owner.name+"'s goon"));
  });
}

function drawMinimap(){
  const s=0.06, mx=720-WORLD_W*s-8, my=8;
  ctx.save();
  ctx.globalAlpha=0.85;
  ctx.fillStyle='#2d4a2d'; ctx.fillRect(mx,my,WORLD_W*s,WORLD_H*s);
  ctx.fillStyle='#666'; roads.forEach(r=>ctx.fillRect(mx+r.x*s,my+r.y*s,r.w*s,r.h*s));
  ctx.fillStyle='#2f5f8f'; ctx.beginPath();
  ctx.ellipse(mx+lake.cx*s,my+lake.cy*s,lake.rx*s,lake.ry*s,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#c9a'; obstacles.forEach(o=>ctx.fillRect(mx+o.x*s,my+o.y*s,o.w*s,o.h*s));
  const b=outside.building;
  ctx.fillStyle='#e8c070'; ctx.fillRect(mx+b.x*s,my+b.y*s,b.w*s,b.h*s);
  ctx.fillStyle='#bbb'; ctx.fillRect(mx+bank.x*s,my+bank.y*s,bank.w*s,bank.h*s);
  enterables.forEach(en=>{ ctx.fillStyle=en.color; ctx.fillRect(mx+en.b.x*s,my+en.b.y*s,en.b.w*s,en.b.h*s); });
  Object.values(otherPlayers).forEach(p=>{
    if(p.scene!=='outside') return;
    ctx.fillStyle=p.color; ctx.fillRect(mx+p.x*s-1.5,my+p.y*s-1.5,3,3);
  });
  ctx.fillStyle='#fff'; ctx.fillRect(mx+player.x*s-2,my+player.y*s-2,4,4);
  ctx.beginPath(); ctx.rect(mx,my,WORLD_W*s,WORLD_H*s); ctx.clip();
  const vx=wrapX(cam.x), vy=wrapY(cam.y);
  ctx.strokeStyle='#fff';
  for(const ox of [-WORLD_W,0]) for(const oy of [-WORLD_H,0])
    ctx.strokeRect(mx+(vx+ox)*s,my+(vy+oy)*s,720*s,460*s);
  ctx.restore();
}

function drawInside(){
  ctx.fillStyle='#15171c'; ctx.fillRect(0,0,720,460);
  rooms.forEach(r=>{
    ctx.fillStyle=r.color;
    ctx.fillRect(r.x0,0,r.x1-r.x0,460);
    ctx.fillStyle='#00000055';
    ctx.beginPath(); ctx.arc(r.pad.x,r.pad.y,22,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#fff9';
    ctx.font='12px sans-serif'; ctx.textAlign='center';
    ctx.fillText(r.name, (r.x0+r.x1)/2, 24);
    ctx.fillText('mini-game', r.pad.x, r.pad.y+40);
  });
  ctx.fillStyle='#4fae8f'; ctx.fillRect(insideExit.x-10,insideExit.y-16,20,32);
  ctx.fillStyle='#fff9'; ctx.font='11px sans-serif'; ctx.textAlign='center';
  ctx.fillText('exit', insideExit.x, insideExit.y+30);
}

function drawAvatar(x,y,color,label){
  ctx.beginPath(); ctx.arc(x,y,12,0,Math.PI*2);
  ctx.fillStyle=color; ctx.fill();
  ctx.fillStyle='#fff'; ctx.font='11px sans-serif'; ctx.textAlign='center';
  ctx.fillText(label, x, y-16);
}

function drawMine(){
  ctx.fillStyle='#1d1b1a'; ctx.fillRect(0,0,720,460);
  ctx.fillStyle='#fff9'; ctx.font='12px sans-serif'; ctx.textAlign='center';
  ctx.fillText('THE MINE',360,24);
  ctx.fillStyle='#4fae8f'; ctx.fillRect(mineExit.x-10,mineExit.y-16,20,32);
  ctx.fillStyle='#fff9'; ctx.font='11px sans-serif';
  ctx.fillText('exit',mineExit.x,mineExit.y+30);
  mineNodes.forEach(n=>{
    if(n.hp<=0) return;
    ctx.beginPath(); ctx.arc(n.x,n.y,14,0,Math.PI*2);
    ctx.fillStyle=ORE_COLORS[n.type]; ctx.fill();
    ctx.strokeStyle='#0008'; ctx.stroke();
    ctx.fillStyle='#fffc'; ctx.font='10px sans-serif';
    ctx.fillText(n.type+(n.hp<3?' '+'●'.repeat(n.hp):''),n.x,n.y-19);
  });
}

function loop(){ draw(); requestAnimationFrame(loop); }

