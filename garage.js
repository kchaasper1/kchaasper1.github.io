// ---- Garage ----
// Nothing buildable yet. Later, add entries like:
// {name:'Something', cost:{iron:10,copper:5}, onBuild:()=>{ ... }}
const buildables=[];

function renderGarage(){
  garageMinerals.textContent='Iron '+minerals.iron+'  ·  Copper '+minerals.copper+'  ·  Gold '+minerals.gold;
  garageList.innerHTML='';
  if(!buildables.length){ garageList.textContent='Nothing to build yet.'; return; }
  buildables.forEach(item=>{
    const row=document.createElement('div'); row.className='bank-row';
    const label=document.createElement('span');
    label.textContent=item.name+' ('+Object.entries(item.cost).map(([k,v])=>v+' '+k).join(', ')+')';
    const btn=document.createElement('button'); btn.textContent='Build';
    const canBuild=()=>Object.entries(item.cost).every(([k,v])=>minerals[k]>=v);
    btn.disabled=!canBuild();
    btn.onclick=()=>{
      if(!canBuild()) return;
      Object.entries(item.cost).forEach(([k,v])=>minerals[k]-=v);
      if(item.onBuild) item.onBuild();
      toast('Built '+item.name);
      lastHud=''; refreshHud(); renderGarage();
    };
    row.append(label,btn);
    garageList.appendChild(row);
  });
}
function openGarage(){ garageModal.classList.add('active'); renderGarage(); }
document.getElementById('closeGarage').onclick=()=>garageModal.classList.remove('active');

