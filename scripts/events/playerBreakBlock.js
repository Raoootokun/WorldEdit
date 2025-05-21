import { world, system  } from "@minecraft/server";
import { config } from "../config";
import { WorldEdit } from "../we/WorldEdit";
import { Vector } from "../libs/Vector";
import { Teleport } from "../we/Teleport";
import { Tool } from "../we/Tool";
import { Brush } from "../we/Brush";
import { Unitil } from "../Unitil";


world.beforeEvents.playerBreakBlock.subscribe(ev => {
    const { player, block, itemStack, } = ev;

    if(!WorldEdit.checkOp(player))return;
    if(!player.canUseAdventure && player.getGameMode() == "adventure")return;

    if(itemStack?.typeId == config.wandItemId) {
		ev.cancel = true;
		system.run(() => {
			WorldEdit.pos1(player, block.location);
			Unitil.itemStackInteractAnim(player);
		});
    };

    if(itemStack?.typeId == config.tpItemId) {
		ev.cancel = true;
      	system.run(() => { Teleport.through(player); });
    };

    Brush.run(player, itemStack, block, "break", ev);
    Tool.run(player, itemStack, block, "break", ev);
});