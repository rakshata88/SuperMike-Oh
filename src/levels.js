import {createLevel} from './level.js';
import {createKingdom} from './level2.js';
export const levels={
  1:{id:1,title:'Green Paw Meadows',background:'meadow',music:'meadow',spawn:{x:150,y:450},create:createLevel},
  2:{id:2,title:'The Cat Kingdom',background:'kingdom',music:'kingdom',spawn:{x:150,y:450},create:createKingdom},
};
export function createWorld(id=1,cave=false){const config=levels[id]||levels[1];return {...config,...config.create(cave)}}
