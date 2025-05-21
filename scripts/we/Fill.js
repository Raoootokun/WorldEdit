import { BlockVolume, system, Player, world, } from "@minecraft/server";
import { log, random } from "../libs/tool";
import { WorldEdit } from "./WorldEdit";

/**
 * 
 * @param {Vector3} fromPos 
 * @param {Vector3} toPos 
 * @param {any[]} blockDatas 
 * @param {Player} player 
 */
async function set(fromPos, toPos, blockDatas, player, options) {
    
    const startPos = {
        x: Math.min(fromPos.x, toPos.x),
        y: Math.min(fromPos.y, toPos.y),
        z: Math.min(fromPos.z, toPos.z),
    };
    const endPos = {
        x: Math.max(fromPos.x, toPos.x),
        y: Math.max(fromPos.y, toPos.y),
        z: Math.max(fromPos.z, toPos.z),
    };

    const dimension = player.dimension;
    const id = createId(10);
    // dimension.runCommand("tickingarea remove_all")
    dimension.runCommand(`tickingarea add ${startPos.x} ${startPos.y} ${startPos.z} ${endPos.x} ${endPos.y} ${endPos.z} ${id}`);
    await system.waitTicks(1);

    const results = [];

    function* runFillBlocks() {
        if(blockDatas.length == 1) {
            const block = blockDatas[0].block;
    
            for(let x=startPos.x; x<=endPos.x; x++) {
                for(let z=startPos.z; z<=endPos.z; z++) {
                    const res = dimension.fillBlocks(new BlockVolume({ x: x, y:startPos.y, z: z }, { x: x, y:endPos.y, z: z }), block);
                    results.push(res);
                    yield;
                };
            };
     
        }else {
            for(let x=startPos.x; x<=endPos.x; x++) {
                for(let z=startPos.z; z<=endPos.z; z++) {
                    for(let y=startPos.y; y<=endPos.y; y++) {
                        const block = WorldEdit.getRandomBlock(blockDatas);
                        
                        const res = dimension.fillBlocks(new BlockVolume({ x: x, y: y, z: z }, { x: x, y: y, z: z }), block);
                        results.push(res);
                        yield;
                    };
                };
            };
        };

        dimension.runCommand(`tickingarea remove ${id}`);

        if(!options?.hideMessage) {
            const blockCount = results.map(a => { return a.getCapacity(); }).reduce((a, b) => { return a + b; });
            player.sendMessage(`§d操作完了 (${blockCount}ブロック)`);
        };

        if(options?.func) {
            options.func();
        };

        

    };
    system.runJob(runFillBlocks());
};


/**
 * 
 * @param {Vector3} fromPos 
 * @param {Vector3} toPos 
 * @param {any[]} blockData 
 * @param {Player} player 
 */
async function replaceBlocks(fromPos, toPos, blockDatas, replaceBlockDatas, player) {
    
    const startPos = {
        x: Math.min(fromPos.x, toPos.x),
        y: Math.min(fromPos.y, toPos.y),
        z: Math.min(fromPos.z, toPos.z),
    };
    const endPos = {
        x: Math.max(fromPos.x, toPos.x),
        y: Math.max(fromPos.y, toPos.y),
        z: Math.max(fromPos.z, toPos.z),
    };

    const dimension = player.dimension;
    const id = createId(10);
    dimension.runCommand(`tickingarea add ${startPos.x} ${startPos.y} ${startPos.z} ${endPos.x} ${endPos.y} ${endPos.z} ${id}`);
    await system.waitTicks(1);

    let blockCount = 0;
    const results = [];

    function* runReplaceBlocks() {
        if(blockDatas.length == 1 == replaceBlockDatas.length == 1) {
            const id = blockDatas[0].block;
            const replaceId = replaceBlockDatas[0].block;
    
            for(let x=startPos.x; x<=endPos.x; x++) {
                for(let z=startPos.z; z<=endPos.z; z++) {

                    if(typeof replaceId == "string") {
                        const res = dimension.fillBlocks(new BlockVolume({ x: x, y:startPos.y, z: z }, { x: x, y:endPos.y, z: z }), id, { blockFilter: { includeTypes:[replaceId] } });
                        results.push(res);
                    }else {
                        const res = dimension.fillBlocks(new BlockVolume({ x: x, y:startPos.y, z: z }, { x: x, y:endPos.y, z: z }), id, { blockFilter: { includePermutations:[replaceId] } });
                        results.push(res);
                    };
                    yield;
                };
            };
    
        }else {
            for(let x=startPos.x; x<=endPos.x; x++) {
                for(let z=startPos.z; z<=endPos.z; z++) {
                    for(let y=startPos.y; y<=endPos.y; y++) {
                        const block = WorldEdit.getRandomBlock(blockDatas);
                        const replaceBlock = WorldEdit.getRandomBlock(replaceBlockDatas);

                        const targetBlock = dimension.getBlock({ x: x, y:y, z: z });
                        if(WorldEdit.checkMusk(targetBlock, replaceBlockDatas)) {
                            WorldEdit.setBlock(blockDatas, { x: x, y:y, z: z }, dimension, targetBlock);
                            blockCount++;
                        }
                        // if(typeof replaceId == "string") {
                        //     const res = dimension.fillBlocks(new BlockVolume({ x: x, y:startPos.y, z: z }, { x: x, y:endPos.y, z: z }), block, { blockFilter: { includeTypes:[replaceId] } });
                        //     results.push(res);
                        // }else {
                        //     const res = dimension.fillBlocks(new BlockVolume({ x: x, y:startPos.y, z: z }, { x: x, y:endPos.y, z: z }), block, { blockFilter: { includePermutations:[replaceId] } });
                        //     results.push(res);
                        // };
                        yield;
                    };
                };
            };
        };

        dimension.runCommand(`tickingarea remove ${id}`);


        // const blockCount = results?.map(a => { return a.getCapacity(); })?.reduce((a, b) => { return a + b; });
        player.sendMessage(`§d操作完了 (${blockCount}ブロック)`);
    };
    system.runJob(runReplaceBlocks());    
};

function createId(length) {
    let id = `we`;
    for(let i=0; i<length; i++) {
        id = id + `${random(0, 9, true)}`;
    };
    return id;
}

export class Fill {
    static set(fromPos, toPos, blockData, player, options) {
        set(fromPos, toPos, blockData, player, options);
    };

    static replace(fromPos, toPos, blockData, replaceBlockData, player) {
        replaceBlocks(fromPos, toPos, blockData, replaceBlockData, player);
    };

};