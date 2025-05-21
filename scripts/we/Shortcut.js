import { world, system,  } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";

import { config } from "../config";
import { playerDB } from "../database";
import { WorldEdit } from "./WorldEdit";
import { log } from "../libs/tool";

export class Shortcut {
    static showForm(player) {
        const cmds = playerDB.get(player, "shortcutCmds") ?? [];
        if(cmds.length == 0)return; //player.sendMessage(`§c構文エラー: ショートカットにコマンドが追加されていません`);
        
        const form = new ActionFormData()
        form.title(`WorldEdit ショートカット`)
        for(let i=0; i<cmds.length; i++) {
            form.button(`${cmds[i]}\nindex: ${i}`);
        };
        form.show(player).then(res => {
            if(res.canceled)return;
        
            const cmd = cmds[res.selection];
            WorldEdit.run(player, `${config.chatCommandPrefix}${cmd}`, null);
        });
    };

    static add(player, inputCmd) {

        const cmd = inputCmd.join(" ");
        const cmds = playerDB.get(player, "shortcutCmds") ?? [];
        cmds.push(cmd);

        playerDB.set(player, "shortcutCmds", cmds);
        player.sendMessage(`§dショートカットにコマンドを追加しました。(${cmd})`);
    };

    static delete(player, inputCmd) {
        const idx = inputCmd[0];
        if(isNaN(idx))return player.sendMessage(`§c構文エラー: インデックス番号は数値で入力してください( >> ${idx})`);

        const cmds = playerDB.get(player, "shortcutCmds") ?? [];
        const cmd = cmds[idx];
        if(cmd === undefined)return player.sendMessage(`§c構文エラー: 入力したインデックス番号にはショートカットコマンドが存在しません( >> ${idx})`);

        cmds.splice(idx, 1);
        playerDB.set(player, "shortcutCmds", cmds);
        player.sendMessage(`§dショートカットからコマンドを削除しました。(${cmd})`);
    };
};