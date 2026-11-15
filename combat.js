// ---- Bullets ----
function fireBullet(){
  bullets.push({x:player.x,y:player.y,dx:facing.dx*7,dy:facing.dy*7,owner:'player'});
}

function updateBullets(){
  bullets.forEach(b=>{
    b.x+=b.dx; b.y+=b.dy; b.life=(b.life||0)+1;
    if(scene==='outside'){ b.x=wrapX(b.x); b.y=wrapY(b.y); }
  });
  if(scene==='outside'){
    bullets.forEach(b=>{
      if(b.dead) return;
      if(b.owner==='goon' && wdist(player.x,player.y,b.x,b.y)<player.r+4){
        b.dead=true;
        const loss=Math.min(money,HIT_PENALTY);   // only cash on you, never the bank
        money-=loss;
        hitUntil=Date.now()+400;
        toast('Ouch! A goon shot you'+(loss?' (-$'+loss+')':''));
        return;
      }
      for(const p of pedestrians){
        if(wdist(p.x,p.y,b.x,b.y)<11){ b.dead=true; killPed(p,b.owner); break; }
      }
    });
  }
  bullets=bullets.filter(b=>!b.dead && b.life<100 &&
    (scene==='outside' || (b.x>0&&b.x<720&&b.y>0&&b.y<460)));
}

