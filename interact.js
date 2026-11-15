// ---- Interactions (E key / tap button) ----
function onInteract(){
  if(scene==='outside'){
    if(Math.hypot(player.x-(outside.door.x+outside.door.w/2), player.y-outside.door.y)<35){ enterBuilding(); return; }
    if(Math.hypot(player.x-(bankDoor.x+bankDoor.w/2), player.y-bankDoor.y)<35){ openBank(); return; }
    for(const en of enterables){
      if(Math.hypot(player.x-(en.door.x+en.door.w/2), player.y-en.door.y)<35){
        if(en.key==='mine') enterMine(); else openGarage();
        return;
      }
    }
    const inAlley = player.x>alley.x && player.x<alley.x+alley.w && player.y>alley.y && player.y<alley.y+alley.h;
    if(inAlley) hireGoon();
  } else if(scene==='mine'){
    if(Math.hypot(player.x-mineExit.x,player.y-mineExit.y)<35){ exitMine(); return; }
    mineOre();
  } else {
    if(Math.hypot(player.x-insideExit.x,player.y-insideExit.y)<35){ exitBuilding(); return; }
    const d=Math.hypot(player.x-currentRoom.pad.x, player.y-currentRoom.pad.y);
    if(d<40) openGame(currentRoom.game, currentRoom.name);
  }
}

function enterBuilding(){ scene='inside'; player.x=50; player.y=230; }
function exitBuilding(){ scene='outside'; player.x=360; player.y=300; }

// Shows/hides the on-screen action button and sets its label
function updateCta(){
  const near=(x,y,r)=>Math.hypot(player.x-x,player.y-y)<r;
  let cta=null;
  if(scene==='outside'){
    if(near(outside.door.x+outside.door.w/2,outside.door.y,35)) cta='Enter supermarket (E)';
    else if(near(bankDoor.x+bankDoor.w/2,bankDoor.y,35)) cta='Enter bank (E)';
    else {
      for(const en of enterables)
        if(near(en.door.x+en.door.w/2,en.door.y,35)){ cta=en.prompt; break; }
      if(!cta && player.x>alley.x&&player.x<alley.x+alley.w&&player.y>alley.y&&player.y<alley.y+alley.h)
        cta='Hire goon - $'+GOON_COST+' (E)';
    }
  } else if(scene==='mine'){
    if(near(mineExit.x,mineExit.y,35)) cta='Exit mine (E)';
    else if(nearestOre()) cta='Mine (E)';
  } else {
    const dPad=Math.hypot(player.x-currentRoom.pad.x,player.y-currentRoom.pad.y);
    if(near(insideExit.x,insideExit.y,35)) cta='Exit to street (E)';
    else if(dPad<40) cta='Play mini-game (E)';
  }
  if(cta) playCta.textContent=cta;
  playCta.style.display=cta?'inline-block':'none';
}

