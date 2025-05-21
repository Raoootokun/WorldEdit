import { world, system, Player, MolangVariableMap } from "@minecraft/server";
import { config } from "../config";
import { playerDB } from "../database";
import { Vector } from "../libs/Vector";
import { log } from "../libs/tool";
import { WorldEdit } from "../we/WorldEdit";
import { Particles } from "../we/Particles";


let tick = 0;
system.runInterval(() => {
    if(tick >= 72000)tick = 0;

    const players = world.getPlayers();

    for(const player of players) {
        if(!WorldEdit.checkOp(player))continue;

        const pos1 = playerDB.get(player, "pos1");
        const pos2 = playerDB.get(player, "pos2");

        if(tick % 5 == 0) {
            //パーティクル表示
            const particleOptions = playerDB.get(player, "particleOptions") ?? {};

            if(particleOptions.pos1)Particles.spawnBlock(player, pos1, 0);
            if(particleOptions.pos2)Particles.spawnBlock(player, pos2, 1);
            if(particleOptions.volume)Particles.spawnBox(player, pos1, pos2, 2);
        }

        const actionbarTexts = [];

        const actionbarOptions = playerDB.get(player, "actionbarOptions") ?? {};  

        if(actionbarOptions.pos) {
            const pos = WorldEdit.getPlayerLocation(player);
            actionbarTexts.push(`§dpos: §f${pos.x}, ${pos.y}, ${pos.z}`);
        }
        if(actionbarOptions.item) {
            const itemStack = player.getComponent("inventory").container.getItem(player.selectedSlotIndex);
            actionbarTexts.push(`§ditem: §f${itemStack?.typeId ?? "---"}`);
        }
        if(actionbarOptions.dimension)actionbarTexts.push(`§ddimension: §f${player.dimension.id}`);
        if(actionbarOptions.viewBlock || actionbarOptions.viewBlockStates) {
            const viewRaycast = player.getBlockFromViewDirection();
            let viewBlockId = `---`;
            let viewBlockStates = `---`;
            if(viewRaycast) {
                const viewBlock = viewRaycast.block;
                if(viewBlock.isValid) {
                    viewBlockId = viewBlock.typeId;
                    viewBlockStates = JSON.stringify(viewBlock.permutation.getAllStates(), null, 1);
                }
            }

            if(actionbarOptions.viewBlock)actionbarTexts.push(`§dviewblock: §f${viewBlockId}`);
            if(actionbarOptions.viewBlockStates)actionbarTexts.push(`§dviewblockStates: §f${viewBlockStates}`);
        }
        if(actionbarOptions.entities)actionbarTexts.push(`§dentities: §f${player.dimension.getEntities().length}`);
        
        if(actionbarTexts.length > 0)player.onScreenDisplay.setActionBar(actionbarTexts.join("\n"));
    
        // if(player.inventorySub == undefined)player.inventorySub
    };

    tick++;
}, 0);




 
function createInventory(player) {
    player.inventorySub = {
        inventory: [],
        armor: {
            head: undefined,
            chest: undefined,
            legs: undefined,
            feet: undefined,
        }
    }
}

