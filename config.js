/* ====== FIREBASE CONFIG ====== */
const firebaseConfig = {
  apiKey: "AIzaSyBlC2luCyQGEok4heizoj7zR9h4mbdMGGQ",
  authDomain: "test-cef34.firebaseapp.com",
  databaseURL: "https://test-cef34-default-rtdb.firebaseio.com",
  projectId: "test-cef34"
};

// ---- World ----
const WORLD_W=3200, WORLD_H=2400;

// ---- Player ----
const HIT_PENALTY=3;         // dollars lost per hit
const STAMINA_MAX=100;
const STAMINA_DRAIN=0.55;    // per step: about 3 seconds of running
const STAMINA_REGEN=0.25;    // per step: about 7 seconds to refill
const STAMINA_RESUME=25;     // after running out, you need this much before you can run again
const RUN_SPEED=5.6, WALK_SPEED=3.2;

// ---- Goons and payroll ----
const GOON_COST=5;
const WAGE=1;                 // dollars per goon, per payday
const PAY_EVERY_MS=30000;     // payday every 30 seconds
const STEAL_CHANCE=0.4;       // 40% chance per attempt, change to taste
const SHOOT_CHANCE=0.01;      // chance per frame once the cooldown is over
const GOON_SHOT_COOLDOWN=6000;// ms between shots, per goon
const GOON_BULLET_SPEED=6;
const FOLLOW_DIST=26;         // how far behind a pedestrian a goon trails

// ---- Bank ----
const INTEREST_RATE=0.02;          // 2% ...
const INTEREST_EVERY_MS=30000;     // ... every 30 seconds

// ---- Pedestrians ----
const MAX_PEDS=20;
const LEAVE_CHANCE=0.0003;  // per frame, per pedestrian
const SPAWN_CHANCE=0.006;   // per frame while below MAX_PEDS

// ---- Camera ----
const CANVAS_W=720, CANVAS_H=460;
const TILT=0.5;        // 1 = flat top-down, lower = more tilted
const SKY_H=70;        // height of the sky band at the top of the screen
const GROUND_CY=(SKY_H+CANVAS_H)/2;   // screen y where your character stands
const BUILDING_HEIGHTS={HOUSE:70,SHOP:50,OFFICE:60,WAREHOUSE:80,CHURCH:90,SUPERMARKET:90,BANK:100,MINE:70,GARAGE:60};
