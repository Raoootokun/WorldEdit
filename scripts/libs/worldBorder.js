//import { config } from "./config.js";
import { world, system, MolangVariableMap, BlockVolume } from "@minecraft/server";
import { WorldDatabase } from "./Database";
const database = new WorldDatabase(`worldBorder`);
const dimension = world.getDimension("overworld");
const tag = "inArea";
const molang = new MolangVariableMap();
let interval = null;
let tick = 0;

system.runInterval(() => {
  if(tick == 1200)tick = 0;
  const center = database.get("center");//world.getDynamicProperty(`wb_center`);
  const radius = database.get("size");//world.getDynamicProperty(`wb_size`);
  if(!center || !radius)return;
  
  if(tick % 20 == 0){
    const size = radius;
    const maxTextureSize = 10;
    const textureData = get(size, maxTextureSize);
    const textureSize = size;
    const textureCount = textureData.count;
    const remainderSize = textureData.remainder;
     
    molang.setFloat(`variable.lifetime`, 1);
    
    showParticleX(center, radius, molang, textureSize, maxTextureSize, remainderSize, textureCount);
    showParticleZ(center, radius, molang, textureSize, maxTextureSize, remainderSize, textureCount);
  };

  const volume = new BlockVolume({ x:center.x-radius, y:-64, z:center.z-radius }, { x:center.x+radius-1, y:320, z:center.z+radius-1 }); 
  for(const player of world.getPlayers()){
    if(volume.isInside(player.location)){
      player.inArea = true;
    }else{
      player.inArea = false;
    };
  };
  
  tick++;
},0);

export class worldBorder {
  constructor() {
  };

  /**
   * 
   * @param {number} x 
   * @param {number} z 
   */
  static center(x, z) {
    const location = { x:x+0.5, y:192, z:z+0.5 };
    database.set("center", location);
    //world.setDynamicProperty(`wb_center`, location);
  };

  /**
   * 
   * @param {number} size 
   */
  static size(radius) {
    database.set("size", radius+0.5);
    //world.setDynamicProperty(`wb_size`, radius+0.5);
  };

  /**
   * 
   * @param {number} radius 
   * @param {number} time 
   */
  static addSize(radius, time) {
    const addRadius = radius/time;

    let count__ = 0;
    interval = system.runInterval(() => {
      count__++;

      let nowRadius = database.get("size") * 1;
      database.set("size", nowRadius+addRadius);
      //world.setDynamicProperty(`wb_size`, nowRadius+addRadius);

      if(count__ == time)return system.clearRun(interval);
    },20);
  };

  static stop() {
    if(interval != null)system.clearRun(interval);
  };

  static get() {
    const center = database.get("center");//world.getDynamicProperty(`wb_center`);
    const size = database.get("size");//world.getDynamicProperty(`wb_size`);
    if(!center || !size)return;
    
    return { 
      center: { x:center.x-0.5, y:center.y, z:center.z-0.5 }, 
      size: size-0.5,
    };
  };
};
 
function get(textureSize, maxTextureSize) {
  return {
      remainder: textureSize % maxTextureSize,
      count:  Math.floor( textureSize / maxTextureSize )
  };
};

function showParticleX(center, radius, molang, textureSize, maxTextureSize, remainderSize, textureCount) {
  molang.setFloat(`variable.x`, 1);
  molang.setFloat(`variable.z`, 0);

  if(textureCount > 0){

    molang.setFloat(`variable.size`, maxTextureSize);
    for(let i=0; i<textureCount; i++){
      const loca_plus = {
        x: center.x + radius,
        y: center.y,
        z: center.z - (maxTextureSize-radius) - (i*(maxTextureSize*2))
      };
      const loca_minus = {
        x: center.x - radius,
        y: center.y,
        z: center.z - (maxTextureSize-radius) - (i*(maxTextureSize*2))
      };
      try{ dimension.spawnParticle(`mc:world_border`, loca_plus, molang); }catch(e){};
      try{ dimension.spawnParticle(`mc:world_border`, loca_minus, molang); }catch(e){};
    };

    molang.setFloat(`variable.size`, remainderSize);
    const loca_plus = {
      x: center.x + radius,
      y: center.y,
      z: center.z - (maxTextureSize-radius) - (textureCount*maxTextureSize*2) + maxTextureSize - (remainderSize)
    };
    const loca_minus = {
      x: center.x - radius,
      y: center.y,
      z: center.z - (maxTextureSize-radius) - (textureCount*maxTextureSize*2) + maxTextureSize - (remainderSize)
    };
    try{ dimension.spawnParticle(`mc:world_border`, loca_plus, molang); }catch(e){};
    try{ dimension.spawnParticle(`mc:world_border`, loca_minus, molang); }catch(e){};

  }else{
    molang.setFloat(`variable.size`, textureSize);
    const loca_plus = {  x: center.x + radius, y: center.y, z: center.z };
    const loca_minus = { x: center.x - radius, y: center.y, z: center.z };
    try{ dimension.spawnParticle(`mc:world_border`, loca_plus, molang); }catch(e){};
    try{ dimension.spawnParticle(`mc:world_border`, loca_minus, molang); }catch(e){};
  };

};

function showParticleZ(center, radius, molang, textureSize, maxTextureSize, remainderSize, textureCount) {
  molang.setFloat(`variable.x`, 0);
  molang.setFloat(`variable.z`, 1);

  if(textureCount > 0){

    molang.setFloat(`variable.size`, maxTextureSize);
    for(let i=0; i<textureCount; i++){
      const loca_plus = {
        x: center.x - (maxTextureSize-radius) - (i*(maxTextureSize*2)),
        y: center.y,
        z: center.z + radius
      };
      const loca_minus = {
        x: center.x - (maxTextureSize-radius) - (i*(maxTextureSize*2)),
        y: center.y,
        z: center.z - radius
      };
      try{ dimension.spawnParticle(`mc:world_border`, loca_plus, molang); }catch(e){};
      try{ dimension.spawnParticle(`mc:world_border`, loca_minus, molang); }catch(e){};
    };

    molang.setFloat(`variable.size`, remainderSize);
    const loca_plus = {
      x: center.x - (maxTextureSize-radius) - (textureCount*maxTextureSize*2) + maxTextureSize - (remainderSize),
      y: center.y,
      z: center.z + radius
    };
    const loca_minus = {
      x: center.x - (maxTextureSize-radius) - (textureCount*maxTextureSize*2) + maxTextureSize - (remainderSize),
      y: center.y,
      z: center.z - radius
    };
    try{ dimension.spawnParticle(`mc:world_border`, loca_plus, molang); }catch(e){};
    try{ dimension.spawnParticle(`mc:world_border`, loca_minus, molang); }catch(e){};

  }else{
    molang.setFloat(`variable.size`, textureSize);
    const loca_plus = {  x: center.x, y: center.y, z: center.z + radius };
    const loca_minus = { x: center.x, y: center.y, z: center.z - radius };
    try{ dimension.spawnParticle(`mc:world_border`, loca_plus, molang); }catch(e){};
    try{ dimension.spawnParticle(`mc:world_border`, loca_minus, molang); }catch(e){};
  };

};