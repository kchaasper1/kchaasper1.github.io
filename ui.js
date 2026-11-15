// ---- DOM references ----
const startScreen=document.getElementById('startScreen');
const statusEl=document.getElementById('status');
const gameWrap=document.getElementById('gameWrap');
const canvas=document.getElementById('canvas');
const ctx=canvas.getContext('2d');
const playCta=document.getElementById('playCta');
const toastEl=document.getElementById('toast');

const moneyDisplay=document.getElementById('moneyDisplay');
const expenseDisplay=document.getElementById('expenseDisplay');
const bankDisplay=document.getElementById('bankDisplay');
const mineralDisplay=document.getElementById('mineralDisplay');
const staminaBar=document.getElementById('staminaBar');
const runBtn=document.getElementById('runBtn');
const fireBtn=document.getElementById('fireBtn');

const bankModal=document.getElementById('bankModal');
const bankMsg=document.getElementById('bankMsg');
const bankBalances=document.getElementById('bankBalances');
const depAmt=document.getElementById('depAmt');
const wdAmt=document.getElementById('wdAmt');

const garageModal=document.getElementById('garageModal');
const garageMinerals=document.getElementById('garageMinerals');
const garageList=document.getElementById('garageList');

const modal=document.getElementById('modal');
const modalTitle=document.getElementById('modalTitle');
const miniArea=document.getElementById('miniArea');
const miniScore=document.getElementById('miniScore');

function toast(msg){
  toastEl.textContent=msg;
  clearTimeout(toastEl._t);
  toastEl._t=setTimeout(()=>toastEl.textContent='',1800);
}

let lastHud='';
function refreshHud(){
  const t=money+'|'+bankWhole()+'|'+minerals.iron+'|'+minerals.copper+'|'+minerals.gold;
  if(t===lastHud) return;
  lastHud=t;
  moneyDisplay.textContent='💰 $'+money;
  bankDisplay.textContent='🏦 $'+bankWhole();
  mineralDisplay.textContent='⛏️ Iron '+minerals.iron+' · Copper '+minerals.copper+' · Gold '+minerals.gold;
  if(bankModal.classList.contains('active'))
    bankBalances.textContent='On you: $'+money+'   |   In bank: $'+bankWhole()+'   |   Interest: '+(INTEREST_RATE*100)+'% / '+(INTEREST_EVERY_MS/1000)+'s';
  if(garageModal.classList.contains('active')) renderGarage();
}

