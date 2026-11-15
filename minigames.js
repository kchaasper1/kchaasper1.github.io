// ---- Mini-games ----
let activeTimer=null;

function earnDollar(){
  money++;
  moneyDisplay.textContent='💰 $'+money;
}

function closeModal(){
  modal.classList.remove('active');
  if(activeTimer) clearInterval(activeTimer);
  miniArea.innerHTML='';
}
document.getElementById('closeModal').onclick=closeModal;

function openGame(type,label){
  modal.classList.add('active');
  modalTitle.textContent=label+" mini-game";
  miniArea.innerHTML=''; miniScore.textContent='';
  if(type==='reflex') startReflex();
  if(type==='chop') startChop();
  if(type==='clocks') startClocks();
}

// Reflex tap — completes after 5 rounds
function startReflex(){
  let round=0, times=[], startT=0, done=false;
  const btn=document.createElement('button');
  btn.id='reflexBtn'; btn.textContent='Wait...'; btn.style.background='#555';
  miniArea.appendChild(btn);

  function nextRound(){
    if(round>=5){
      miniScore.textContent='Avg: '+Math.round(times.reduce((a,b)=>a+b,0)/times.length)+'ms — ✅ Completed! +$1';
      btn.textContent='Done!';
      if(!done){ done=true; earnDollar(); }
      return;
    }
    btn.style.background='#a33'; btn.textContent='Wait...';
    setTimeout(()=>{ btn.style.background='#2e6b5e'; btn.textContent='TAP!'; startT=Date.now(); },600+Math.random()*1200);
  }

  btn.onclick=()=>{
    if(btn.textContent!=='TAP!') return;
    times.push(Date.now()-startT); round++;
    miniScore.textContent='Round '+round+'/5';
    nextRound();
  };
  nextRound();
}

// Chop — completes when target score is reached
function startChop(){
  let score=0, timeLeft=20, target=12, done=false;
  miniScore.textContent='Score: 0 / '+target+' | Time: 20s';
  const items=['🥕','🥦','🍅','🍆','💣'];
  activeTimer=setInterval(()=>{
    timeLeft--;
    if(!done) miniScore.textContent='Score: '+score+' / '+target+' | Time: '+timeLeft+'s';
    if(timeLeft<=0 && !done){ clearInterval(activeTimer); miniArea.innerHTML='<p style="padding-top:100px">Time up — score '+score+'/'+target+'. Try again!</p>'; }
  },1000);

  const spawn=setInterval(()=>{
    if(timeLeft<=0||done){ clearInterval(spawn); return; }
    const el=document.createElement('div');
    const emoji=items[Math.floor(Math.random()*items.length)];
    el.className='falling'; el.textContent=emoji;
    el.style.left=(Math.random()*220)+'px'; el.style.top='0px';
    miniArea.appendChild(el);
    let top=0;
    const fall=setInterval(()=>{
      top+=4; el.style.top=top+'px';
      if(top>230){ clearInterval(fall); el.remove(); }
    },30);
    el.onclick=()=>{
      clearInterval(fall); el.remove();
      score += emoji==='💣' ? -1 : 1;
      if(score>=target && !done){
        done=true; clearInterval(activeTimer); clearInterval(spawn);
        miniScore.textContent='✅ Completed! +$1';
        earnDollar();
      }
    };
  },600);
}

// Whack clocks — completes when target score is reached
function startClocks(){
  let score=0, timeLeft=20, target=8, done=false;
  miniScore.textContent='Score: 0 / '+target+' | Time: 20s';
  const holes=[];
  for(let i=0;i<6;i++){
    const h=document.createElement('div');
    h.className='hole';
    h.style.left=(20+(i%3)*90)+'px';
    h.style.top=(20+Math.floor(i/3)*120)+'px';
    miniArea.appendChild(h);
    holes.push(h);
  }

  activeTimer=setInterval(()=>{
    timeLeft--;
    if(!done) miniScore.textContent='Score: '+score+' / '+target+' | Time: '+timeLeft+'s';
    if(timeLeft<=0 && !done){ clearInterval(activeTimer); clearInterval(popper); miniArea.innerHTML='<p style="padding-top:100px">Time up — score '+score+'/'+target+'. Try again!</p>'; }
  },1000);

  const popper=setInterval(()=>{
    if(timeLeft<=0||done) return;
    const h=holes[Math.floor(Math.random()*holes.length)];
    const clock=document.createElement('div');
    clock.className='pop'; clock.textContent='⏰';
    clock.style.left=h.style.left; clock.style.top=h.style.top;
    let clicked=false;
    clock.onclick=()=>{
      if(!clicked){
        clicked=true; score++; clock.remove();
        if(score>=target && !done){
          done=true; clearInterval(activeTimer); clearInterval(popper);
          miniScore.textContent='✅ Completed! +$1';
          earnDollar();
        }
      }
    };
    miniArea.appendChild(clock);
    setTimeout(()=>{ if(!clicked) clock.remove(); },600);
  },750);
}

