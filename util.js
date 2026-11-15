// seeded random, so every player generates the same trees
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}}

function wrapX(x){ return ((x%WORLD_W)+WORLD_W)%WORLD_W; }
function wrapY(y){ return ((y%WORLD_H)+WORLD_H)%WORLD_H; }
// shortest signed distance from a to b across the seams
function wdx(a,b){ let d=b-a; if(d>WORLD_W/2) d-=WORLD_W; else if(d<-WORLD_W/2) d+=WORLD_W; return d; }
function wdy(a,b){ let d=b-a; if(d>WORLD_H/2) d-=WORLD_H; else if(d<-WORLD_H/2) d+=WORLD_H; return d; }
function wdist(ax,ay,bx,by){ return Math.hypot(wdx(ax,bx),wdy(ay,by)); }

