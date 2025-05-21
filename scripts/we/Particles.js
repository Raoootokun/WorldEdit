import { world, system, Player, MolangVariableMap } from "@minecraft/server";
import { log } from "../libs/tool";
import { playerDB } from "../database";
import { Vector } from "../libs/Vector";
import { WorldEdit } from "./WorldEdit";

export class Particles {

    static id = "minecraft:wax_particle";
    
    /** @type {MolangVariableMap[]} */
    static molangList = []

    static showForm(player) {
        const particleOptions = playerDB.get(player, "particleOptions") ?? {};

        const form = new ModalFormData();
        form.title(`WorldEdit Particles`);
        form.toggle(`pos1`, { defaultValue:particleOptions.pos1 ?? false });
        form.toggle(`pos2`, { defaultValue:particleOptions.pos2 ?? false });
        form.toggle(`volume`, { defaultValue:particleOptions.volume ?? false });
        form.show(player).then(res => {
            if(res.canceled)return;

            playerDB.set(player, "particleOptions", {
                pos1: res.formValues[0],
                pos2: res.formValues[1],
                volume: res.formValues[2],
            });
            player.sendMessage(`§dparticlesの設定を保存しました`);
        });
    }
    
    /**
     * ブロック状のパーティクルを表示します
     * @param {Player} player 
     * @param {*} pos 
     * @param {*} particleType 
     */
    static spawnBlock(player, pos, molangNumber) {
        if(!pos)return;

        const startPos = {
            x: pos.x - 0.5,
            y: pos.y - 0.5,
            z: pos.z - 0.5,
        };
        const endPos = {
            x: pos.x + 0.5,
            y: pos.y + 0.5,
            z: pos.z + 0.5,
        };

        for(let x=startPos.x; x<=endPos.x; x++) {
            for(let y=startPos.y; y<=endPos.y; y++) {
                for(let z=startPos.z; z<=endPos.z; z++) {
                    const _pos_ = { x:x+0.5, y:y+0.5, z:z+0.5 };

                    try{
                        player.spawnParticle(Particles.id, _pos_, Particles.molangList[molangNumber]);
                    }catch(e){};
                }
            }
        }
    }

    /**
     * 
     * @param {Player} player 
     * @param {*} pos1 
     * @param {*} pos2 
     * @param {*} molangNumber 
     */
    static spawnBox(player, pos1, pos2, molangNumber) {
        if(!pos1)return;
        if(!pos2)return;

        const startPos = WorldEdit.getMinPos(pos1, pos2);
        const endPos = WorldEdit.getMaxPos(pos1, pos2);

        Particles.spawnLine(player, { x:startPos.x, y:startPos.y, z:startPos.z }, { x:endPos.x+1, y:startPos.y, z:startPos.z }, molangNumber);
        Particles.spawnLine(player, { x:startPos.x, y:endPos.y+1, z:startPos.z }, { x:endPos.x+1, y:endPos.y+1, z:startPos.z }, molangNumber);
        Particles.spawnLine(player, { x:endPos.x+1, y:endPos.y+1, z:endPos.z+1 }, { x:startPos.x, y:endPos.y+1, z:endPos.z+1 }, molangNumber);
        Particles.spawnLine(player, { x:endPos.x+1, y:startPos.y, z:endPos.z+1 }, { x:startPos.x, y:startPos.y, z:endPos.z+1 }, molangNumber);

        Particles.spawnLine(player, { x:startPos.x, y:startPos.y, z:startPos.z }, { x:startPos.x, y:endPos.y+1, z:startPos.z }, molangNumber);
        Particles.spawnLine(player, { x:endPos.x+1, y:startPos.y, z:startPos.z }, { x:endPos.x+1, y:endPos.y+1, z:startPos.z }, molangNumber);
        Particles.spawnLine(player, { x:endPos.x+1, y:endPos.y+1, z:endPos.z+1 }, { x:endPos.x+1, y:startPos.y, z:endPos.z+1 }, molangNumber);
        Particles.spawnLine(player, { x:startPos.x, y:endPos.y+1, z:endPos.z+1 }, { x:startPos.x, y:startPos.y, z:endPos.z+1 }, molangNumber);

        Particles.spawnLine(player, { x:startPos.x, y:startPos.y, z:startPos.z }, { x:startPos.x, y:startPos.y, z:endPos.z+1 }, molangNumber);
        Particles.spawnLine(player, { x:startPos.x, y:endPos.y+1, z:startPos.z }, { x:startPos.x, y:endPos.y+1, z:endPos.z+1 }, molangNumber);
        Particles.spawnLine(player, { x:endPos.x+1, y:endPos.y+1, z:endPos.z+1 }, { x:endPos.x+1, y:endPos.y+1, z:startPos.z }, molangNumber);
        Particles.spawnLine(player, { x:endPos.x+1, y:startPos.y, z:endPos.z+1 }, { x:endPos.x+1, y:startPos.y, z:startPos.z }, molangNumber);
    }


    static spawnLine(player, posA, posB, molangNumber) {
        const startPos = WorldEdit.getMinPos(posA, posB);
        const endPos = WorldEdit.getMaxPos(posA, posB);

        const n = 1;
        const m = 0;
        for(let x=startPos.x; x<=endPos.x+m; x+=n) {
            for(let y=startPos.y; y<=endPos.y+m; y+=n) {
                for(let z=startPos.z; z<=endPos.z+m; z+=n) {
                    const _pos_ = { x:x+0.0, y:y+0.0, z:z+0.0 };

                    try{ player.spawnParticle(Particles.id, _pos_, Particles.molangList[molangNumber]); }catch(e){};
                }
            }
        }
    }
}

system.run(() => {

    const pos1 = new MolangVariableMap();
    pos1.setColorRGB(`variable.color`, { red:1, green:0, blue:0 });

    const pos2 = new MolangVariableMap();
    pos2.setColorRGB(`variable.color`, { red:0, green:0, blue:1 });

    const volume = new MolangVariableMap();
    volume.setColorRGB(`variable.color`, { red:1, green:1, blue:1 });

    Particles.molangList = [
        pos1, pos2, volume
    ];

    for(const molang of Particles.molangList) {
        molang.setVector3("variable.direction", { x:0, y:0, z:0 });
    }
});