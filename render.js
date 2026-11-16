// ---- Rendering ----
const cam={x:0,y:0};

// ---------- Standing things ----------
const BUILDINGS=[
  ...obstacles.map(o=>({b:o,color:o.color,label:o.label,ht:BUILDING_HEIGHTS[o.label]||70,cross:o===church})),
  {b:outside.building,color:'#8a7054',label:'SUPERMARKET',ht:BUILDING_HEIGHTS.SUPERMARKET,door:outside.door},
  {b:bank,color:'#9a9a9a',label:'BANK',ht:BUILDING_HEIGHTS.BANK,door:bankDoor},
  ...enterables.map(e=>({b:e.b,color:e.color,label:e.label,ht:BUILDING_HEIGHTS[e.label]||70,door:e.door}))
];

function shade(hex,f){
  const n=parseInt(hex.slice(1),16);
  const c=v=>Math.max(0,Math.min(255,Math.round(v*f)));
  return `rgb(${c(n>>16)},${c((n>>8)&255)},${c(n&255)})`;
}

function drawAvatar(x,y,color,label){
  ctx.beginPath(); ctx.arc(x,y,12,0,Math.PI*2);
  ctx.fillStyle=color; ctx.fill();
  ctx.fillStyle='#fff'; ctx.font='11px sans-serif'; ctx.textAlign='center';
  ctx.fillText(label, x, y-16);
}

// x,y = screen position of the character's feet
function drawChar(x,y,color,label,r,labelColor){
  ctx.fillStyle='#0004'; ctx.beginPath(); ctx.ellipse(x,y,r,r*TILT,0,0,Math.PI*2); ctx.fill();   // shadow
  ctx.fillStyle=color; ctx.beginPath(); ctx.arc(x,y-r*1.3,r,0,Math.PI*2); ctx.fill();            // body
  if(label){
    ctx.fillStyle=labelColor||'#fff'; ctx.font='11px sans-serif'; ctx.textAlign='center';
    ctx.fillText(label,x,y-r*2.3-3);
  }
}

function drawBuilding(bd,ox,oy){
  const b=bd.b, H=bd.ht;
  const x=b.x+ox-cam.x, yTop=(b.y+oy-cam.y)*TILT, yBot=(b.y+b.h+oy-cam.y)*TILT;
  ctx.fillStyle=shade(bd.color,1.15); ctx.fillRect(x,yTop-H,b.w,yBot-yTop);   // roof
  ctx.fillStyle=shade(bd.color,0.8);  ctx.fillRect(x,yBot-H,b.w,H);            // front wall
  ctx.strokeStyle='#0005'; ctx.strokeRect(x,yTop-H,b.w,yBot-yTop+H);
  if(bd.door){
    ctx.fillStyle='#2a2623';
    ctx.fillRect(bd.door.x+ox-cam.x,yBot-H*0.55,bd.door.w,H*0.55);
  }
  ctx.fillStyle='#fff'; ctx.font='12px sans-serif'; ctx.textAlign='center';
  ctx.fillText(bd.label,x+b.w/2,yBot-H+16);
  if(bd.cross){
    const cx=x+b.w/2, cy=yTop-H+(yBot-yTop)/2;
    ctx.fillRect(cx-4,cy-18,8,36); ctx.fillRect(cx-13,cy-8,26,8);
  }
}

function drawTree(t,ox,oy){
  const x=t.x+ox-cam.x, y=(t.y+oy-cam.y)*TILT;
  ctx.fillStyle='#5a4028'; ctx.fillRect(x-2,y-t.r*0.8,4,t.r*0.8);
  ctx.fillStyle='#3b7a3b'; ctx.beginPath(); ctx.arc(x,y-t.r*1.6,t.r*1.2,0,Math.PI*2); ctx.fill();
}

// ---------- Sky (placeholder: replace the body with your sky art later) ----------
<!-- 20)  function drawSky(){ -->
<!-- 20)  const g=ctx.createLinearGradient(0,0,0,SKY_H); -->
<!-- 20)  g.addColorStop(0,'#3d6fb0'); g.addColorStop(1,'#a8cdea'); -->
<!-- 20)  ctx.fillStyle=g; ctx.fillRect(0,0,CANVAS_W,SKY_H); -->
<!-- 20)} -->

// Everything flat on the ground. Put your grass here (e.g. fillStyle = ctx.createPattern(img,'repeat'))
function drawGroundFlat(){
  ctx.fillStyle='#4a6b4a'; ctx.fillRect(0,0,WORLD_W,WORLD_H);          // grass
  ctx.fillStyle='#5a8a52'; ctx.fillRect(park.x,park.y,park.w,park.h);
  ctx.fillStyle='#2f5f8f'; ctx.beginPath();
  ctx.ellipse(lake.cx,lake.cy,lake.rx,lake.ry,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#555'; roads.forEach(r=>ctx.fillRect(r.x,r.y,r.w,r.h));
  ctx.fillStyle='#777'; ctx.fillRect(0,380,WORLD_W,20);                // sidewalk
  ctx.fillStyle='#1a1a1a'; ctx.fillRect(alley.x,alley.y,alley.w,alley.h);
}

// ---------- Ground (squashed by TILT) ----------
function drawGroundLayer(){
  for(const ox of [-WORLD_W,0,WORLD_W]) for(const oy of [-WORLD_H,0,WORLD_H]){
    const left=ox-cam.x, top=(oy-cam.y)*TILT;
    if(left+WORLD_W<0||left>CANVAS_W||top+WORLD_H*TILT<SKY_H||top>CANVAS_H) continue;
    ctx.save();
    ctx.beginPath(); ctx.rect(0,SKY_H,CANVAS_W,CANVAS_H-SKY_H); ctx.clip();   // ground never covers the sky
    ctx.transform(1,0,0,TILT,left,top);
    drawGroundFlat();
    ctx.restore();
  }
}

function drawStandingLayer(){
  const items=[];
  const push=(sy,xl,xr,fn)=>{
    if(xr<-60||xl>CANVAS_W+60||sy<SKY_H-10||sy>CANVAS_H+140) return;   // off screen
    items.push({sy,fn});
  };
  for(const ox of [-WORLD_W,0,WORLD_W]) for(const oy of [-WORLD_H,0,WORLD_H]){
    const X=wx=>wx+ox-cam.x, Y=wy=>(wy+oy-cam.y)*TILT;

    BUILDINGS.forEach(bd=>push(Y(bd.b.y+bd.b.h),X(bd.b.x),X(bd.b.x+bd.b.w),()=>drawBuilding(bd,ox,oy)));
    trees.forEach(t=>push(Y(t.y),X(t.x),X(t.x),()=>drawTree(t,ox,oy)));

    push(Y(alley.y+alley.h/2),X(alley.x),X(alley.x+alley.w),()=>{
      ctx.textAlign='center'; ctx.fillStyle='#ccc'; ctx.font='13px sans-serif';
      ctx.fillText('DARK ALLEY',X(alley.x+alley.w/2),Y(alley.y+alley.h/2)-6);
      ctx.fillStyle='#999'; ctx.font='11px sans-serif';
      ctx.fillText('Hire goon: $'+GOON_COST,X(alley.x+alley.w/2),Y(alley.y+alley.h/2)+10);
    });

    pedestrians.forEach(p=>push(Y(p.y),X(p.x),X(p.x),
      ()=>drawChar(X(p.x),Y(p.y),p.color,'$'+p.money,9,'#8f8')));

    goons.forEach(g=>push(Y(g.y),X(g.x),X(g.x),
      ()=>drawChar(X(g.x),Y(g.y),'#444',myName+"'s goon",10,'#ddd')));
    Object.keys(otherGoons).forEach(oid=>{
      const owner=otherPlayers[oid];
      if(oid===myId||!owner) return;
      Object.values(otherGoons[oid]||{}).forEach(g=>push(Y(g.y),X(g.x),X(g.x),
        ()=>drawChar(X(g.x),Y(g.y),'#444',owner.name+"'s goon",10,'#ddd')));
    });

    Object.values(otherPlayers).forEach(p=>{
      if(p.scene!=='outside') return;
      push(Y(p.y),X(p.x),X(p.x),()=>drawChar(X(p.x),Y(p.y),p.color,p.name,12));
    });

    push(Y(player.y),X(player.x),X(player.x),()=>{
      drawChar(X(player.x),Y(player.y),myColor,myName+' (you)',12);
      if(Date.now()<hitUntil){
        ctx.beginPath(); ctx.arc(X(player.x),Y(player.y)-16,17,0,Math.PI*2);
        ctx.strokeStyle='#f44'; ctx.lineWidth=3; ctx.stroke(); ctx.lineWidth=1;
      }
    });

    bullets.forEach(b=>push(Y(b.y),X(b.x),X(b.x),()=>{
      ctx.fillStyle='#0004'; ctx.beginPath(); ctx.ellipse(X(b.x),Y(b.y),4,2,0,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(X(b.x),Y(b.y)-10,4,0,Math.PI*2);
      ctx.fillStyle=b.owner==='goon'?'#ff8a5c':'#ffe066'; ctx.fill();
    }));
  }
  items.sort((a,b)=>a.sy-b.sy);      // far things first, near things on top
  items.forEach(i=>i.fn());
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
    ctx.strokeRect(mx+(vx+ox)*s,my+(vy+oy)*s,720*s,(CANVAS_H/TILT)*s);
  ctx.restore();
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

function draw(){
  ctx.setTransform(1,0,0,1,0,0);
  ctx.imageSmoothingEnabled=false;            // keeps pixel art crisp later
  ctx.clearRect(0,0,CANVAS_W,CANVAS_H);
  if(scene==='outside'){
    cam.x=player.x-CANVAS_W/2;
    cam.y=player.y-GROUND_CY/TILT;
  <!-- 20)  drawSky(); -->
    drawGroundLayer();
    drawStandingLayer();
    drawMinimap();
  } else {
    cam.x=0; cam.y=0;
    if(scene==='mine') drawMine(); else drawInside();
    drawEntities();                            // flat scenes keep the old entity drawing
  }
}

function loop(){ draw(); requestAnimationFrame(loop); }

