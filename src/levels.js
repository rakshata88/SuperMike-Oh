import {createLevel} from './level.js';
import {createKingdom} from './level2.js';
import {createTerritory} from './level3.js';
import {createEscape} from './level5.js';
import {createCastle} from './level4.js';
export const upcomingLevel={id:6,title:'The Sky Kingdom',comingSoon:true};
export const levels={
  1:{id:1,title:'Green Paw Meadows',background:'meadow',music:'meadow',spawn:{x:150,y:450},create:createLevel},
  2:{id:2,title:'The Cat Kingdom',background:'kingdom',music:'kingdom',spawn:{x:150,y:450},create:createKingdom},
  3:{id:3,title:'The Dog Guard Territory',background:'territory',music:'kingdom',spawn:{x:150,y:450},create:createTerritory},
  5:{id:5,title:'The Great Escape',background:'escape',music:'escape',spawn:{x:150,y:450},create:createEscape},
  4:{id:4,title:'The Shadow Castle',background:'castle',music:'castle',spawn:{x:150,y:450},create:createCastle},
};
export function createWorld(id=1,cave=false){const config=levels[id]||levels[1];return {...config,...config.create(cave)}}
