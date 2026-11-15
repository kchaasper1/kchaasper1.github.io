// ---- Supermarket interior: 3 side-by-side rooms ----
const rooms=[
  {name:'Living Room', x0:0,   x1:240, color:'#2c3550', pad:{x:120,y:230}, game:'reflex'},
  {name:'Kitchen',     x0:240, x1:480, color:'#3a3324', pad:{x:360,y:230}, game:'chop'},
  {name:'Bedroom',     x0:480, x1:720, color:'#33243a', pad:{x:600,y:230}, game:'clocks'}
];
function roomAt(x){ return rooms.find(r=>x>=r.x0 && x<r.x1) || rooms[0]; }

const outside = {
  building:{x:260,y:40,w:200,h:220},
  door:{x:340,y:240,w:40,h:20},
  label:{x:360,y:30}
};
const insideExit = {x:30,y:230}; // walk here (inside) to step back out to the street

// ---- Outside world ----
const bank={x:1320,y:40,w:220,h:220};
const bankDoor={x:1410,y:240,w:40,h:20};
const alley = {x:550,y:40,w:140,h:140};
const church={x:1460,y:1130,w:200,h:180,color:'#c9c2b0',label:'CHURCH'};
const obstacles=[ // solid buildings
  {x:700,y:60,w:140,h:160,color:'#a0665a',label:'HOUSE'},
  {x:900,y:60,w:140,h:160,color:'#6a7fa0',label:'HOUSE'},
  {x:1800,y:60,w:300,h:200,color:'#7a6a5a',label:'WAREHOUSE'},
  {x:200,y:480,w:160,h:140,color:'#a08a5a',label:'HOUSE'},
  {x:480,y:480,w:160,h:140,color:'#7aa06a',label:'HOUSE'},
  {x:200,y:1150,w:150,h:130,color:'#a0665a',label:'HOUSE'},
  {x:450,y:1150,w:150,h:130,color:'#6a7fa0',label:'HOUSE'},
  {x:700,y:1150,w:150,h:130,color:'#a08a5a',label:'HOUSE'},
  church,
  {x:780,y:450,w:190,h:90,color:'#8a8f98',label:'SHOP'},
  {x:990,y:450,w:170,h:90,color:'#a39a8a',label:'OFFICE'}
];
const park={x:1350,y:480,w:420,h:380};
const lake={cx:1950,cy:1250,rx:260,ry:150};
const mineSite={key:'mine',label:'MINE',prompt:'Enter the mine (E)',color:'#6b6560',
  b:{x:2640,y:480,w:260,h:190}, door:{x:2740,y:650,w:40,h:20}};
const garage={key:'garage',label:'GARAGE',prompt:'Enter garage (E)',color:'#7a7f86',
  b:{x:2180,y:480,w:220,h:170}, door:{x:2270,y:630,w:40,h:20}};
const enterables=[mineSite,garage];
const roads=[
  {x:0,y:300,w:WORLD_W,h:80},     // main road (pedestrians walk here)
  {x:1180,y:0,w:80,h:WORLD_H},    // north-south road
  {x:2480,y:0,w:80,h:WORLD_H},    // second north-south road
  {x:0,y:1000,w:WORLD_W,h:80},    // southern road
  {x:0,y:1700,w:WORLD_W,h:80}     // far southern road
];

function inBuildingSolid(x,y,b,door){
  const inB=x>b.x&&x<b.x+b.w&&y>b.y&&y<b.y+b.h;
  const inDoorX=x>door.x&&x<door.x+door.w;
  return inB && !(inDoorX && y>b.y+b.h-25);
}
function blockedAt(x,y){
  const r=player.r;
  if(inBuildingSolid(x,y,outside.building,outside.door)) return true;
  if(inBuildingSolid(x,y,bank,bankDoor)) return true;
  for(const en of enterables) if(inBuildingSolid(x,y,en.b,en.door)) return true;
  for(const o of obstacles)
    if(x+r>o.x && x-r<o.x+o.w && y+r>o.y && y-r<o.y+o.h) return true;
  const nx=(x-lake.cx)/(lake.rx+r), ny=(y-lake.cy)/(lake.ry+r);
  return nx*nx+ny*ny<1;
}

const trees=[];
(function(){
  const rng=mulberry32(12345);
  const clear=[
    ...roads.map(r=>({x:r.x-20,y:r.y-20,w:r.w+40,h:r.h+40})),
    ...obstacles.map(o=>({x:o.x-25,y:o.y-25,w:o.w+50,h:o.h+50})),
    ...enterables.map(e=>({x:e.b.x-25,y:e.b.y-25,w:e.b.w+50,h:e.b.h+50})),
    {x:outside.building.x-30,y:outside.building.y-30,w:260,h:280},
    {x:alley.x-20,y:alley.y-20,w:alley.w+40,h:alley.h+40},
    {x:bank.x-25,y:bank.y-25,w:bank.w+50,h:bank.h+50}
  ];
  let tries=0;
  while(trees.length<170 && tries<6000){
    tries++;
    const x=rng()*WORLD_W, y=rng()*WORLD_H;
    if(((x-lake.cx)/(lake.rx+25))**2+((y-lake.cy)/(lake.ry+25))**2<1) continue;
    if(clear.some(k=>x>k.x&&x<k.x+k.w&&y>k.y&&y<k.y+k.h)) continue;
    trees.push({x,y,r:10+rng()*8});
  }
  for(let i=0;i<25;i++) trees.push({x:park.x+20+rng()*(park.w-40), y:park.y+20+rng()*(park.h-40), r:10+rng()*8});
})();

