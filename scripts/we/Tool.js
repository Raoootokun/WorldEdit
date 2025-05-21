import { world, system, Player, Dimension, World, Block, ItemStack } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { playerDB } from "../database";
import { Vector } from "../libs/Vector";
import { log } from "../libs/tool";
import { config } from "../config";
import { WorldEdit } from "./WorldEdit";
import { Unitil } from "../Unitil";
import { version } from "../index";

const TOOL_TYPES = [ 
    "replace", "repl",
    "rlbuild",
    "tree",
    "info",
    "farbuild",
    "lrbuild"
];

const TREE_IDS = [
    // ---- oak ----
    "minecraft:oak_tree_feature",
    "minecraft:oak_tree_with_beehive_feature",
    "minecraft:oak_tree_with_optional_beehive_feature",
    "minecraft:oak_tree_with_vines_feature",
    "minecraft:fancy_oak_tree_feature",
    "minecraft:fancy_oak_tree_with_beehive_feature",
    "minecraft:fancy_oak_tree_with_leaf_litter_and_optional_beehive",
    "minecraft:fancy_oak_tree_with_optional_beehive_feature",
    "minecraft:fallen_oak",
    "minecraft:optional_fallen_oak_tree_feature",
    "minecraft:optional_oak_tree_with_vines_feature",
    "minecraft:random_oak_tree_from_sapling_feature",
    "minecraft:random_oak_tree_with_beehive_from_sapling_feature",
    "minecraft:select_oak_tree_with_leaf_litter_feature",
    "minecraft:select_oak_tree_feature",

    // ---- spruce ----
    "minecraft:fallen_spruce_tree_feature",
    "minecraft:mega_spruce_tree_feature",
    "minecraft:mountain_spruce_tree_feature",
    "minecraft:optional_fallen_spruce_tree_feature",
    "minecraft:optional_spruce_tree_with_vines_feature",
    "minecraft:select_spruce_tree_feature",
    "minecraft:select_standing_spruce_tree_feature",
    "minecraft:spruce_tree_feature",
    "minecraft:spruce_tree_with_vines_feature",

    // ----- birch -----
    "minecraft:birch_tree_feature",
    "minecraft:birch_tree_with_beehive_feature",
    "minecraft:birch_tree_with_optional_beehive_feature",
    "minecraft:fallen_birch_tree_feature",
    "minecraft:fallen_super_birch_tree_feature",
    "minecraft:optional_fallen_birch_tree_feature",
    "minecraft:optional_fallen_super_birch_tree_feature",
    "minecraft:scatter_birch_forest_wildflowers_feature",
    "minecraft:select_birch_tree_feature",
    "minecraft:select_birch_tree_with_leaf_litter_feature",
    "minecraft:select_super_birch_tree_feature",
    "minecraft:super_birch_tree_feature",
    "minecraft:super_birch_tree_with_beehive_feature",
    "minecraft:super_birch_tree_with_optional_beehive_feature",

    // ----- jungle -----
    "minecraft:fallen_jungle_tree_feature",
    "minecraft:jungle_bush_feature",
    "minecraft:jungle_fern_feature",
    "minecraft:jungle_tall_grass_feature",
    "minecraft:jungle_tree_feature",
    "minecraft:jungle_tree_with_cocoa_feature",
    "minecraft:mega_jungle_tree_feature",
    "minecraft:noop_undecorated_jungle_tree_feature",
    "minecraft:optional_fallen_jungle_tree_feature",
    "minecraft:optional_jungle_tree_cocoa_feature",
    "minecraft:optional_undecorated_jungle_tree_with_vines_feature",
    "minecraft:scatter_jungle_plant_feature",
    "minecraft:scatter_jungle_tree_cocoa_feature",
    "minecraft:scatter_jungle_tree_lower_cocoa_feature",
    "minecraft:scatter_jungle_tree_upper_cocoa_feature",
    "minecraft:select_jungle_plant_feature",
    "minecraft:select_jungle_tree_feature",
    "minecraft:select_undecorated_jungle_tree_feature",
    "minecraft:undecorated_jungle_tree_feature",
    "minecraft:undecorated_jungle_tree_with_vines_feature",

    //----- dark_oak
    "minecraft:optional_roofed_tree_with_vines_feature",
    "minecraft:random_roofed_forest_feature",
    "minecraft:random_roofed_forest_feature_with_decoration_feature",
    "minecraft:random_roofed_forest_feature_with_leaf_litter_feature",
    "minecraft:roofed_tree_feature",
    "minecraft:roofed_tree_with_vines_feature",
    "minecraft:select_roofed_tree_feature",

    //---- acasia
    "minecraft:savanna_tree_feature",
]

export class Tool {
    static get treeIds() {
        return TREE_IDS;
    }

    //右クリック、左クリックした際に処理を行う
    static run(player, itemStack, block, eventType, eventData) {
        if(!itemStack)return;
        
        const rawToolOptions = itemStack.getDynamicProperty(`toolOptions`);
        if(!rawToolOptions)return;

        const toolOptions = JSON.parse(rawToolOptions);

        switch(toolOptions.type) {
            case `replace`: Tool.replace(player, itemStack, block, eventType, eventData, toolOptions); break;
            case `repl`: Tool.replace(player, itemStack, block, eventType, eventData, toolOptions); break;
            case `rlbuild`: Tool.rlbuild(player, itemStack, block, eventType, eventData, toolOptions); break;
            case `tree`: Tool.tree(player, itemStack, block, eventType, eventData, toolOptions); break;
            case `info`: Tool.info(player, itemStack, block, eventType, eventData, toolOptions); break;
            case `farbuild`: Tool.farbuild(player, itemStack, block, eventType, eventData, toolOptions); break;
            case `lrbuild`: Tool.lrbuild(player, itemStack, block, eventType, eventData, toolOptions); break;
        };
    }

    /**
     * 
     * @param {Player} player 
     * @param {ItemStack} itemStack 
     * @param {Block} block 
     * @param {*} eventType 
     * @param {*} eventData 
     * @param {*} toolOptions 
     */
    static replace(player, itemStack, block, eventType, eventData, toolOptions) {
        if(eventType == "break") { //copy
            eventData.cancel = true;
            system.run(() => {
                if(!Tool.checkVersion(player, toolOptions.version, "tool"))return;

                const blockPerm = block.permutation;

                toolOptions.rawBlockPermData = {
                    id: blockPerm.type.id,
                    states: blockPerm.getAllStates()
                };

                const typeId = WorldEdit.idReplace(block.typeId);
                itemStack.nameTag = `§6ツール: replace (§f${typeId}§6)`;
                itemStack.setDynamicProperty("toolOptions", JSON.stringify(toolOptions));
                itemStack.setLore([
                    `§7--------------------`,
                    `§fブロック: ${typeId}`,
                    `§7--------------------`,
                    `§d使い方: §fブロックに向かって左クリックでコピー、右クリックでペーストします`
                ]);

                player.getComponent("inventory").container.setItem(player.selectedSlotIndex, itemStack);
                player.onScreenDisplay.setActionBar(`§dブロックをコピーしました: ${block.typeId}`);

                Unitil.itemStackInteractAnim(player);
            });

        }else if(eventType == "interact") { //paste
            eventData.cancel = true;
            system.run(() => {
                if(!Tool.checkVersion(player, toolOptions.version, "tool"))return;

                const rawBlockPermData = toolOptions.rawBlockPermData;
                if(!rawBlockPermData)return;

                const blockPerm = WorldEdit.createBlockPermutation(rawBlockPermData);
                block.setPermutation(blockPerm);

                Unitil.itemStackInteractAnim(player);
            });
        };
    }

    /**
     * 
     * @param {Player} player 
     * @param {*} itemStack 
     * @param {*} eventType 
     * @param {*} brushOptions 
     */
    static tree(player, itemStack, block, eventType, eventData, toolOptions) {
        if(eventType != "use")return;
        if(!Tool.checkVersion(player, toolOptions.version, "tool"))return;

        const viewRaycast = player.getBlockFromViewDirection({ maxDistance:50 });
        if(!viewRaycast)return;

        const viewBlock = WorldEdit.getBlockForFace(viewRaycast.block, viewRaycast.face);
        if(!viewBlock)return;

        const treeId = toolOptions.treeId;

        try{
            const res = player.dimension.placeFeature(treeId, viewBlock.location);
            Unitil.itemStackInteractAnim(player);
        }catch(e){};
        
    }

    /**
     * 
     * @param {Player} player 
     * @param {ItemStack} itemStack 
     * @param {Block} block 
     * @param {} eventType 
     * @param {*} eventData 
     * @param {*} toolOptions 
     * @returns 
     */
    static info(player, itemStack, block, eventType, eventData, toolOptions) {
        if(eventType != "interact")return;
        if(!eventData.isFirstEvent)return;
        if(!Tool.checkVersion(player, toolOptions.version, "tool"))return;
        if(!block)return;

        eventData.cancel = true;
        system.run(() => {
            const id = block.typeId;
            const states = block.permutation.getAllStates();

            player.sendMessage(`§dブロック情報: id: §f${id}§d, states: §f${JSON.stringify(states, null, 2)}`);

            Unitil.itemStackInteractAnim(player);
        });
    }

    /**
     * 
     * @param {Player} player 
     * @param {ItemStack} itemStack 
     * @param {Block} block 
     * @param {} eventType 
     * @param {*} eventData 
     * @param {*} toolOptions 
     * @returns 
     */
    static farbuild(player, itemStack, block, eventType, eventData, toolOptions) {
        if(eventType != "use")return;
        if(!Tool.checkVersion(player, toolOptions.version, "tool"))return;

        eventData.cancel = true;
        system.run(() => {
            const viewBlock = WorldEdit.getViewFaceBlock(player);
            if(!viewBlock)return;

            const rawBlockDatas = toolOptions.rawBlockDatas;
            const blockDatas = WorldEdit.transBlockDatas(rawBlockDatas); 

            WorldEdit.setBlock(blockDatas, null, null, viewBlock);
            Unitil.itemStackInteractAnim(player);
        });
    }

    /**
     * 
     * @param {Player} player 
     * @param {ItemStack} itemStack 
     * @param {Block} block 
     * @param {} eventType 
     * @param {*} eventData 
     * @param {*} toolOptions 
     * @returns 
     */
    static lrbuild(player, itemStack, block, eventType, eventData, toolOptions) {
        if(eventType == "interact") { //設置1
            if(!eventData.isFirstEvent)return;
            eventData.cancel = true;

            system.run(() => {
                if(!Tool.checkVersion(player, toolOptions.version, "tool"))return;

                const targetBlock = WorldEdit.getViewFaceBlock(player);
                const blockDatas = WorldEdit.transBlockDatas(toolOptions.rawRightblockDatas);
                WorldEdit.setBlock(blockDatas, null, null, targetBlock);
                Unitil.itemStackInteractAnim(player);
            });
        }

        if(eventType == "break") { //設置2
            eventData.cancel = true;

            system.run(() => {
                if(!Tool.checkVersion(player, toolOptions.version, "tool"))return;

                const targetBlock = WorldEdit.getViewFaceBlock(player);
                const blockDatas = WorldEdit.transBlockDatas(toolOptions.rawLeftblockDatas);
                WorldEdit.setBlock(blockDatas, null, null, targetBlock);
                Unitil.itemStackInteractAnim(player);
            });
        }
    }

    /**
     * 
     * @param {Player} player 
     */
    static set(player, inputCmd) {
        const container = player.getComponent("inventory").container;
        const itemStack = container.getItem(player.selectedSlotIndex);

        if(!itemStack)return player.sendMessage(`§cエラー: メインハンドのアイテムを取得できませんでした`);
        if([config.wandItemId, config.tpItemId, config.shortcutItemId].includes(itemStack.typeId))return player.sendMessage(`§c構文エラー: ${itemStack.typeId} にツールを設定することはできません`);
        if(itemStack.isStackable)return player.sendMessage(`§cエラー: スタック可能アイテムにツールを設定することはできません( >> ${itemStack.typeId})`);

        const type = inputCmd[0];
        if(!TOOL_TYPES.includes(type))return player.sendMessage(`§cエラー: ツールのタイプが存在しません( >> ${type})`);

        let lore = [
            `§7--------------------`
        ];
        let toolOptions = {};
        

        if(type == "replace" || type == "repl") {
            lore.push(`§fブロック: ---`);
            lore.push(`§7--------------------`);
            lore.push(`§d使い方: §fブロックに向かって左クリックでコピー、右クリックでペーストします`);

            toolOptions = {
                type: type,
                rawBlockData: undefined,
            };
        }

        if(type == "tree") {
            const treeId = inputCmd[1];

            lore.push(`§fツリー: ${treeId}`);
            lore.push(`§7--------------------`);
            lore.push(`§d使い方: §f右クリックで視点先にツリーを設置します`);

            toolOptions = {
                type: type,
                treeId: treeId
            };
        }

        if(type == "info") {
            lore.push(`§d使い方: §fブロックに向かって右クリックでブロックの情報を表示します`);

            toolOptions = {
                type: type,
            };
        }

        if(type == "farbuild") {
            const blockDatas = WorldEdit.changeBlockDatas(player, inputCmd[1]);
            if(!blockDatas)return;
            //文字列タイプに変換
            const rawBlockDatas = WorldEdit.transRawBlockDatas(blockDatas);

            lore.push(`§fブロック: ${Tool.getBlockTexts(rawBlockDatas)}`);
            lore.push(`§7--------------------`);
            lore.push(`§d使い方: §f右クリックで視点先に設定したブロックを設置します`);

            toolOptions = {
                type: type,
                rawBlockDatas: rawBlockDatas
            };
        }

        if(type == "lrbuild") {
            const rightblockDatas = WorldEdit.changeBlockDatas(player, inputCmd[1]);
            if(!rightblockDatas)return;
            //文字列タイプに変換
            const rawRightblockDatas = WorldEdit.transRawBlockDatas(rightblockDatas);

            const leftblockDatas = WorldEdit.changeBlockDatas(player, inputCmd[2]);
            if(!leftblockDatas)return;
            //文字列タイプに変換
            const rawLeftblockDatas = WorldEdit.transRawBlockDatas(leftblockDatas);

            lore.push(`§f右クリック-ブロック: ${Tool.getBlockTexts(rawRightblockDatas)}`);
            lore.push(`§f左クリック-ブロック: ${Tool.getBlockTexts(rawLeftblockDatas)}`);
            lore.push(`§7--------------------`);
            lore.push(`§d使い方: §fブロックに向かって右クリック・左クリックすることで設定したブロックを設置します`);

            toolOptions = {
                type: type,
                rawRightblockDatas: rawRightblockDatas,
                rawLeftblockDatas: rawLeftblockDatas,
            };
        }

        toolOptions.version = version;

        itemStack.nameTag = `§6ツール: ${type}`;
        itemStack.setLore(lore);
        itemStack.setDynamicProperty(`brushOptions`);
        itemStack.setDynamicProperty(`toolOptions`, JSON.stringify(toolOptions));
        container.setItem(player.selectedSlotIndex, itemStack);

        player.sendMessage(`§dツールを作成しました: ${type}`);
    }

    /**
     * 
     * @param {Player} player 
     */
    static none(player, inputCmd) {
        const container = player.getComponent("inventory").container;
        const itemStack = container.getItem(player.selectedSlotIndex);

        if(!itemStack)return player.sendMessage(`§cエラー: メインハンドのアイテムを取得できませんでした`);
   
        const toolOptions = itemStack.getDynamicProperty("toolOptions");
        const brushOptions = itemStack.getDynamicProperty("brushOptions");
        if(!toolOptions && !brushOptions)return player.sendMessage(`§cエラー: アイテムにブラシ、ツールが設定されていません`);

        itemStack.nameTag = undefined;
        itemStack.setLore([]);
        itemStack.setDynamicProperty(`brushOptions`);
        itemStack.setDynamicProperty(`toolOptions`);
        container.setItem(player.selectedSlotIndex, itemStack);

        player.sendMessage(`§dアイテムからブラシ、ツールを削除しました`);
    }

    /**
     * @param {rawBlockData[]} rawBlockDatas 
     */
    static getBlockTexts(rawBlockDatas) {
        const ary = [];

        for(const rawBlockData of rawBlockDatas) {
            const block = rawBlockData.block;

            if(typeof block == "string") {
                ary.push(WorldEdit.idReplace(block));
            }else {
                ary.push(WorldEdit.idReplace(block.id));
            }
        }

        if(ary.length <= 3) {
            return ary.join(", ");
        }else {
            return `${ary[0]}, ${ary[1]}, ${ary[2]}...`;
        }
    }

    static checkVersion(player, _version_, type) {
        let typeName = ``;
        if(type == "tool")typeName = `ツール`;
        if(type == "brush")typeName = `ブラシ`;

        if(!_version_)return player.sendMessage(`§cエラー: ${typeName}のバージョンが最新のものではありません。新しくツールを作成してください( >> ${_version_.join(".")} )`);
        if(_version_.join(".") != version.join("."))return player.sendMessage(`§cエラー: ${typeName}のバージョンが最新のものではありません。新しくツールを作成してください( >> ${_version_.join(".")} )`);
        return true;
    }
}
