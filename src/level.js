export const FLOOR = 590;
export const WORLD_WIDTH = 19800;
export function createLevel(cave = false) {
  const platforms = [], items = [], enemies = [], hazards = [], pipes = [], signs = [];
  const ground = (x,w,y=FLOOR,type='grass') => platforms.push({x,y,w,h:720-y,type});
  const ledge = (x,y,w=150,type='stone',extra={}) => platforms.push({x,y,w,h:28,type,...extra});
  const item = (x,y,type='coin') => items.push({x,y,w:28,h:32,type,id:`${cave?'c':'m'}-${items.length}`,taken:false});
  const coins = (x,y,n=5) => {for(let i=0;i<n;i++)item(x+i*48,y-Math.sin(i/(n-1)*Math.PI)*25)};
  const cat = (x,type='patrol',range=170) => enemies.push({x,y:FLOOR-38,w:type==='chonky'?60:43,h:type==='chonky'?48:38,vx:-55,vy:0,type,hp:type==='armor'?2:type==='chonky'?3:1,min:x-range/2,max:x+range/2,alive:true,timer:x%3,baseY:FLOOR-38});
  const pipe = (x,y=510,secret=false,exit=false) => {platforms.push({x,y,w:90,h:FLOOR-y,type:'pipe'});pipes.push({x,y,w:90,secret,exit})};
  if(cave){
    ground(0,2600,590,'cave');
    ledge(400,480,210,'crystal');ledge(790,390,190,'crystal');ledge(1130,470,230,'crystal');ledge(1510,360,190,'crystal');ledge(1860,470,220,'crystal');
    coins(300,535,7);coins(800,340,4);coins(1130,420,5);coins(1800,410,6);
    item(1585,310,'paw');item(1950,420,'life');item(700,530,'blessing');
    pipe(110,500,false,true);pipe(2310,490,false,true);
    signs.push({x:320,y:525,text:'A royal little detour'},{x:2200,y:440,text:'↓ Back to the meadows'});
    return {width:2600,platforms,items,enemies,hazards,pipes,signs,cave:true,checkpoint:0,goal:Infinity};
  }
  // Safe opening, then eight deliberately authored sections with forgiving landings.
  const gaps=[[2660,120],[4480,150],[6430,150],[8540,170],[10830,150],[13100,160],[15400,170],[17500,190]];
  let start=0;for(const [x,w] of gaps){ground(start,x-start);start=x+w}ground(start,WORLD_WIDTH-start);
  signs.push({x:250,y:530,text:'← → Move  ·  SPACE Jump'},{x:1050,y:530,text:'Hold SHIFT to sprint'},{x:1690,y:390,text:'M capsule. Big possibilities.'});
  coins(460,520,5);cat(880);pipe(1250);ledge(1480,470);ledge(1720,370,180);item(1795,325,'power');coins(1500,420,3);
  coins(2120,520,6);cat(2300);cat(2460,'jump');ledge(2590,460,160,'moving',{axis:'x',range:85,speed:1.2,origin:2590});
  ledge(3020,460,160);ledge(3280,365,150);item(3340,315,'paw');cat(3530,'armor');pipe(3740,480,true);
  signs.push({x:3660,y:420,text:'↓ A secret? Only one way to know.'});coins(4030,515,6);item(4260,520,'speed');cat(4180,'fast');
  ledge(4400,440,180,'moving',{axis:'x',range:100,speed:.9,origin:4400});ledge(4850,470,170);ledge(5140,385,180);item(5200,340,'multiplier');coins(5510,520,7);cat(5480,'sleepy');cat(5840,'jump');
  pipe(6100,485);item(6160,440,'power');ledge(6400,455,160,'moving',{axis:'x',range:80,speed:1.3,origin:6400});
  for(let i=0;i<4;i++)ledge(6930+i*140,470-i*28,112,i===2?'breakable':'stone');
  coins(6900,420,7);cat(7540,'chonky');item(7780,510,'jump');hazards.push({x:7970,y:567,w:95,h:23});
  ledge(8210,460,160);ledge(8490,400,220,'moving',{axis:'y',range:65,speed:1.1,origin:400});coins(8830,520,6);
  signs.push({x:9400,y:530,text:'A little rest. A fresh start.'});item(9700,510,'power');
  cat(10100,'armor');pipe(10300,480);cat(10324,'pipe',0);enemies.at(-1).baseY=448;enemies.at(-1).y=448;
  ledge(10750,450,200,'moving',{axis:'x',range:90,speed:1.0,origin:10750});coins(11100,520,7);
  cat(11400,'fast');cat(11740,'jump');hazards.push({x:12000,y:567,w:110,h:23});ledge(11970,455,180);item(12040,405,'blessing');
  pipe(12520,490);cat(12542,'pipe',0);enemies.at(-1).baseY=456;enemies.at(-1).y=456;
  ledge(13020,445,220,'moving',{axis:'x',range:85,speed:1.3,origin:13020});
  ledge(13550,480,160);ledge(13800,390,160);ledge(14070,300,180);item(14140,250,'paw');coins(13810,335,3);cat(14380,'armor');
  item(14810,520,'power');hazards.push({x:15000,y:567,w:100,h:23});ledge(15320,450,240,'moving',{axis:'y',range:60,speed:1,origin:450});
  coins(15900,520,8);cat(16080,'jump');cat(16500,'chonky');item(16620,510,'speed');cat(16900,'fast');
  ledge(17450,450,220,'moving',{axis:'x',range:100,speed:1,origin:17450});coins(17900,520,8);cat(17920,'armor');cat(18320,'jump');
  signs.push({x:18600,y:520,text:'The royal lookout is just ahead!'});
  return {width:WORLD_WIDTH,platforms,items,enemies,hazards,pipes,signs,cave:false,checkpoint:9500,goal:19220};
}
