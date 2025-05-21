import { world, system, BlockTypes, Player, BlockPermutation, Block, World, Direction, Dimension, BlockType } from "@minecraft/server";
import { config } from "../config";
import { version } from "../index";
import { log } from "../libs/tool";
import { ExetendStructureManager } from "./ExStructureManager";
import { Help } from "./Help";
import { playerDB } from "../database";
import { Fill } from "./Fill";
import { History } from "./History";
import { Vector } from "../libs/Vector";
import { Shortcut } from "./Shortcut";
import { Tool } from "./Tool";
import { Brush } from "./Brush";

/** @type {string | BlockPermutation} */
const BlockData = {};

export class WorldEdit {
    /** @type {string[]} */
    static BLOCK_IDS;

    static __INIT_LOAD__() {
        this.BLOCK_IDS = BlockTypes.getAll().map(a => { return a.id.replace("minecraft:", ""); });
    };

    //コマンド呼び出しデータ
    static COMMANDS = [
        { key:"help", func:this.help },
        { key:"version", func:this.version, },
        { key:"v", func:this.version, },

        { key:"pos1", func:this.pos1, },
        { key:"pos2", func:this.pos2, },
        { key:"undo", func:this.undo, },
        { key:"redo", func:this.redo, },
        { key:"clearhistory", func:this.clearhistory, },
        
        { key:"info", func:this.info, },
        { key:"i", func:this.info, },
        { key:"infoview", func:this.infoview, },
        { key:"iv", func:this.infoview, },
        { key:"getview", func:this.getview, },

        { key:"set", func:this.set, },
        { key:"replace", func:this.replace, },
        { key:"repl", func:this.replace, },
        { key:"copy", func:this.copy, },
        { key:"paste", func:this.paste, },
        { key:"fill", func:this.fill, },
        
        { key:"center", func:this.center, },
        { key:"size", func:this.size, },
        { key:"count", func:this.count, },
        { key:"move", func:this.move, },
        { key:"stack", func:this.stack, },
        { key:"brush", func:this.brush, },
        { key:"br", func:this.brush, },
        { key:"musk", func:this.musk, },
        { key:"killitem", func:this.killitem, },
        { key:"ki", func:this.killitem, },
        { key:"copyitem", func:this.copyitem, },
        { key:"ci", func:this.copyitem, },
    
        { key:"fixwater", func:this.fixwater, },
        { key:"fixlava", func:this.fixlava, },
        { key:"overlay", func:this.overlay, },
        { key:"tool", func:this.tool, },
    
        { key:"unstack", func:this.unstack, },
        { key:"us", func:this.unstack, },
        { key:"ascend", func:this.ascend, },
        { key:"as", func:this.ascend, },
        { key:"descend", func:this.descend, },
        { key:"des", func:this.descend, },
        { key:"ceil", func:this.ceil, },

        { key:"shortcut", func:this.shortcut, },
        { key:"sc", func:this.shortcut, },
    ];

    /**
     * チャットからコマンドを呼び出す処理
     * @param {Player} player 
     * @param {string} inputCmd 
     */
    static run(player, inputMsg, eventData) {
        if(!player.isOp() && !player.hasTag(config.canUseTag))return;
        if(!inputMsg.startsWith(config.chatCommandPrefix))return;
        if(eventData)eventData.cancel = true;

        const inputCmd = inputMsg.replace(config.chatCommandPrefix, "").split(" ");
        const idx = this.COMMANDS.map(obj => { return obj.key; }).indexOf(inputCmd[0]);
        if(idx == -1)return player.sendMessage(`§c構文エラー: コマンドが存在しません >> ${inputCmd[0]}`);

        const command = this.COMMANDS[idx];
        const func = command.func;
        if(!func)return player.sendMessage(`§c構文エラー: このコマンドは現在未実装です`);

        inputCmd.splice(0, 1);
        system.run(() => { func(player, inputCmd); });
    };

    /**
     * 入力したコマンドをブロックデータに変換
     * @param {Player} player 
     * @param {string} rawBlockData 
     * @returns {[]}
     */
    static changeBlockDatas(player, rawBlockData) {
        if(!rawBlockData)return player.sendMessage(`§c構文エラー: ブロックデータを入力してください > ${rawBlockData}`);

        const res = [];
        const container = player.getComponent("inventory").container;

        // "." を基準に配列か
        const rawBlockDatas = rawBlockData.split(".");

        for(const rawBlockData of rawBlockDatas) {
            // "-" を基準に配列か
            const ary = rawBlockData.split("-");
            //[加工前] string | main | view | slotIndex(number)
            let block = WorldEdit.idReplace(ary[0]);

            //メインハンドのアイテムを取得
            if(block == "main") { 
                block = WorldEdit.idReplace(container.getItem(player.selectedSlotIndex)?.typeId);
                if(!block)return player.sendMessage(`§cエラー: メインハンドのブロックを取得できませんでした`);
            }

            //視点先のブロックの取得
            if(block == "view") {
                const viewBlock = player.getBlockFromViewDirection({ maxDistance:50 })?.block;
                if(!viewBlock)return player.sendMessage(`§cエラー: 視点先のブロックを取得できませんでした`);

                block = BlockPermutation.resolve(viewBlock.typeId, viewBlock.permutation.getAllStates());
            };

            //スロットから取得
            if(!isNaN(block)) {
                const slotIndex = Number(block);
                if(slotIndex < 0 || slotIndex > 36)return player.sendMessage(`§cエラー: slotIndexの値は0~35で入力してください( >> ${slotIndex})`);

                block = WorldEdit.idReplace(container.getItem(slotIndex)?.typeId);
                if(!block)return player.sendMessage(`§cエラー: スロット[${slotIndex}]のブロックを取得できませんでした`);
            }

            //最終チェック
            if(typeof block == "string") {
                if(!WorldEdit.BLOCK_IDS.includes(block))return player.sendMessage(`§c構文エラー: ブロックIDが存在しません > ${block}`);
            }

            //割合
            let percent = ary[1];
            //未入力なら100%にする
            if(percent == undefined)percent = 100;
            if(isNaN(percent))return player.sendMessage(`§c構文エラー: ブロックの割合は数値で入力してください > ${percent}`);

            res.push({
                block: block,
                percent: percent * 1
            });
        }

        const total = res.map(a => { return a.percent; }).reduce((a, b) => { return a+b; }, 0);
        const blockDatas = res.map(a => { return { block:a.block, percent:(a.percent/total) }; });
        return blockDatas;
    }

    /**
     * 
     * @param {[]} blockDatas 
     * @returns {BlockType | BlockPermutation}
     */
    static getRandomBlock(blockDatas) {
        const random = Math.random();
        let res = "";
        let rate = 0;
        for(const obj of blockDatas){
            rate += obj.percent;
            if(random < rate){
                res = obj;
                break;
            };
        };
        return res.block;
    };

    /**
     * rawBlockPermDataを元に作成
     * @param {Object} rawPerm
     * @returns {BlockPermutation}
     */
    static createBlockPermutation(rawPerm) {
        const id = rawPerm.id;
        const states = rawPerm.states;

        let blockPerm = BlockPermutation.resolve(id, states);

        return blockPerm;
    }

    /**
     * ブロックデータを文字列タイプに変換
     * @param {*} blockDatas
     */
    static transRawBlockDatas(blockDatas) {
        const rawBlockDatas = [];

        for(const blockData of blockDatas) {
            let rawBlockData = {};

            const block = blockData.block;

            if(typeof block == "string") {
                rawBlockData = blockData;
                rawBlockDatas.push(rawBlockData);
            }else if(typeof block == "object"){
                const perm = block;
                rawBlockData = {
                    block: {
                        id: perm.type.id,
                        states: perm.getAllStates()
                    },
                    percent: blockData.percent
                };
                rawBlockDatas.push(rawBlockData);
            }

            
        }
        
        return rawBlockDatas;
    }

    /**
     * 文字列タイプをブロックデータに変換
     * @param {*} rawBlockDatas 
     * @returns
     */
    static transBlockDatas(rawBlockDatas) {
        const blockDatas = [];

        for(const rawBlockData of rawBlockDatas) {
            let blockData = {};

            const block = rawBlockData.block;
            if(typeof block == "string") {
                blockData = rawBlockData;
                blockDatas.push(blockData);
            }else if(typeof block == "object"){
                blockData = {
                    block: WorldEdit.createBlockPermutation(block),
                    percent: rawBlockData.percent
                };
                blockDatas.push(blockData);
            }
        }
        
        return blockDatas;
    }

    /**
     * ブロックを設置します
     * @param {*} blockDatas 
     * @param {Vector3} location 
     * @param {Dimension} dimension 
     * @param {Block} defaultBlock 
     */
    static setBlock(blockDatas, location, dimension, defaultBlock = undefined) {
        const block = WorldEdit.getRandomBlock(blockDatas);
        const isString = (typeof block == "string");

        if(defaultBlock) {
            if(isString)defaultBlock.setType(block);
            else defaultBlock.setPermutation(block);
        }else {
            if(isString)dimension.setBlockType(location, block);
            else dimension.setBlockType(location, block);
        }
    }

    /**
     * 対象のブロックがブロックデータ配列と一致するかどうか
     * @param {Block} targetBlock 
     * @param {[]} blockDatas 
     * @returns {boolean}
     */
    static checkMusk(targetBlock, blockDatas) {
        const targetId = WorldEdit.idReplace(targetBlock.typeId);
        const targetStates = targetBlock.permutation.getAllStates();
        

        for(const obj of blockDatas) {
            const block = obj.block;

            if(typeof block == "string") {
                if(WorldEdit.idReplace(block) == targetId)return true;
            }else {
                //permは全一致のみ
                if(block.type.id.replace("minecraft:", "") == targetId) {
                    const states = block.getAllStates();

                    for(const key of Object.keys(states)) {
                        if(states[key] != targetStates[key])return false;
                    }
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * "minecraft:" を添削して返します
     * @param {string} id 
     * @returns {string}
     */
    static idReplace(id) {
        return id?.replace("minecraft:", "");
    }

    /**
     * コマンド、操作が使用可能かどうか
     * @param {Player} player 
     */
    static checkOp(player) {
        if(!player.isOp() && !player.hasTag(config.operatorTag))return false;

        return true;
    }

    /**
     * 
     * @param {Player} player 
     * @returns {Block | undefined}
     */
    static getViewBlock(player) {
        const raycast = player.getBlockFromViewDirection({ maxDistance:100 });
        if(!raycast || !raycast.block)return;
        
        return raycast.block;
    }

    /**
     * 
     * @param {Player} player 
     * @returns {Block | undefined}
     */
    static getViewFaceBlock(player) {
        const raycast = player.getBlockFromViewDirection({ maxDistance:100 });
        if(!raycast.face)return;
        const block = raycast.block;
        const face = raycast.face;

        if(face == "Up")return block.above();
        if(face == "Down")return block.below();
        if(face == "West")return block.west();
        if(face == "East")return block.east();
        if(face == "South")return block.south();
        if(face == "North")return block.north();
    }

    

    static getSize(pos1, pos2) {
        return {
            x: Math.abs(pos1.x - pos2.x) + 1,
            y: Math.abs(pos1.y - pos2.y) + 1,
            z: Math.abs(pos1.z - pos2.z) + 1,
        };
    };

    static getMaxPos(pos1, pos2) {
        return {
            x: Math.max(pos1.x, pos2.x),
            y: Math.max(pos1.y, pos2.y),
            z: Math.max(pos1.z, pos2.z),
        };
    };

    static getMinPos(pos1, pos2) {
        return {
            x: Math.min(pos1.x, pos2.x),
            y: Math.min(pos1.y, pos2.y),
            z: Math.min(pos1.z, pos2.z),
        };
    };

    

    /**
     * 
     * @param {Block} block 
     * @param {Direction} face 
     * @returns {Block | undefined}
     */
    static getBlockForFace(block, face) {
        if(!block || !face)return;
        if(face == "Up")return block.above();
        if(face == "Down")return block.below();
        if(face == "West")return block.west();
        if(face == "East")return block.east();
        if(face == "South")return block.south();
        if(face == "North")return block.north();
    }

    static getPlayerLocation(player) {
        return {
                x: Math.floor(player.location.x) + 0.0,
                y: Math.round(player.location.y) + 0.0,
                z: Math.floor(player.location.z) + 0.0,
            }
    }


    static help(player, inputCmd) {
        Help.sendAll(player, inputCmd);
    };

    static version(player) {
        player.sendMessage(`§dWorldEdit ver.${version.join(".")}`);
    };

    static pos1(player, pos = undefined) {
        if(!pos)pos = WorldEdit.getPlayerLocation(player);

        playerDB.set(player, "pos1", pos);
        player.sendMessage(`§d初期位置を設定しました(${pos.x}, ${pos.y}, ${pos.z})`);
    };

    static pos2(player, pos = undefined) {
        if(!pos)pos = WorldEdit.getPlayerLocation(player);

        playerDB.set(player, "pos2", pos);
        player.sendMessage(`§d終了位置を設定しました(${pos.x}, ${pos.y}, ${pos.z})`);
    };

    static info(player) {
        const itemStack = player.getComponent("inventory").container.getItem(player.selectedSlotIndex);

        if(!itemStack)return player.sendMessage(`§c構文エラー: メインハンドのアイテムを取得できませんでした`);
        player.sendMessage(`§dアイテム情報: §did: §f${itemStack.typeId}`);
    };

    static infoview(player) {
        const blockRaycast = player.getBlockFromViewDirection();
        if(!blockRaycast)return player.sendMessage("§c構文エラー: 視点先のブロックを取得できませんでした");

        const block = blockRaycast.block;
        const states = block.permutation.getAllStates();

        player.sendMessage(`§dブロック情報: id: §f${block.typeId}§d, states: §f${JSON.stringify(states, null, 2)}`);
    };

    static getview(player) {
        const blockRaycast = player.getBlockFromViewDirection();
        if(!blockRaycast)return player.sendMessage("§c構文エラー: 視点先のブロックを取得できませんでした");

        const block = blockRaycast.block;
        const itemStack = block.getItemStack(64, true);
        
        player.getComponent("inventory").container.setItem(player.selectedSlotIndex, itemStack);
        player.sendMessage(`§dブロックを取得しました`);
    };


    static async set(player, inputCmd) {
        const pos1 = playerDB.get(player, "pos1");
        if(!pos1)return player.sendMessage("§c構文エラー: 初期位置が設定されていません");
        
        const pos2 = playerDB.get(player, "pos2");
        if(!pos2)return player.sendMessage("§c構文エラー: 終了位置が設定されていません");

        const blockData = WorldEdit.changeBlockDatas(player, inputCmd[0]);
        if(!blockData)return;

        History.save(pos1, pos2, player);

        Fill.set(pos1, pos2, blockData, player);
    };

    static async replace(player, inputCmd) {
        const pos1 = playerDB.get(player, "pos1");
        if(!pos1)return player.sendMessage("§c構文エラー: 初期位置が設定されていません");
        
        const pos2 = playerDB.get(player, "pos2");
        if(!pos2)return player.sendMessage("§c構文エラー: 終了位置が設定されていません");

        const blockData = WorldEdit.changeBlockDatas(player, inputCmd[0]);
        if(!blockData)return;

        const replaceBlockData = WorldEdit.changeBlockDatas(player, inputCmd[1]);
        if(!replaceBlockData)return;

        History.save(pos1, pos2, player);

        Fill.replace(pos1, pos2, blockData, replaceBlockData, player);
    };

    static undo(player) {
        History.undo(player);
    };

    static redo(player) {
        History.redo(player);
    };

    static clearhistory(player) {
        History.clear(player);
    };

    static center(player, inputCmd) {
        const pos1 = playerDB.get(player, "pos1");
        if(!pos1)return player.sendMessage("§c構文エラー: 初期位置が設定されていません");
        
        const pos2 = playerDB.get(player, "pos2");
        if(!pos2)return player.sendMessage("§c構文エラー: 終了位置が設定されていません");

        const centerPos = {
            x: (Math.min(pos1.x, pos2.x) + (Math.abs(pos1.x - pos2.x)/2) ),
            y: (Math.min(pos1.y, pos2.y) + (Math.abs(pos1.y - pos2.y)/2) ),
            z: (Math.min(pos1.z, pos2.z) + (Math.abs(pos1.z - pos2.z)/2) ),
        }; 

        player.sendMessage(`§d中心座標: (${centerPos.x}, ${centerPos.y}, ${centerPos.z})`);
        if(inputCmd[0])player.teleport(Vector.add(centerPos, { x:0.5, y:0, z:0.5 }));
    };

    static size(player) {
        const pos1 = playerDB.get(player, "pos1");
        if(!pos1)return player.sendMessage("§c構文エラー: 初期位置が設定されていません");
        
        const pos2 = playerDB.get(player, "pos2");
        if(!pos2)return player.sendMessage("§c構文エラー: 終了位置が設定されていません");

        const size = WorldEdit.getSize(pos1, pos2)
        player.sendMessage(`§dサイズ: (${size.x}, ${size.y}, ${size.z})`)
    };

    static count(player) {
        const pos1 = playerDB.get(player, "pos1");
        if(!pos1)return player.sendMessage("§c構文エラー: 初期位置が設定されていません");
        
        const pos2 = playerDB.get(player, "pos2");
        if(!pos2)return player.sendMessage("§c構文エラー: 終了位置が設定されていません");

        const size = WorldEdit.getSize(pos1, pos2)
        const cnt = size.x * size.y * size.z;
        player.sendMessage(`§dブロック数: ${cnt}`);
    };

    static async move(player, inputCmd) {
        const pos1 = playerDB.get(player, "pos1");
        if(!pos1)return player.sendMessage("§c構文エラー: 初期位置が設定されていません");
        
        const pos2 = playerDB.get(player, "pos2");
        if(!pos2)return player.sendMessage("§c構文エラー: 終了位置が設定されていません");

        const moveVecX = inputCmd[0];
        if(isNaN(moveVecX))return player.sendMessage(`§c構文エラー: 移動するブロック数は数値で指定してください ( >> ${moveVecX})`);
        const moveVecY = inputCmd[1];
        if(isNaN(moveVecY))return player.sendMessage(`§c構文エラー: 移動するブロック数は数値で指定してください ( >> ${moveVecY})`);
        const moveVecZ = inputCmd[2];
        if(isNaN(moveVecZ))return player.sendMessage(`§c構文エラー: 移動するブロック数は数値で指定してください ( >> ${moveVecZ})`);

        const dimension = player.dimension;
        const id = `we_move_${player.id}`;
        ExetendStructureManager.delete(id);
        ExetendStructureManager.save(id, dimension, pos1, pos2);

        const size = WorldEdit.getSize(pos1, pos2);
        const minPos = WorldEdit.getMinPos(pos1, pos2);

        const moveFromPos = {
            x: minPos.x + moveVecX * 1,
            y: minPos.y + moveVecY * 1,
            z: minPos.z + moveVecZ * 1,
        };
        const moveToPos = {
            x: moveFromPos.x + size.x,
            y: moveFromPos.y + size.y,
            z: moveFromPos.z + size.z,
        };
        playerDB.set(player, "pos1", moveFromPos);
        playerDB.set(player, "pos2", moveToPos);

        if(moveFromPos.y <= -64 || moveFromPos.y >= 320 || moveToPos.y <= -64 || moveToPos.y >= 320)return player.sendMessage(`§c構文エラー: 移動先の座標のY軸が-64以下、もしくは320以上のため移動できません`);
        History.save(minPos, moveToPos, player).then(res => {
            Fill.set(pos1, pos2, [ { id:"air", percent:100 } ], player, { hideMessage:true, func:move });
        });

        function move() {
            ExetendStructureManager.place(id, dimension, moveFromPos);
            player.sendMessage(`§d選択範囲を移動しました(移動方向: ${moveVecX}, ${moveVecY}, ${moveVecZ})`);

            ExetendStructureManager.delete(id);
        };
        
    };

    static async stack(player, inputCmd) {
        const pos1 = playerDB.get(player, "pos1");
        if(!pos1)return player.sendMessage("§c構文エラー: 初期位置が設定されていません");
        
        const pos2 = playerDB.get(player, "pos2");
        if(!pos2)return player.sendMessage("§c構文エラー: 終了位置が設定されていません");

        const axis = inputCmd[0];
        const axisAry = [ "x", "-x", "y", "-y", "z", "z" ];
        if(!axisAry.includes(axis))return player.sendMessage(`§c構文エラー: 複製方向の軸は以下の中から指定してください[${axisAry}] ( >> ${axis})`);

        const cnt = inputCmd[1];
        if(isNaN(cnt))return player.sendMessage(`§c構文エラー: 複製回数は数値で入力してください ( >> ${cnt})`);
        if(cnt <= 0)return player.sendMessage(`§c構文エラー: 複製回数は1以上の数値で入力してください ( >> ${cnt})`);

        const dimension = player.dimension;
        const id = `we_stack_${player.id}`;
        ExetendStructureManager.delete(id);
        ExetendStructureManager.save(id, dimension, pos1, pos2);

        const size = WorldEdit.getSize(pos1, pos2);
        const minPos = WorldEdit.getMinPos(pos1, pos2);

        let stackToPos;
        switch(axis) {
            case "x": stackToPos = { 
                x:minPos.x + size.x - 1+ size.x * (cnt), 
                y:minPos.y + size.y - 1, 
                z:minPos.z + size.z - 1 
            }; break;
            case "-x": stackToPos = { 
                x:minPos.x + size.x - 1 - size.x * cnt, 
                y:minPos.y + size.y - 1, 
                z:minPos.z + size.z - 1 
            }; break;

            case "y": stackToPos = { 
                x:minPos.x + size.x - 1, 
                y:minPos.y + size.y - 1  + size.y * (cnt), 
                z:minPos.z + size.z - 1  
            }; break;
            case "-y": stackToPos = { 
                x:minPos.x + size.x - 1, 
                y:minPos.y + size.y - 1 - size.y * cnt, 
                z:minPos.z + size.z - 1 
            }; break;

            case "z": stackToPos = { 
                x:minPos.x + size.x - 1, 
                y:minPos.y + size.y - 1, 
                z:minPos.z + size.z - 1 + size.z * cnt 
            }; break;
            case "-z": stackToPos = { 
                x:minPos.x + size.x - 1, 
                y:minPos.y + size.y - 1, 
                z:minPos.z + size.z - 1 - size.z * cnt 
            }; break;
        }; 

        if(stackToPos.y <= -64 || stackToPos.y >= 320)return player.sendMessage(`§c構文エラー: 複製先の座標のY軸が-64以下、もしくは320以上のため移動できません`);
        History.save(minPos, stackToPos, player);

        
        function* stack() {
            const size = WorldEdit.getSize(pos1, pos2);

            for(let i=1; i<=cnt; i++) {
                let pos;
                switch(axis) {
                    case "x": pos = { x:minPos.x + size.x * i, y:minPos.y, z:minPos.z }; break;
                    case "-x": pos = { x:minPos.x - size.x * i, y:minPos.y, z:minPos.z }; break;
                    case "y": pos = { x:minPos.x, y:minPos.y + size.y * i, z:minPos.z }; break;
                    case "-y": pos = { x:minPos.x, y:minPos.y - size.y * i, z:minPos.z }; break;
                    case "z": pos = { x:minPos.x, y:minPos.y, z:minPos.z + size.z * i }; break;
                    case "-z": pos = { x:minPos.x, y:minPos.y, z:minPos.z - size.z * i }; break;
                };
                ExetendStructureManager.place(id, dimension, pos);

            };

            player.sendMessage(`§d選択範囲を複製しました(複製方向: ${axis}, 回数: ${cnt})`);
            ExetendStructureManager.delete(id);
        };
        system.runJob(stack());
    };

    static division(player, inputCmd) {
        const pos1 = playerDB.get(player, "pos1");
        if(!pos1)return player.sendMessage("§c構文エラー: 初期位置が設定されていません");
        
        const pos2 = playerDB.get(player, "pos2");
        if(!pos2)return player.sendMessage("§c構文エラー: 終了位置が設定されていません");
 
        const space = inputCmd[0];
        if(isNaN(space))return player.sendMessage(`§c構文エラー: 間隔は数値で入力してください ( >> ${space})`);
        if(space <= 0)return player.sendMessage(`§c構文エラー: 間隔は1以上の数値で入力してください ( >> ${space})`);

        
    };

    static fill(player, inputCmd) {
        const blockDatas = WorldEdit.changeBlockDatas(player, inputCmd[0]);
        if(!blockDatas)return;

        const maxCnt = inputCmd[1];
        if(isNaN(maxCnt))return player.sendMessage(`§c構文エラー: ブロック数は数値で指定してください( >> ${maxCnt})`);

        const dimension = player.dimension;
        let cnt = 0;
        let isFinish = false;
        let tryTick = 0
        let tick = 0;

        /**
         * @param {Block} centerBlock 
         * @returns 
         */
        async function runFill(centerBlock) {
            // if(tryCnt > maxCnt)return player.sendMessage(`Error: ${cnt}`)
            if(isFinish)return;

            const ary = [];
            ary.push(centerBlock);
            ary.push(centerBlock.north());
            ary.push(centerBlock.south());
            ary.push(centerBlock.east());
            ary.push(centerBlock.west());
            ary.push(centerBlock.below());

            const nextAry = [];
            for(const block of ary) {
                if(isFinish)return;

                if(!block.isAir)continue;

                if(cnt >= maxCnt) {
                    if(!isFinish) {
                        isFinish = true;
                        player.sendMessage(`§d埋め立て完了 (${cnt}ブロック)`);
                        return;
                    }
                    
                    return;
                }

                cnt++;
                tryTick = tick;
                WorldEdit.setBlock(blockDatas, null, null, block);
                nextAry.push(block);
            }

            await system.waitTicks(1);
            for(const block of nextAry) {
                runFill(block);
            }
        }

        if(player.location.y <= -64 || player.location.y >= 320)return player.sendMessage(`§c構文エラー: 埋め立て開始座標のY軸が-64以下、もしくは320以上のため埋め立てできません`);

        const centerBlock = dimension.getBlock(WorldEdit.getPlayerLocation(player));
        if(!centerBlock || !centerBlock.isAir)return player.sendMessage(`§d埋め立て完了 (${cnt}ブロック)`);

        runFill(centerBlock);

        
        const stopTick = 20 * 15;
        const num = system.runInterval(() => {
            
            if(tick - tryTick == 5){
                isFinish = true;

                player.sendMessage(`§d埋め立て完了 (${cnt}ブロック)`);
            }

            if(isFinish || tick > stopTick) {
                return system.clearRun(num);
            }

            tick++;
        }, 1)
    };

    static fixwater(player, inputCmd) {
        WorldEdit.fill(player, [ "water", inputCmd[0] ]);
    }

    static fixlava(player, inputCmd) {
        WorldEdit.fill(player, [ "lava", inputCmd[0] ]);
    }

    static async overlay(player, inputCmd) {
        const pos1 = playerDB.get(player, "pos1");
        if(!pos1)return player.sendMessage("§c構文エラー: 初期位置が設定されていません");
        
        const pos2 = playerDB.get(player, "pos2");
        if(!pos2)return player.sendMessage("§c構文エラー: 終了位置が設定されていません");

        const blockDatas = WorldEdit.changeBlockDatas(player, inputCmd[0]);
        if(!blockDatas)return;

        const height = inputCmd[1] ?? 1;
        if(isNaN(height))return player.sendMessage(`§c構文エラー: ブロックの高さは数値で指定してください( >> ${height})`);

        

        const dimension = player.dimension;
        const minPos = WorldEdit.getMinPos(pos1, pos2);
        const maxPos = WorldEdit.getMaxPos(pos1, pos2);

        History.save(minPos, {
            x:maxPos.x,
            y:maxPos.y + height,
            z:maxPos.z,
        }, player);

        function* runOverlay() {
            for(let x=minPos.x; x<=maxPos.x; x++) {
                for(let z=minPos.z; z<=maxPos.z; z++) {
                    
                    //上から見ていく
                    for(let y=maxPos.y; y>=minPos.y; y--) {
                        const block = dimension.getBlock({ x:x, y:y, z:z });
                        const aboveBlock = block.above();
                        
                        if(!block?.isAir && aboveBlock?.isAir) {
                            for(let h=1; h<=height; h++) {
                                const setPos = { x:x, y:y+h, z:z };
                                const _block_ = dimension.getBlock(setPos);

                                WorldEdit.setBlock(blockDatas, null, null, _block_);
                            };

                            break;
                        };

                        yield;
                    };
                    
                };
            };

            player.sendMessage(`§d操作完了 (高さ: ${height})`);
        };

        system.runJob(runOverlay());
    };

    static copy(player, inputCmd) {
        const pos1 = playerDB.get(player, "pos1");
        if(!pos1)return player.sendMessage("§c構文エラー: 初期位置が設定されていません");
        
        const pos2 = playerDB.get(player, "pos2");
        if(!pos2)return player.sendMessage("§c構文エラー: 終了位置が設定されていません");
        
        const name = inputCmd[0];
        if(!name)return player.sendMessage(`§c構文エラー: コピーIDを入力してください`);
        const size = WorldEdit.getSize(pos1, pos2);

        ExetendStructureManager.delete(name);

        ExetendStructureManager.save(name, player.dimension, pos1, pos2, { includeEntities:false, saveMode:"Memory" });

        const st = ExetendStructureManager.get(name);
        player.sendMessage(`§d選択範囲を保存しました(ID: ${st.id}, サイズ: ${st.size.x}, ${st.size.y}, ${st.size.z})`);
    };

    static async paste(player, inputCmd) {
        const id = inputCmd[0];
        if(!id)return player.sendMessage(`§c構文エラー: コピーIDを入力してください`);

        const st = ExetendStructureManager.get(id);
        if(!st)return player.sendMessage(`§c構文エラー: 入力したIDの建造物が存在しません( > ${id} )`);
        const size = st.size;

        const pastePosType = inputCmd[1];
        let pastePos = player.location;

        if(pastePosType == "my" || !pastePosType) {
            pastePos = player.location;
        }else if(pastePosType == "view"){
            pastePos = WorldEdit.getViewFaceBlock(player);
        }else if(pastePosType == "pos1"){
            const pos1 = playerDB.get(player, "pos1");
            if(!pos1)return player.sendMessage("§c構文エラー: 初期位置が設定されていません");
            pastePos = pos1;
        }else if(pastePosType == "pos2"){
            const pos2 = playerDB.get(player, "pos2");
            if(!pos2)return player.sendMessage("§c構文エラー: 終了位置が設定されていません");
            pastePos = pos2;
        }else {

        };

        if(pastePos.y <= -64 || pastePos.y >= 320)return player.sendMessage(`§c構文エラー: ペースト先の座標のY軸が-64以下、もしくは320以上のためペーストできません`);

        const rotation = inputCmd[2];
        const rotations = [ "0", "90", "180", "270" ];
        if(rotation != undefined) {
            if(!rotations.includes(rotation))return player.sendMessage(`§c構文エラー: 回転角度は以下の中から指定してください[${rotations}] ( >> ${rotation})`);
        };
        let _rotation_ = "None";
        if(rotation == "90")_rotation_ = "Rotate90";
        if(rotation == "180")_rotation_ = "Rotate180";
        if(rotation == "270")_rotation_ = "Rotate270";

        const mirror = inputCmd[3];
        const mirrors = [ "x", "z", "xz", ];
        if(mirror != undefined) {
            if(!rotations.includes(rotation))return player.sendMessage(`§c構文エラー: 反転軸は以下の中から指定してください[${mirrors}] ( >> ${mirror})`);
        };
        let _mirror_ = "None";
        if(mirror == "x")_mirror_ = "X";
        if(mirror == "z")_mirror_ = "Z";
        if(mirror == "xz")_mirror_ = "XZ";

        const options = {
            rotation: _rotation_,
            mirror: _mirror_,
        };

        const fromPos = pastePos;
        const toPos = {
            x: pastePos.x + size.x - 1,
            y: pastePos.y + size.y - 1,
            z: pastePos.z + size.z - 1,
        };

        History.save(fromPos, toPos, player);

        log(options)
        ExetendStructureManager.place(id, player.dimension, pastePos, options);
        player.sendMessage(`§dペースト完了(ID: ${id})`);
    };



    static unstack(player) {
        const dimension = player.dimension;

        const block1 = dimension.getBlock(player.location);
        const block2 = dimension.getBlock(Vector.addsY(player.location, 1));

        if(!block1.isAir && !block2.isAir){
            let isTrying = true;

            getUDNSWE(player.location);

            function getUDNSWE(centerLoca) {
                if(!isTrying)return;
                const blockCe = dimension.getBlock(centerLoca);

                const direResAry = [];
                direResAry.push(tryTele(blockCe.above().location));
                direResAry.push(tryTele(blockCe.below().location));
                direResAry.push(tryTele(blockCe.north().location));
                direResAry.push(tryTele(blockCe.south().location));
                direResAry.push(tryTele(blockCe.west().location));
                direResAry.push(tryTele(blockCe.east().location));

                for(const res of direResAry){
                    if(!isTrying)return;
                    if(res.res == true){
                        isTrying = false;
                        player.teleport(res.location);
                        player.sendMessage(`§d脱出成功!`);
                        return;
                    };

                    getUDNSWE(res);
                };

            };
        };

        function tryTele(location) {
            const block1 = dimension.getBlock(location);
            const block2 = dimension.getBlock(Vector.addsY(location, 1));
            if(block1.isAir && block2.isAir)return { res:true, location:location }
            return location;
        };

        
    };

    static ascend(player) {
        const loca = Vector.floor(player.location);
        if(loca.y >= 320)return;
        const dimension = player.dimension;

        const ceilLoca = getCeilLocation(loca);
        if(!ceilLoca)return;

        const upFloorLoca = upFloorlocation(ceilLoca);
        if(upFloorLoca)player.teleport(Vector.add(upFloorLoca, { x:0.5, y:0, z:0.5 })); 

        function getCeilLocation(location) {
            for(let i=0; i<Math.abs(320-location.y); i++){
                const blockLoca = Vector.add(location, { x:0, y:i, z:0 });
                if(blockLoca.y >= -64 && blockLoca.y <= 320){
                    const block = dimension.getBlock(blockLoca);
                    if(!block.isAir)return block.location;
                };
            };
        };

        function upFloorlocation(location) {
            for(let i=0; i<Math.abs(320-location.y); i++){
                const blockLoca = Vector.add(location, { x:0, y:i, z:0 });
                if(blockLoca.y >= -64 && blockLoca.y <= 320){
                    const block = dimension.getBlock(blockLoca);
                    if(block.isAir)return block.location;
                };
            };
        };
    };

    static descend(player) {
        const loca = Vector.floor(player.location);
        if(loca.y <= -64)return;
        const dimension = player.dimension;

        const floowLoca = getFloorLocation(loca);
        if(!floowLoca)return;  

        const downFloowLoca = getDownFloorLocation(floowLoca);
        if(!downFloowLoca)return;
        
        const floowF1_Loca = getFloorLocation(downFloowLoca);
        if(floowF1_Loca){
            player.teleport(Vector.add(floowF1_Loca, { x:0.5, y:1, z:0.5 })); 
        }else{
            player.teleport(Vector.add(downFloowLoca, { x:0.5, y:-1, z:0.5 })); 
        }

        function getFloorLocation(location) {
            for(let i=0; i<Math.abs(-64-location.y); i++){
                const blockLoca = Vector.subtract(location, { x:0, y:i, z:0 });
                if(blockLoca.y >= -64 && blockLoca.y <= 320){
                    const block = dimension.getBlock(blockLoca);
                    if(!block.isAir)return block.location;
                };
            };
        };

        function getDownFloorLocation(location) {
            const cnt = Math.abs(-66-location.y);
            for(let i=0; i<cnt; i++){
                const blockLoca = Vector.subtract(location, { x:0, y:i, z:0 });
                if(blockLoca.y >= -64 && blockLoca.y <= 320){
                    const block = dimension.getBlock(blockLoca);
                    if(block.isAir)return block.location;
                };
                if(blockLoca.y <= -65){
                    return Vector.subtract(blockLoca, { x:0, y:0, z:0 });
                };
            };
        };
    };

    static ceil(player) {
        const loca = Vector.floor(player.location);
        if(loca.y >= 320)return;
        const dimension = player.dimension;

        const ceilLoca = getCeilLocation(loca);
        if(ceilLoca)player.teleport(Vector.add(ceilLoca, { x:0.5, y:-2, z:0.5 })); 

        function getCeilLocation(location) {
            for(let i=0; i<Math.abs(320-location.y); i++){
                const blockLoca = Vector.add(location, { x:0, y:i, z:0 });
                if(blockLoca.y >= -64 && blockLoca.y <= 320){
                    const block = dimension.getBlock(blockLoca);
                    if(!block.isAir)return block.location;
                };
            };
        };
    };

    


    static shortcut(player) {
        Shortcut.showForm(player);
    };

    static tool(player, inputCmd) {
    }

    static brush(player, inputCmd) {
    }

    static musk(player, inputCmd) {
        Brush.musk(player, inputCmd);
    }

};

system.run(() => {
    WorldEdit.__INIT_LOAD__();
});