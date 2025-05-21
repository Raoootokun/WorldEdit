import { world, system, Player, BlockPermutation, Block } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { playerDB } from "../database";
import { Vector } from "../libs/Vector";
import { log } from "../libs/tool";
import { config } from "../config";
import { WorldEdit } from "./WorldEdit";
import { History } from "./History";
import { ExetendStructureManager } from "./ExStructureManager";
import { Unitil } from "../Unitil";
import { Tool } from "./Tool";
import { version } from "../index";

const BRUSH_TYPES = [ 
    "paste",
    "sphere", "sp",
    "cylinder", "cy",
    // "smooth", "sm",
    "square", "sq",
    // "paint",
    "struct",
];

export class Brush {

    /**
     * マスクを設定
     * @param {Player} player 
     * @param {[]} inputCmd 
     */
    static musk(player, inputCmd) {
        if(inputCmd.length == 0) {
            playerDB.set(player, "rawMuskBlockDatas", undefined);
            player.sendMessage(`§dマスクを削除しました`);
            return;
        }

        const blockDatas = WorldEdit.changeBlockDatas(player, inputCmd[0]);
        if(!blockDatas)return;
        const rawBlockDatas = WorldEdit.transRawBlockDatas(blockDatas);

        playerDB.set(player, "rawMuskBlockDatas", rawBlockDatas);
        player.sendMessage(`§dマスクを設定しました`);
    }

    //右クリック、左クリックした際に処理を行う
    static run(player, itemStack, block, clickType, eventData) {
        if(!itemStack)return;
        
        const rawBrushOptions = itemStack.getDynamicProperty(`brushOptions`);
        if(!rawBrushOptions)return;

        const brushOptions = JSON.parse(rawBrushOptions);

        switch(brushOptions.type) {
            case `sphere`: Brush.sphere(player, itemStack, block, clickType, eventData, brushOptions); break;
            case `cylinder`: Brush.cylinder(player, itemStack, block, clickType, eventData, brushOptions); break;
            case `square`: Brush.square(player, itemStack, block, clickType, eventData, brushOptions); break;
            case `struct`: Brush.struct(player, itemStack, block, clickType, eventData, brushOptions); break;
        };
    }

    

    /**
     * 球体
     * @param {Player} player 
     * @param {*} itemStack 
     * @param {*} clickType 
     * @param {*} brushOptions 
     */
    static async sphere(player, itemStack, block, clickType, eventData, brushOptions) {
        if(clickType != "use")return;
        if(!Tool.checkVersion(player, brushOptions.version, "brush"))return;

        const viewBlock = WorldEdit.getViewBlock(player);
        if(!viewBlock)return;

        

        const center = viewBlock.location;
        const rawBlockDatas = brushOptions.rawBlockDatas;
        const blockDatas = WorldEdit.transBlockDatas(rawBlockDatas);
        const radius = brushOptions.radius + 2;
        const defaultRadius = brushOptions.radius;
        // log(blockDatas, 1)

        const rawMuskBlockDatas = JSON.parse(JSON.stringify(playerDB.get(player, "rawMuskBlockDatas") ?? "[]"));
        const muskBlockDatas = WorldEdit.transBlockDatas(rawMuskBlockDatas);

        const pos1 = Vector.subtract(center, defaultRadius);
        const pos2 = Vector.add(center, defaultRadius);
        History.save(pos1, pos2, player);

        for (let i = -radius; i <= radius; i++) {
            for (let j = -radius; j <= radius; j++) {// -5;
                for (let k = -radius; k <= radius; k++) {
                    let distance = Math.sqrt(i * i + j * j + k * k);
            
                    let position = null
                    if (distance+1.5 <= radius) {
                        position = {
                        x: center.x + i,
                        y: center.y + j,
                        z: center.z + k
                        };
                    } else if (distance <= radius - 1.5) {
                        position = {
                        x: center.x + i,
                        y: center.y + j,
                        z: center.z + k
                        };
                    }
                    
                    if(position){
                        if(position.y >= -64 && position.y < 320){
                            const targetBlock = player.dimension.getBlock(position);

                            if(muskBlockDatas.length == 0) {
                                WorldEdit.setBlock(blockDatas, null, null, targetBlock);
                            }else {
                                if(WorldEdit.checkMusk(targetBlock, muskBlockDatas)) {
                                    WorldEdit.setBlock(blockDatas, null, null, targetBlock);
                                }
                            }
                            // log(WorldEdit.checkMusk(targetBlock, muskBlockDatas))
                            
                            
                        }
                    }
                }
            }
        };

        //hollow
        if(brushOptions.hollow) {
            const radiusH = radius - 1;

            for (let i = -radiusH; i <= radiusH; i++) {
                for (let j = -radiusH; j <= radiusH; j++) {// -5;
                    for (let k = -radiusH; k <= radiusH; k++) {
                        let distance = Math.sqrt(i * i + j * j + k * k);
                
                        let position = null
                        if (distance+1.5 <= radiusH) {
                            position = {
                            x: center.x + i,
                            y: center.y + j,
                            z: center.z + k
                            };
                        } else if (distance <= radiusH - 1.5) {
                            position = {
                            x: center.x + i,
                            y: center.y + j,
                            z: center.z + k
                            };
                        }
                        
                        if(position){
                            if(position.y >= -64 && position.y < 320){
                                const targetBlock = player.dimension.getBlock(position);
                                if(WorldEdit.checkMusk(targetBlock, blockDatas)) {
                                    player.dimension.setBlockType(position, "air");
                                    WorldEdit.setBlock([ { block:"air", percent:100, } ], null, null, targetBlock);
                                }
                            }
                        }
                    }
                }
            }
        };

        Unitil.itemStackInteractAnim(player);
    }

    /**
     * 柱
     * @param {Player} player 
     * @param {*} itemStack 
     * @param {*} clickType 
     * @param {*} brushOptions 
     */
    static async cylinder(player, itemStack, block, clickType, eventData, brushOptions) {
        if(clickType != "use")return;
        if(!Tool.checkVersion(player, brushOptions.version, "brush"))return;
        
        const viewBlock = WorldEdit.getViewBlock(player);
        if(!viewBlock)return;

        const center = viewBlock.location;
        const rawBlockDatas = brushOptions.rawBlockDatas;
        const blockDatas = WorldEdit.transBlockDatas(rawBlockDatas);
        const radius = brushOptions.radius + 2;
        const height = brushOptions.height;
        const defaultRadius = brushOptions.radius;

        const rawMuskBlockDatas = JSON.parse(JSON.stringify(playerDB.get(player, "rawMuskBlockDatas") ?? "[]"));
        const muskBlockDatas = WorldEdit.transBlockDatas(rawMuskBlockDatas);

        const pos1 = Vector.subtract(center, defaultRadius);
        pos1.y = center.y + (height);
        const pos2 = Vector.add(center, defaultRadius);
        pos2.y = center.y;
        History.save(pos1, pos2, player);

        for (let i = -radius; i <= radius; i++) {
            for (let k = -radius; k <= radius; k++) {
                let distance = Math.sqrt(i * i + k * k);
  
                let position = null
                if (distance+1.5 <= radius) {
                    position = {
                        x: center.x + i,
                        y: center.y,
                        z: center.z + k
                    };
                } else if (distance <= radius - 1.5) {
                    position = {
                        x: center.x + i,
                        y: center.y,
                        z: center.z + k
                    };
                }
                
                if(position){
                    for(let h=0; h<height; h++){
                        position.y += 1;
            
                        if(position.y >= -64 && position.y < 320){
                            const targetBlock = player.dimension.getBlock(position);

                            if(muskBlockDatas.length == 0) {
                                WorldEdit.setBlock(blockDatas, null, null, targetBlock);
                            }else {
                                if(WorldEdit.checkMusk(targetBlock, muskBlockDatas)) {
                                    WorldEdit.setBlock(blockDatas, null, null, targetBlock);
                                }
                            }
                            
                        }
                    }
                    
                }
            }
        };

        //hollow
        if(brushOptions.hollow) {
            const radiusH = radius - 1;

            for (let i = -radiusH; i <= radiusH; i++) {
                for (let k = -radiusH; k <= radiusH; k++) {
                    let distance = Math.sqrt(i * i + k * k);
    
                    let position = null
                    if (distance+1.5 <= radiusH) {
                        position = {
                            x: center.x + i,
                            y: center.y,
                            z: center.z + k
                        };
                    } else if (distance <= radiusH - 1.5) {
                        position = {
                            x: center.x + i,
                            y: center.y,
                            z: center.z + k
                        };
                    }
                    
                    if(position){
                        for(let h=0; h<height; h++){
                            position.y += 1;
                
                            if(position.y >= -64 && position.y < 320){
                                const targetBlock = player.dimension.getBlock(position);
                                if(WorldEdit.checkMusk(targetBlock, blockDatas)) {
                                    player.dimension.setBlockType(position, "air");
                                    WorldEdit.setBlock([ { block:"air", percent:100, } ], null, null, targetBlock);
                                }
                            }
                        }
                        
                    }
                }
            };
        };

        Unitil.itemStackInteractAnim(player);
    }

    /**
     * 正方形
     * @param {Player} player 
     * @param {*} itemStack 
     * @param {*} clickType 
     * @param {*} brushOptions 
     */
    static async square(player, itemStack, block, clickType, eventData, brushOptions) {
        if(clickType != "use")return;
        if(!Tool.checkVersion(player, brushOptions.version, "brush"))return;

        const viewBlock = WorldEdit.getViewBlock(player);
        if(!viewBlock)return;

        const dimension = player.dimension;
        
        const blockDatas = WorldEdit.transBlockDatas(brushOptions.rawBlockDatas);
        const size = brushOptions.size;
        const hollow = brushOptions.hollow;
        const center = Vector.subtract(viewBlock.location, (size-2)/2);

        const rawMuskBlockDatas = JSON.parse(JSON.stringify(playerDB.get(player, "rawMuskBlockDatas") ?? "[]"));
        const muskBlockDatas = WorldEdit.transBlockDatas(rawMuskBlockDatas);

        const pos1 = Vector.add(center, size-1);
        const pos2 = center;
        History.save(pos1, pos2, player);

        for(let x=0; x<size; x++) {
            for(let y=0; y<size; y++) {
                for(let z=0; z<size; z++) {
                    const pos = { x:center.x+x, y:center.y+y, z:center.z+z };
                    if(pos.y >= -64 && pos.y < 320) {
                        const targetBlock = dimension.getBlock(pos);
                        // log(targetBlock);
                        if(muskBlockDatas.length == 0) {
                            WorldEdit.setBlock(blockDatas, null, null, targetBlock);
                        }else {
                            if(WorldEdit.checkMusk(targetBlock, muskBlockDatas)) {
                                WorldEdit.setBlock(blockDatas, null, null, targetBlock);
                            }
                        }
                    }

                    
                }
            }
        }

        if(hollow) {
            const hsize = size-2;
            const hcenter = Vector.add(center, 1);
            for(let x=0; x<hsize; x++) {
                for(let y=0; y<hsize; y++) {
                    for(let z=0; z<hsize; z++) {
                        const pos = { x:hcenter.x+x, y:hcenter.y+y, z:hcenter.z+z };
                        if(pos.y >= -64 && pos.y < 320) {
                            const targetBlock = dimension.getBlock(pos);

                            if(WorldEdit.checkMusk(targetBlock, blockDatas)) {
                                WorldEdit.setBlock([ { block:"air", percent:100, } ], pos, dimension);
                            }
                        }

                        
                    }
                }
            }
        }

        Unitil.itemStackInteractAnim(player);
    }

    /**
     * ストラクト
     * @param {Player} player 
     * @param {*} itemStack 
     * @param {*} clickType 
     * @param {*} brushOptions 
     */
    static async struct(player, itemStack, block, clickType, eventData, brushOptions) {
        if(clickType != "use")return;
        if(!Tool.checkVersion(player, brushOptions.version, "brush"))return;

        const viewBlock = WorldEdit.getViewBlock(player);
        if(!viewBlock)return;

        const dimension = player.dimension;
        const pasteType = brushOptions.pasteType;
        const id = brushOptions.id;
        const structure = ExetendStructureManager.get(id);
        if(!structure)return  player.sendMessage(`§cエラー: 構造物が見つかりません( >> ${id} )`);
        
        const size = structure.size;

        const center = Vector.subtract(viewBlock.location, Vector.divide(Vector.subtract(size, 2), 2));

        const rawMuskBlockDatas = JSON.parse(JSON.stringify(playerDB.get(player, "rawMuskBlockDatas") ?? "[]"));
        const muskBlockDatas = WorldEdit.transBlockDatas(rawMuskBlockDatas);

        if(pasteType == "center") {
            const pos1 = Vector.add(center, Vector.subtract(size, 1));
            const pos2 = center;
            History.save(pos1, pos2, player);

            ExetendStructureManager.place(id, dimension, center);
        }

        if(pasteType == "face") {
            const face = player.getBlockFromViewDirection().face;
            const faceData = getVectorForFace(face);

            const pastePos = center;
            if(faceData.isPlus) {
                pastePos[faceData.axis] += size[faceData.axis];
                
            }
            else pastePos[faceData.axis] -= size[faceData.axis];

            /**
             * 3 = 1;
             * 4 = 1.5
             * 5 = 2;
             */

            const sizeN = size[faceData.axis];
            const sizeM = (sizeN - 1) / 2;

            if(faceData.isPlus) {
                pastePos[faceData.axis] -= sizeM;
            }

            if(!faceData.isPlus) {
                pastePos[faceData.axis] += sizeM;
            }

            ExetendStructureManager.place(id, dimension, pastePos);
        }
        
        Unitil.itemStackInteractAnim(player);
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
        if(itemStack.isStackable)return player.sendMessage(`§cエラー: スタック可能アイテムにブラシを設定することはできません( >> ${itemStack.typeId})`);

        const type = inputCmd[0];
        if(!BRUSH_TYPES.includes(type))return player.sendMessage(`§cエラー: ブラシのタイプが存在しません( >> ${type})`);

        let lore = [
            `§7--------------------`
        ];
        let brushOptions = {};
        

        // 1: setId, 2: radius, 3: hollow
        if(type == "sphere" || type == "sp") {
            const blockDatas = WorldEdit.changeBlockDatas(player, inputCmd[1]);
            if(!blockDatas)return;
            //文字列タイプに変換
            const rawBlockDatas = WorldEdit.transRawBlockDatas(blockDatas);

            const radius = inputCmd[2];
            if(radius < 1)return player.sendMessage(`§c構文エラー: 半径の値が小さすぎます。1以上にしてください( >> ${radius})`);
            if(radius > 10)return player.sendMessage(`§c構文エラー: 半径の値が大きすぎます。10以下にしてください( >> ${radius})`);

            const hollow = inputCmd[3] ?? false;

            lore.push(`§fブロック: ${Tool.getBlockTexts(rawBlockDatas)}`);
            lore.push(`§f半径: ${radius}`);
            lore.push(`§f空洞: ${hollow}`);
            lore.push(`§7--------------------`);
            lore.push(`§d使い方: §f右クリックで視点先に球体を設置します`);

            brushOptions = {
                type: type,
                rawBlockDatas: rawBlockDatas,
                radius: radius,
                hollow: hollow,
            };


        }

        // 1: setId, 2: radius, 3: height, 4: hollow
        if(type == "cylinder" || type == "cy") {
            const blockDatas = WorldEdit.changeBlockDatas(player, inputCmd[1]);
            if(!blockDatas)return;
            //文字列タイプに変換
            const rawBlockDatas = WorldEdit.transRawBlockDatas(blockDatas);

            const radius = inputCmd[2];
            if(radius < 1)return player.sendMessage(`§c構文エラー: 半径の値が小さすぎます。1以上にしてください( >> ${radius})`);
            if(radius > 10)return player.sendMessage(`§c構文エラー: 半径の値が大きすぎます。10以下にしてください( >> ${radius})`);

            const height = inputCmd[3];
            if(height < 1)return player.sendMessage(`§c構文エラー: 高さの値が小さすぎます。1以上にしてください( >> ${height})`);
            if(height > 10)return player.sendMessage(`§c構文エラー: 高さの値が大きすぎます。10以下にしてください( >> ${height})`);

            const hollow = inputCmd[4] ?? false;

            lore.push(`§fブロック: ${Tool.getBlockTexts(rawBlockDatas)}`);
            lore.push(`§f半径: ${radius}`);
            lore.push(`§f高さ: ${height}`);
            lore.push(`§f空洞: ${hollow}`);
            lore.push(`§7--------------------`);
            lore.push(`§d使い方: §f右クリックで視点先に柱体を設置します`);

            brushOptions = {
                type: type,
                rawBlockDatas: rawBlockDatas,
                radius: radius,
                height: height,
                hollow: hollow,
            };


        }

        // 1: radius,
        if(type == "smooth" || type == "sm") {

            const radius = inputCmd[1];
            if(radius < 1)return player.sendMessage(`§c構文エラー: 半径の値が小さすぎます。1以上にしてください( >> ${radius})`);
            if(radius > 10)return player.sendMessage(`§c構文エラー: 半径の値が大きすぎます。10以下にしてください( >> ${radius})`);

            lore = [ 
                `ブラシ`, 
                `type: sphere`,
                `radius: ${radius}`,
            ];

            brushOptions = {
                type: type,
                radius: radius,
            };


        }

        // 1: setId, 2: size, 3: hollow
        if(type == "square" || type == "sq") {
            const blockDatas = WorldEdit.changeBlockDatas(player, inputCmd[1]);
            if(!blockDatas)return;
            //文字列タイプに変換
            const rawBlockDatas = WorldEdit.transRawBlockDatas(blockDatas);

            const size = inputCmd[2];
            if(size < 1)return player.sendMessage(`§c構文エラー: 半径の値が小さすぎます。1以上にしてください( >> ${size})`);
            if(size > 10)return player.sendMessage(`§c構文エラー: 半径の値が大きすぎます。10以下にしてください( >> ${size})`);

            const hollow = inputCmd[3] ?? false;

            lore.push(`§fブロック: ${Tool.getBlockTexts(rawBlockDatas)}`);
            lore.push(`§f大きさ: ${size}`);
            lore.push(`§f空洞: ${hollow}`);
            lore.push(`§7--------------------`);
            lore.push(`§d使い方: §f右クリックで視点先に正方形を設置します`);

            brushOptions = {
                type: type,
                rawBlockDatas: rawBlockDatas,
                size: size,
                hollow: hollow,
            };


        }

        // 1: setId, 2: radius
        if(type == "paint") {
            const blockDatas = WorldEdit.changeBlockDatas(player, inputCmd[1]);
            if(!blockDatas)return;
            //文字列タイプに変換
            const rawBlockDatas = WorldEdit.transRawBlockDatas(blockDatas);

            const radius = inputCmd[2];
            if(radius < 1)return player.sendMessage(`§c構文エラー: 半径の値が小さすぎます。1以上にしてください( >> ${radius})`);
            if(radius > 10)return player.sendMessage(`§c構文エラー: 半径の値が大きすぎます。10以下にしてください( >> ${radius})`);

            lore = [ 
                `ブラシ`, 
                `type: paint`,
                `setBlock: ${rawBlockDatas.length}`,
                `radius: ${radius}`,
            ];

            brushOptions = {
                type: type,
                rawBlockDatas: rawBlockDatas,
                radius: radius,
            };
        }

        // 1: copyId
        if(type == "struct") {
            const id = inputCmd[1]
            const structure = ExetendStructureManager.get(id);
            if(!structure)return player.sendMessage(`§c構文エラー: 建造物が見つかりません( >> ${id})`);

            const size = structure.size;

            let defPasteType = "center";
            const pasteType = inputCmd[2] ?? "center";
            const pastePosList = [ "center", "face" ];
            if(!pastePosList.includes(pasteType))return player.sendMessage(`§c構文エラー: 設置場所の指定は以下から選択してください[${pastePosList}] ( >> ${pasteType} )`);
    
            lore.push(`§fid: ${id}`);
            lore.push(`§f大きさ: ( x:${size.x}, y:${size.y}, z:${size.z})`);
            lore.push(`§f設置場所: ${pasteType}`);
            lore.push(`§7--------------------`);
            lore.push(`§d使い方: §f右クリックで視点先に構造体を設置します`);

            brushOptions = {
                type: type,
                id: id,
                pasteType: pasteType,
            };
        }

        brushOptions.version = version;

        itemStack.nameTag = `§6ブラシ: ${type}`;
        itemStack.setLore(lore);
        itemStack.setDynamicProperty(`toolOptions`);
        itemStack.setDynamicProperty(`brushOptions`, JSON.stringify(brushOptions));
        container.setItem(player.selectedSlotIndex, itemStack);

        player.sendMessage(`§dブラシを作成しました: ${type}`);
    }

    
}

function getVectorForFace(face) {
    switch(face) {
        case "Up": return { axis:"y", isPlus:true }; //return { x:0, y:1, z:0 };
        case "Down": return { axis:"y", isPlus:false }; //return { x:0, y:-1, z:0 };
        
        case "South": return { axis:"z", isPlus:true };//return { x:0, y:1, z:1 };
        case "North": return { axis:"z", isPlus:false };//return { x:0, y:1, z:-1 };

        case "East": return { axis:"x", isPlus:true };//return { x:1, y:1, z:0 };
        case "West": return { axis:"x", isPlus:false };//return { x:0, y:1, z:-1 };
    }
}