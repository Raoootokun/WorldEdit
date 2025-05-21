import { BlockVolume, system, Player, world, } from "@minecraft/server";
import { log, random } from "../libs/tool";
import { playerDB } from "../database";
import { ExetendStructureManager } from "./ExStructureManager";
import { WorldEdit } from "./WorldEdit";


export class History {
    /**
     * @param {Vector3} fromPos 
     * @param {Vector3} toPos 
     * @param {Player} player 
     */
    static async save(fromPos, toPos, player) {
        const startPos = {
            x: Math.min(fromPos.x, toPos.x),
            y: Math.min(fromPos.y, toPos.y),
            z: Math.min(fromPos.z, toPos.z),
        };
    
        const undoId = `we_undo_${player.id}`;
        for(const anyId of ExetendStructureManager.getAllIds()) {
            if(anyId.startsWith(undoId)) {
                ExetendStructureManager.delete(anyId);
            };
        };
        
        playerDB.set(player, `undoPos`, startPos);
        const res = ExetendStructureManager.save(undoId, player.dimension, fromPos, toPos);
    };

    /**
     * @param {Player} player 
     */
    static async undo(player) {
        const pos = playerDB.get(player, "undoPos");
        if(!pos)return player.sendMessage(`§d1つ前の作業が見つかりません`);

        const undoId = `we_undo_${player.id}`;
        const size = ExetendStructureManager.get(undoId).size;

        //redo用保存
        const redoId = `we_redo_${player.id}`;
        for(const anyId of ExetendStructureManager.getAllIds()) {
            if(anyId.startsWith(redoId))ExetendStructureManager.delete(anyId);
        };

        playerDB.set(player, `redoPos`, pos);
        ExetendStructureManager.save(redoId, player.dimension, pos, { 
            x:pos.x + size.x - 1, 
            y:pos.y + size.y - 1, 
            z:pos.z + size.z - 1, 
        });

        ExetendStructureManager.place(undoId, player.dimension, pos);
        player.sendMessage(`§d作業を1つ前に戻しました`);
    };

    /**
     * @param {Player} player 
     */
    static redo(player) {
        const pos = playerDB.get(player, "redoPos");
        if(!pos)return player.sendMessage(`§d1つ先の作業が見つかりません`);

        const redoId = `we_redo_${player.id}`;

        ExetendStructureManager.place(redoId, player.dimension, pos);
        player.sendMessage(`§d作業を1つ先に戻しました`);
    };

    /**
     * @param {Player} player 
     */
    static clear(player) {
        playerDB.set(player, "undoPos", undefined);
        playerDB.set(player, "redoPos", undefined);

        ExetendStructureManager.delete(`we_undo_${player.id}`);
        ExetendStructureManager.delete(`we_redo_${player.id}`);

        player.sendMessage(`§dundo,redoのデータを初期化しました`);
    };
}