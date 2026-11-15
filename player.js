// ---- Player movement, stamina, presence ----
function updatePlayer(){
  let dx=0,dy=0;
  const intent = keys['arrowup']||keys['w']||keys['arrowdown']||keys['s']||keys['arrowleft']||keys['a']||keys['arrowright']||keys['d']||moveTarget;
  const running = (keys['shift']||runOn) && intent && !exhausted && stamina>0;
  const speed = running ? RUN_SPEED : WALK_SPEED;
  if(keys['arrowup']||keys['w']) dy=-speed;
  if(keys['arrowdown']||keys['s']) dy=speed;
  if(keys['arrowleft']||keys['a']) dx=-speed;
  if(keys['arrowright']||keys['d']) dx=speed;
  if(dx||dy){
    moveTarget=null;
    facing={dx: dx?Math.sign(dx):0, dy: dy?Math.sign(dy):(dx?0:facing.dy)};
  } else if(moveTarget){
    const tdx = scene==='outside' ? wdx(player.x,moveTarget.x) : moveTarget.x-player.x;
    const tdy = scene==='outside' ? wdy(player.y,moveTarget.y) : moveTarget.y-player.y;
    const d=Math.hypot(tdx,tdy);
    if(d<=speed){ moveTarget=null; }
    else {
      dx=tdx/d*speed; dy=tdy/d*speed;
      facing={dx:dx/speed, dy:dy/speed};
    }
  }

  if(scene==='outside'){
    const nx=wrapX(player.x+dx), ny=wrapY(player.y+dy);
    if(!blockedAt(nx,ny)){ player.x=nx; player.y=ny; }
    else if(!blockedAt(nx,player.y)) player.x=nx;
    else if(!blockedAt(player.x,ny)) player.y=ny;
    else moveTarget=null;
  } else {
    player.x=Math.min(720-player.r, Math.max(player.r, player.x+dx));
    player.y=Math.min(460-player.r, Math.max(player.r, player.y+dy));
  }

  if(running){
    stamina=Math.max(0,stamina-STAMINA_DRAIN);
    if(stamina===0) exhausted=true;
  } else {
    stamina=Math.min(STAMINA_MAX,stamina+STAMINA_REGEN);
    if(exhausted && stamina>=STAMINA_RESUME) exhausted=false;
  }
  const pct=Math.round(stamina);
  if(pct!==lastStaminaPct){
    lastStaminaPct=pct;
    staminaBar.style.width=pct+'%';
    staminaBar.classList.toggle('low',exhausted);
  }

  if(scene==='inside') currentRoom=roomAt(player.x);
  updatePresence();
}

