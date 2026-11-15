// ---- Firebase / multiplayer ----
let db = null, playersRef = null;
let pedsRef=null, pedPosRef=null, goonsRef=null;
let playersLoaded=false;
let fbFailed=false;
let fbErrors=0;
function noteFbError(err){
  console.error('Firebase error:', err && err.message ? err.message : err);
  fbErrors++;
  if(fbErrors>=3 && !fbFailed){
    fbFailed=true;
    toast('Database is rejecting writes - running solo. Check your Firebase rules.');
  }
}
function fbGuard(p){ if(p && p.catch) p.catch(noteFbError); }

const lastSeen={};
let firebaseOk = false;
try {
  if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
    firebase.initializeApp(firebaseConfig);
    db = firebase.database();
    playersRef = db.ref("housegame/players");
    pedsRef=db.ref("housegame/peds");
    pedPosRef=db.ref("housegame/pedpos");
    goonsRef=db.ref("housegame/goons");
    firebaseOk = true;
  }
} catch(e){ console.error("Firebase init failed", e); }

function initMultiplayer(){
  if(!firebaseOk) return;
  playersRef.child(myId).onDisconnect().remove();
  goonsRef.child(myId).onDisconnect().remove();
  updatePresence();

  playersRef.on('value', snap=>{
    const val=snap.val()||{};
    delete val[myId];
    const now=Date.now();
    Object.keys(val).forEach(id=>{
      const ls=lastSeen[id];
      if(!ls || ls.ts!==val[id].ts) lastSeen[id]={ts:val[id].ts, at:now};
    });
    const firstLoad=!playersLoaded;
    otherPlayers=val;
    playersLoaded=true;
    fbFailed=false;
    if(firstLoad && Object.keys(val).length===0){
      pedsRef.remove(); pedPosRef.remove(); goonsRef.remove();
    }
  }, err=>{
    console.error('Firebase read failed:',err);
    fbFailed=true;
    toast('Multiplayer connection failed - running solo');
  });
  setTimeout(()=>{
    if(!playersLoaded){ fbFailed=true; console.warn('Firebase did not respond in 5s - running solo'); }
  },5000);
  goonsRef.on('value', snap=>{ otherGoons=snap.val()||{}; });

  // pedestrian details (money, color) live here
  pedsRef.on('value', snap=>{
    if(fbFailed) return;
    const val=snap.val()||{};
    pedestrians=pedestrians.filter(p=>val[p.id]);
    Object.keys(val).forEach(id=>{
      const v=val[id];
      let p=pedestrians.find(q=>q.id===id);
      if(!p){
        p={id,x:v.x0,y:v.y0,rx:v.x0,ry:v.y0,leaving:false};
        pedestrians.push(p);
      }
      p.money=v.money; p.color=v.color; p.speed=v.speed;
      p.synced=true;
    });
  });
  // pedestrian positions (written by the host)
  pedPosRef.on('value', snap=>{
    if(fbFailed) return;
    const val=snap.val()||{};
    pedestrians.forEach(p=>{
      const pos=val[p.id];
      if(pos){ p.rx=pos.x; p.ry=pos.y; }
    });
  });
}

function isHost(){
  if(!firebaseOk || fbFailed) return true;
  if(!playersLoaded) return false;
  const now=Date.now();
  return Object.keys(otherPlayers).every(id=>{
    const ls=lastSeen[id];
    const active = ls && now-ls.at<6000;   // heartbeat seen in the last 6 seconds
    return !active || id>myId;
  });
}

let lastSent=0;
function updatePresence(){
  if(!firebaseOk||fbFailed) return;
  const now=Date.now();
  if(now-lastSent<120) return;
  lastSent=now;
  fbGuard(playersRef.child(myId).set({name:myName,color:myColor,x:player.x,y:player.y,room:currentRoom?currentRoom.name:null,scene:scene,ts:now}));
}

