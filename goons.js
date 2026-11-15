// ---- Goons: hiring, payroll, behavior ----
let nextPayday=Date.now()+PAY_EVERY_MS;
let lastExpenseText='';

function refreshExpenses(){
  const perMin=Math.round(goons.length*WAGE*60000/PAY_EVERY_MS*10)/10;
  const txt='Expenses: $'+perMin+'/min';
  if(txt!==lastExpenseText){ lastExpenseText=txt; expenseDisplay.textContent=txt; }
}

function updatePayroll(){
  const now=Date.now();
  if(goons.length===0){ nextPayday=now+PAY_EVERY_MS; refreshExpenses(); return; }
  while(now>=nextPayday){
    nextPayday+=PAY_EVERY_MS;
    let paid=0, quit=0;
    goons=goons.filter(g=>{
      if(money>=WAGE){ money-=WAGE; paid+=WAGE; return true; }
      quit++; return false;       // can't pay: this goon walks off the job
    });
    moneyDisplay.textContent='💰 $'+money;
    if(quit) toast(quit+(quit>1?' goons quit':' goon quit')+" - you couldn't pay them");
    else if(paid) toast('Paid $'+paid+' in wages');
  }
  refreshExpenses();
}

function hireGoon(){
  if(money<GOON_COST){ toast('Need $'+GOON_COST+' to hire a goon'); return; }
  money-=GOON_COST;
  moneyDisplay.textContent='💰 $'+money;
  goonCounter++;
  goons.push({id:'g'+goonCounter, x:player.x, y:player.y, tx:player.x, ty:player.y, speed:1.2});
  toast('Hired a goon! ('+goons.length+' total)');
}

let lastGoonSync=0;
function syncGoons(){
  if(!firebaseOk||fbFailed) return;
  const now=Date.now();
  if(now-lastGoonSync<150) return;
  lastGoonSync=now;
  fbGuard(goonsRef.child(myId).set(goons.length ? goons.map(g=>({x:Math.round(g.x),y:Math.round(g.y)})) : null));
}

function updateGoons(){
  const now=Date.now();
  goons.forEach(g=>{
    let prey=pedestrians.find(p=>p.id===g.preyId && p.money>0 && wdist(p.x,p.y,g.x,g.y)<220);
    if(!prey){
      let best=140;
      pedestrians.forEach(p=>{
        if(p.money<=0) return;
        const d=wdist(p.x,p.y,g.x,g.y);
        if(d<best){ best=d; prey=p; }
      });
      g.preyId=prey?prey.id:null;
    }

    if(prey){
      const ddx=wdx(g.x,prey.x), ddy=wdy(g.y,prey.y), dd=Math.hypot(ddx,ddy)||1;
      const hx=prey.hx!==undefined?prey.hx:ddx/dd;
      const hy=prey.hy!==undefined?prey.hy:ddy/dd;
      g.tx=wrapX(prey.x-hx*FOLLOW_DIST);
      g.ty=wrapY(prey.y-hy*FOLLOW_DIST);
    } else if(wdist(g.x,g.y,g.tx,g.ty)<4){
      g.tx=wrapX(g.x+(Math.random()-0.5)*500);
      g.ty=wrapY(g.y+(Math.random()-0.5)*500);
    }

    const mdx=wdx(g.x,g.tx), mdy=wdy(g.y,g.ty), md=Math.hypot(mdx,mdy);
    if(md>0.5){
      const step=Math.min(g.speed,md);
      g.x=wrapX(g.x+mdx/md*step); g.y=wrapY(g.y+mdy/md*step);
    }

    if(prey && scene==='outside' && now>=(g.nextShot||0) && Math.random()<SHOOT_CHANCE){
      g.nextShot=now+GOON_SHOT_COOLDOWN;
      const a=Math.atan2(wdy(g.y,prey.y),wdx(g.x,prey.x))+(Math.random()-0.5)*0.5;
      bullets.push({x:g.x,y:g.y,dx:Math.cos(a)*GOON_BULLET_SPEED,dy:Math.sin(a)*GOON_BULLET_SPEED,owner:'goon'});
    }

    if(now<(g.nextSteal||0)) return;
    pedestrians.forEach(p=>{
      if(p.money<=0) return;
      if(wdist(p.x,p.y,g.x,g.y)<FOLLOW_DIST+14){
        g.nextSteal=now+2000;
        if(Math.random()<STEAL_CHANCE){
          stealFromPed(p, 1+Math.floor(Math.random()*Math.min(3,p.money)));
        } else {
          toast('A goon failed to steal...');
        }
      }
    });
  });
  syncGoons();
}

