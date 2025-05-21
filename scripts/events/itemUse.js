import { world, system } from "@minecraft/server";
import { config } from "../config";
import { Teleport } from "../we/Teleport";
import { log } from "../libs/tool";
import { Shortcut } from "../we/Shortcut";
import { Brush } from "../we/Brush";
import { Tool } from "../we/Tool";
import { WorldEdit } from "../we/WorldEdit";


world.afterEvents.itemUse.subscribe(ev => {
    const { source, itemStack } = ev;

    if(!WorldEdit.checkOp(source))return;
    if(!config.canUseAdventure && source.getGameMode() == "adventure")return;

    if(itemStack.typeId == config.tpItemId)Teleport.straight(source);

    if(itemStack.typeId == config.shortcutItemId)Shortcut.showForm(source);

    
  	Brush.run(source, itemStack, null, "use", ev);
  	Tool.run(source, itemStack, null, "use", ev);

});
 
  

async function smooth(player, setBlockId, replaceBlockId,  center, radius_) {
  //log(`smooth: ${radius_}`);
  const radius = radius_+2;
  const dimension = player.dimension;
  const locas = [];

  for (let i = -radius; i <= radius; i++) {
    for (let j = -radius; j <= radius; j++) {
      for (let k = -radius; k <= radius; k++) {
        let distance = Math.sqrt(i * i + j * j + k * k);

        let position = null
        if (distance+1.5 <= radius) {
          position = {
            x: center.x + i,
            y: center.y + j,
            z: center.z + k
          };
        } else if (distance <= radius - 1.5) {
          position = {
            x: center.x + i,
            y: center.y + j,
            z: center.z + k
          };
        };
        if(position){
          if(position.y >= -64 && position.y < 320){
            const block = player.dimension.getBlock(position);
            if(!block.isAir)locas.push(block.location);
             
          }
        }
      }
    }
  };

  for(const loca of locas){

    const block = dimension.getBlock(loca);
    try{
      var blockUnder = block.below();//中心から-Y
    }catch(e){
      continue;
    }

    if(!block.isAir){

      //n
      const blockN = block.north(1);//中心から x
      const blockN1 = block.north(2);//中心から x1
      const blockN2 = block.north(3);//中心から x2
      const blockNU = blockN.below();
      if(blockN.isAir && !blockN1.isAir && !blockNU.isAir){
        blockN.setType(block.typeId);
      };
      if(blockN.isAir && blockN1.isAir && !blockN2.isAir && !blockNU.isAir){
        blockN1.setType(block.typeId);
        blockN.setType(block.typeId);
      };

       

      const blockS = block.south(1);//中心から x
      const blockS1 = block.south(2);//中心から x
      const blockS2 = block.north(3);//中心から x2
      const blockSU = blockS.below();
      if(blockS.isAir && !blockS1.isAir && !blockSU.isAir){
        blockS.setType(block.typeId);
      };
      if(blockN.isAir && blockN1.isAir && !blockS2.isAir && !blockSU.isAir){
        blockN1.setType(block.typeId);
        blockN.setType(block.typeId);
      };

      const blockW = block.west(1);//中心から x
      const blockW1 = block.west(2);//中心から x
      const blockW2 = block.north(3);//中心から x2
      const blockWU = blockW.below();
      if(blockW.isAir && !blockW1.isAir && !blockWU.isAir){
        blockW.setType(block.typeId);
      };
      if(blockN.isAir && blockN1.isAir && !blockW2.isAir && !blockWU.isAir){
        blockN1.setType(block.typeId);
        blockN.setType(block.typeId);
      };

      const blockE = block.east(1);//中心から x
      const blockE1 = block.east(2);//中心から x
      const blockE2 = block.north(3);//中心から x2
      const blockEU = blockE.below();
      if(blockE.isAir && !blockE1.isAir && !blockEU.isAir){
        blockE.setType(block.typeId);
      };
      if(blockN.isAir && blockN1.isAir && !blockE2.isAir && !blockEU.isAir){
        blockN1.setType(block.typeId);
        blockN.setType(block.typeId);
      };

       

    };
    
    if(!blockUnder.isAir){

      const blockUN = blockUnder.north();//中心から-Y +X
      if(blockUN.isAir){
        const blockUNU = blockUnder.below();//中心から-Y2  gass
        if(!blockUNU.isAir){
          let noAirC = 0;
          for(let i=1; i<3; i++){
            const __block = blockUNU.north(i);
            if(!__block.isAir)noAirC++;
          };
          if(noAirC >= 1){
            if(blockUN.location.y >= -64)dimension.setBlockType(blockUN.location, block.typeId);
          };
        };
      };


      const blockUS = blockUnder.south();
      if(blockUS.isAir){
        const blockUSU = blockUnder.below();//中心から-Y2  gass
        if(!blockUSU.isAir){
          let noAirC = 0;
          for(let i=1; i<3; i++){
            const __block = blockUSU.south(i);
            if(!__block.isAir)noAirC++;
          };

          if(noAirC >= 1){
            if(blockUS.location.y >= -64)dimension.setBlockType(blockUS.location, block.typeId);
          };
        };
      };

      const blockUE = blockUnder.east();
      if(blockUE.isAir){
        const blockUEU = blockUnder.below();//中心から-Y2  gass
        if(!blockUEU.isAir){
          let noAirC = 0;
          for(let i=1; i<3; i++){
            const __block = blockUEU.east(i);
            if(!__block.isAir)noAirC++;
          };

          if(noAirC >= 1){
            if(blockUE.location.y >= -64)dimension.setBlockType(blockUE.location, block.typeId);
          };
        };
      };


      const blockUW = blockUnder.west();
      if(blockUW.isAir){
        const blockUWU = blockUnder.below();//中心から-Y2  gass
        if(!blockUWU.isAir){
          let noAirC = 0;
          for(let i=1; i<3; i++){
            const __block = blockUWU.west(i);
            if(!__block.isAir)noAirC++;
          };

          if(noAirC >= 1){
            if(blockUW.location.y >= -64)dimension.setBlockType(blockUW.location, block.typeId);
          };
        };
      };




    };
  };
};
