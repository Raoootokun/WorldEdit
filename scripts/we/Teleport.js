import { world, system,  } from "@minecraft/server";
import { config } from "../config";
import { Vector } from "../libs/Vector";

export class Teleport {
    static through(player) {
        const vec = player.getViewDirection();
        const dimension = player.dimension;
        const maxDistance = 100;
    
        const blockData = player.getBlockFromViewDirection();
        if(!blockData)return;

        const block = blockData.block;
        if(!block)return;

        for(let i=0; i<maxDistance; i++){
            const teleLoca = Vector.add(block.location, Vector.multiply(vec, i));
            if(teleLoca.y >= -64 && teleLoca.y <= 320){
                if(dimension.getBlock(teleLoca)?.isAir)return player.teleport(teleLoca);
            }else{
                return player.teleport(teleLoca);
            };
        };

    };

    static straight(player) {
        const vec = player.getViewDirection();
        const dimension = player.dimension;
        const maxDistance = 100;
        
        for(let i=0; i<maxDistance; i++){
            const teleLoca = Vector.add(player.location, Vector.multiply(vec, 1));
            
            if(teleLoca.y >= -64 && teleLoca.y <= 320){
                const checkBlock = dimension.getBlock(teleLoca);
                if(checkBlock && !checkBlock.isAir)return;
            };
            
            player.tryTeleport(teleLoca);
        };  
    };
};