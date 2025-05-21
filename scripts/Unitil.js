import { world, system, Player, ItemStack, ItemTypes } from "@minecraft/server";
import { ActionFormData, ModalFormData, MessageFormData, uiManager } from "@minecraft/server-ui";
import { log, random } from "./libs/tool";

export class Unitil {
    
    /** @type {string[]} */
    static itemTypeIds;

    static INIT_LOAD() {
        Unitil.itemTypeIds = ItemTypes.getAll().map(a => { return a.id.replace("minecraft:", ""); });
    }
    /**
     * @param {Player} source
     * @param {string} itemId 
     * @param {Player[]} players 
     * @param {number} amount 
     * @param {object} options 
     */
    static give(source, itemId, players, amount, options) {
        if(!Unitil.itemTypeIds.includes(itemId))return;
        if(isNaN(amount))return;

        //ItemStack 作成
        const itemStack = new ItemStack(itemId, amount);

        //options
        if(options.name) {
            itemStack.nameTag = options.name;
        }

        if(options.lore) {
            itemStack.setLore(options.lore);
        }

        for(const player of players) {
            const container = player.getComponent("inventory").container;
            container.addItem(itemStack);
        }
    }

    static killitem(player) {
        for(const item of player.dimension.getEntities({ type:"item" })) {
            item.remove();
        };
        player.sendMessage(`§dドロップアイテムを消去しました`);
    };

    static copyitem(player, inputCmd) {
        const container = player.getComponent("inventory").container;
        const itemStack = container.getItem(player.selectedSlotIndex);
        if(!itemStack)return player.sendMessage(`§c構文エラー: メインハンドのアイテムを取得できませんでした`);

        const count = inputCmd[0] ?? 1;
        if(isNaN(count))return player.sendMessage(`§c構文エラー: 複製する数値で指定してください( >> ${count})`);
        if(count <= 0)return player.sendMessage(`§c構文エラー: 複製する数値で1以上で指定してください( >> ${count})`);
        
        for(let i=0; i<count; i++){
            container.addItem(itemStack);
        };
        player.sendMessage(`§dアイテムを複製しました(個数: ${count})`);
    };

    static transitem(player, inputCmd) {
        const container = player.getComponent("inventory").container;
        const itemStack = container.getItem(player.selectedSlotIndex);
        if(!itemStack)return player.sendMessage(`§cエラー: メインハンドのアイテムを取得できませんでした`);

        const targets = inputCmd[0];
        if(targets.length == 0)return player.sendMessage(`§cエラー: プレイヤーが見つかりません`);

        
        for(const target of targets) {
            const targetContainer = target.getComponent("inventory").container;
            targetContainer.addItem(itemStack);

            player.sendMessage(`§d${target.name} にアイテムを転送しました`);
            target.sendMessage(`§d${player.name} からアイテムを受け取りました`);
        }
    };

    static gamemodeForm(player) {
        const modeDatas = [
            { text:`サバイバル`, mode:`survival` },
            { text:`クリエイティブ`, mode:`creative` },
            { text:`アドベンチャー`, mode:`adventure` },
            { text:`スペクテイター`, mode:`spectator` },
        ];

        const form = new ActionFormData();
        form.title(`WorldEdit ゲームモード`);
        for(const modeData of modeDatas) {
            form.button(modeData.text);
        }
        form.show(player).then(res => {
            if(res.canceled)return;

            const modeData = modeDatas[res.selection].mode;
            player.setGameMode(modeData);
        })
    }


    /**
     * @param {Player} player 
     */
    static itemStackInteractAnim(player) {
        const container = player.getComponent("inventory").container;
        const itemStack = container.getItem(player.selectedSlotIndex);

        itemStack.setDynamicProperty(`anim`, random(0,9));
        container.setItem(player.selectedSlotIndex, itemStack);
    }
}

system.run(() => {
    Unitil.INIT_LOAD();
})