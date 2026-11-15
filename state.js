// ---- Shared mutable game state ----
let scene='outside'; // 'outside' | 'inside' | 'mine'
let player={x:360,y:420,r:12};
let facing={dx:0,dy:-1};
let hitUntil=0;

let stamina=STAMINA_MAX, exhausted=false, runOn=false, lastStaminaPct=-1;
let moveTarget=null;

let bullets=[];
let money=5;

let goons=[]; // {id,x,y,tx,ty,speed}
let goonCounter=0;

let pedestrians=[];
let pedCounter=0;

const keys={};
let otherPlayers={};
let otherGoons={};
let myId=null, myName="", myColor="#e0824f";
let currentRoom=roomAt(player.x);

