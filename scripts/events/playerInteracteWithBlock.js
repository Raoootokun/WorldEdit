import { world, system  } from "@minecraft/server";
import { config } from "../config";
import { WorldEdit } from "../we/WorldEdit";
import { Vector } from "../libs/Vector";
import { log } from "../libs/tool";
import { Tool } from "../we/Tool";
import { Brush } from "../we/Brush";
import { Unitil } from "../Unitil";

world.beforeEvents.playerInteractWithBlock.subscribe(ev => {
    const { player, block, itemStack, isFirstEvent, blockFace } = ev;
    
    if(!WorldEdit.checkOp(player))return;
    if(!player.canUseAdventure && player.getGameMode() == "adventure")return;
    
    if(itemStack?.typeId == config.wandItemId) {
		ev.cancel = true;
        if(isFirstEvent) system.run(() => {
            WorldEdit.pos2(player, block.location);
            Unitil.itemStackInteractAnim(player);
        });
       
    };
    
    Brush.run(player, itemStack, block, "interact", ev);
    Tool.run(player, itemStack, block, "interact", ev);
});