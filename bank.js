// ---- Bank ----
let bankBalance=0;   // can hold fractions, the screen shows whole dollars
let nextInterest=Date.now()+INTEREST_EVERY_MS;

function bankWhole(){ return Math.floor(bankBalance+1e-9); }

function updateBankInterest(){
  const now=Date.now();
  if(bankBalance<=0){ nextInterest=now+INTEREST_EVERY_MS; return; }
  const before=bankWhole();
  while(now>=nextInterest){ nextInterest+=INTEREST_EVERY_MS; bankBalance*=1+INTEREST_RATE; }
  const gain=bankWhole()-before;
  if(gain>0) toast('Bank interest: +$'+gain);
}

function openBank(){
  bankModal.classList.add('active');
  bankMsg.textContent=''; depAmt.value=''; wdAmt.value='';
  lastHud=''; refreshHud();
}

function bankAction(kind,all){
  let amt = all ? (kind==='dep' ? money : bankWhole())
                : parseInt((kind==='dep'?depAmt:wdAmt).value,10);
  if(!Number.isFinite(amt)||amt<=0){
    bankMsg.textContent = all ? (kind==='dep'?'You have nothing to deposit.':'You have nothing to withdraw.')
                              : 'Enter a whole number above 0.';
    return;
  }
  if(kind==='dep'){
    if(amt>money){ bankMsg.textContent='You only have $'+money+' on you.'; return; }
    money-=amt; bankBalance+=amt; bankMsg.textContent='Deposited $'+amt+'.';
  } else {
    if(amt>bankWhole()){ bankMsg.textContent='You only have $'+bankWhole()+' in the bank.'; return; }
    bankBalance-=amt; money+=amt; bankMsg.textContent='Withdrew $'+amt+'.';
  }
  depAmt.value=''; wdAmt.value='';
  refreshHud();
}
document.getElementById('depositBtn').onclick=()=>bankAction('dep',false);
document.getElementById('withdrawBtn').onclick=()=>bankAction('wd',false);
document.getElementById('depositAllBtn').onclick=()=>bankAction('dep',true);
document.getElementById('withdrawAllBtn').onclick=()=>bankAction('wd',true);
document.getElementById('closeBank').onclick=()=>bankModal.classList.remove('active');
depAmt.addEventListener('keydown',e=>{ if(e.key==='Enter') bankAction('dep',false); });
wdAmt.addEventListener('keydown',e=>{ if(e.key==='Enter') bankAction('wd',false); });

