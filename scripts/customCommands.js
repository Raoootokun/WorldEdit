import { 
    world, system, 
    CommandPermissionLevel,
    CustomCommandParamType, 
    CustomCommandStatus, 
    Player, 
} from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { log } from "./libs/tool";
import { config } from "./config";
import { WorldEdit } from "./we/WorldEdit";
import { Brush } from "./we/Brush";
import { Shortcut } from "./we/Shortcut";
import { playerDB } from "./database";
import { Tool } from "./we/Tool";
import { Unitil } from "./Unitil";
import { Particles } from "./we/Particles";


let overworld;
system.run(() => {
    overworld = world.getDimension('overworld');
});


const ENUMS = {
    "block": "[blockId/main/view/blockPattern/slotIndex]"
}

const COMMAND_LIST = [
    { //test
        command: {
            name: `${config.commandPrefix}:` + "test",
            description: "Test",
            permissionLevel: CommandPermissionLevel.Admin,
            mandatoryParameters: [
                { type: CustomCommandParamType.String, name: "name" },
            ],
            optionalParameters: [
                { type: CustomCommandParamType.String, name: "name" },
            ],
        },
        func: function(origin, ...args) {
            system.run(() => {
                const source = origin.sourceEntity;
            });
            return {
                status: CustomCommandStatus.Success
            };
        }
    },

    { //help
        command: {
            name: `${config.commandPrefix}:` + "help",
            description: "WorldEditのコマンドの使い方を表示します",
            permissionLevel: CommandPermissionLevel.Admin,
            optionalParameters: [
                { type: CustomCommandParamType.String, name: "command" },
            ],
        },
        func: function(origin, args) {
            system.run(() => {
                const source = origin.sourceEntity;
                WorldEdit.help(source, args);
            });
            return { status: CustomCommandStatus.Success };
        }
    },
    { //version
        command: {
            name: `${config.commandPrefix}:` + "version",
            description: "WorldEditのバージョンを表示します",
            permissionLevel: CommandPermissionLevel.Admin,
        },
        alias: [ "v" ],
        func: function(origin, args) {
            system.run(() => {
                const source = origin.sourceEntity;
                WorldEdit.version(source);
            });
            return { status: CustomCommandStatus.Success };
        }
    },

    { //pos1
        command: {
            name: `${config.commandPrefix}:` + "pos1",
            description: "初期位置を設定します",
            permissionLevel: CommandPermissionLevel.Admin,
        },
        func: function(origin, args) {
            system.run(() => {
                const source = origin.sourceEntity;
                WorldEdit.pos1(source);
            });
            return { status: CustomCommandStatus.Success };
        }
    },
    { //pos2
        command: {
            name: `${config.commandPrefix}:` + "pos2",
            description: "終了位置を設定します",
            permissionLevel: CommandPermissionLevel.Admin,
        },
        func: function(origin, args) {
            system.run(() => {
                const source = origin.sourceEntity;
                WorldEdit.pos2(source);
            });
            return { status: CustomCommandStatus.Success };
        }
    },

    { //undo
        command: {
            name: `${config.commandPrefix}:` + "undo",
            description: "作業を1つ前に戻します",
            permissionLevel: CommandPermissionLevel.Admin,
        },
        func: function(origin, args) {
            system.run(() => {
                const source = origin.sourceEntity;
                WorldEdit.undo(source);
            });
            return { status: CustomCommandStatus.Success };
        }
    },
    { //redo
        command: {
            name: `${config.commandPrefix}:` + "redo",
            description: "作業を1つ先に戻します",
            permissionLevel: CommandPermissionLevel.Admin,
        },
        func: function(origin, args) {
            system.run(() => {
                const source = origin.sourceEntity;
                WorldEdit.redo(source);
            });
            return { status: CustomCommandStatus.Success };
        }
    },
    { //clearhistory
        command: {
            name: `${config.commandPrefix}:` + "clearhistory",
            description: "編集履歴(undo,redo)を初期化します",
            permissionLevel: CommandPermissionLevel.Admin,
        },
        func: function(origin, args) {
            system.run(() => {
                const source = origin.sourceEntity;
                WorldEdit.clearhistory(source);
            });
            return { status: CustomCommandStatus.Success };
        }
    },

    { //unstack
        command: {
            name: `${config.commandPrefix}:` + "unstack",
            description: "ブロックから抜け出します",
            permissionLevel: CommandPermissionLevel.Admin,
        },
        alias: [ "us" ],
        func: function(origin, args) {
            system.run(() => {
                const source = origin.sourceEntity;
                WorldEdit.unstack(source);
            });
            return { status: CustomCommandStatus.Success };
        }
    },
    { //ceil
        command: {
            name: `${config.commandPrefix}:` + "ceil",
            description: "天井のテレポートします",
            permissionLevel: CommandPermissionLevel.Admin,
        },
        alias: [],
        func: function(origin, args) {
            system.run(() => {
                const source = origin.sourceEntity;
                WorldEdit.ceil(source);
            });
            return { status: CustomCommandStatus.Success };
        }
    },
    { //ascend
        command: {
            name: `${config.commandPrefix}:` + "ascend",
            description: "上の階へテレポートします",
            permissionLevel: CommandPermissionLevel.Admin,
        },
        alias: [ "as" ],
        func: function(origin, args) {
            system.run(() => {
                const source = origin.sourceEntity;
                WorldEdit.ascend(source);
            });
            return { status: CustomCommandStatus.Success };
        }
    },
    { //descend
        command: {
            name: `${config.commandPrefix}:` + "descend",
            description: "下の階へテレポートします",
            permissionLevel: CommandPermissionLevel.Admin,
        },
        alias: [ "des" ],
        func: function(origin, args) {
            system.run(() => {
                const source = origin.sourceEntity;
                WorldEdit.descend(source);
            });
            return { status: CustomCommandStatus.Success };
        }
    },

    { //info
        command: {
            name: `${config.commandPrefix}:` + "info",
            description: "メインハンドのアイテムの情報を表示します",
            permissionLevel: CommandPermissionLevel.Admin,
        },
        alias: [ "i" ],
        func: function(origin, args) {
            system.run(() => {
                const source = origin.sourceEntity;
                WorldEdit.info(source);
            });
            return { status: CustomCommandStatus.Success };
        }
    },
    { //infoview
        command: {
            name: `${config.commandPrefix}:` + "infoview",
            description: "視点先のブロックの情報を表示します",
            permissionLevel: CommandPermissionLevel.Admin,
        },
        alias: [ "iv" ],
        func: function(origin, args) {
            system.run(() => {
                const source = origin.sourceEntity;
                WorldEdit.infoview(source);
            });
            return { status: CustomCommandStatus.Success };
        }
    },
    { //getview
        command: {
            name: `${config.commandPrefix}:` + "getview",
            description: "視点先のブロックを取得します",
            permissionLevel: CommandPermissionLevel.Admin,
        },
        alias: [  ],
        func: function(origin, args) {
            system.run(() => {
                const source = origin.sourceEntity;
                WorldEdit.getview(source);
            });
            return { status: CustomCommandStatus.Success };
        }
    },

    { //set
        command: {
            name: `${config.commandPrefix}:`+ "set",
            description: "初期位置から終了位置までを指定したブロックに置き換えます",
            permissionLevel: CommandPermissionLevel.Admin,
            mandatoryParameters: [
                { type: CustomCommandParamType.String, name: `setBlock§d${ENUMS.block}§f` },
            ],
        },
        alias: [  ],
        func: function(origin, ...args) {
            system.run(() => {
                const source = origin.sourceEntity;
                WorldEdit.set(source, args);
            });
            return { status: CustomCommandStatus.Success };
        }
    },
    { //seta
        command: {
            name: `${config.commandPrefix}:`+ "seta",
            description: "初期位置から終了位置までを空気に置き換えます",
            permissionLevel: CommandPermissionLevel.Admin,
        },
        alias: [  ],
        func: function(origin, ...args) {
            system.run(() => {
                const source = origin.sourceEntity;
                WorldEdit.set(source, [ "air" ]);
            });
            return { status: CustomCommandStatus.Success };
        }
    },
    { //setb
        command: {
            name: `${config.commandPrefix}:`+ "setb",
            description: "初期位置から終了位置までを指定したブロックに置き換えます",
            permissionLevel: CommandPermissionLevel.Admin,
            mandatoryParameters: [
                { type: CustomCommandParamType.BlockType, name: `setBlock` },
            ],
        },
        alias: [  ],
        func: function(origin, ...args) {
            system.run(() => {
                const source = origin.sourceEntity;
                WorldEdit.set(source, [ args[0].id ]);
            });
            return { status: CustomCommandStatus.Success };
        }
    },
    { //setm
        command: {
            name: `${config.commandPrefix}:`+ "setm",
            description: "初期位置から終了位置までをメインハンドのブロックに置き換えます",
            permissionLevel: CommandPermissionLevel.Admin,
        },
        alias: [  ],
        func: function(origin, ...args) {
            system.run(() => {
                const source = origin.sourceEntity;
                WorldEdit.set(source, [ "main" ]);
            });
            return { status: CustomCommandStatus.Success };
        }
    },
    { //setv
        command: {
            name: `${config.commandPrefix}:`+ "setv",
            description: "初期位置から終了位置までを視点先のブロックに置き換えます",
            permissionLevel: CommandPermissionLevel.Admin,
        },
        alias: [  ],
        func: function(origin, ...args) {
            system.run(() => {
                const source = origin.sourceEntity;
                WorldEdit.set(source, [ "view" ]);
            });
            return { status: CustomCommandStatus.Success };
        }
    },

    { //replace
        command: {
            name: `${config.commandPrefix}:` + "replace",
            description: "初期位置から終了位置までを特定のブロックのみ指定したブロックに置き換えます",
            permissionLevel: CommandPermissionLevel.Admin,
            mandatoryParameters: [
                { type: CustomCommandParamType.String, name: `setBlock§d${ENUMS.block}§f` },
                { type: CustomCommandParamType.String, name: `replaceBlock§d${ENUMS.block}§f` },
            ],
        },
        alias: [ "repl" ],
        func: function(origin, ...args) {
            system.run(() => {
                const source = origin.sourceEntity;
                WorldEdit.replace(source, args);
            });
            return { status: CustomCommandStatus.Success };
        }
    },
    { //copy
        command: {
            name: `${config.commandPrefix}:` + "copy",
            description: "初期位置から終了位置をコピーします",
            permissionLevel: CommandPermissionLevel.Admin,
            mandatoryParameters: [
                { type: CustomCommandParamType.String, name: "id" },
            ],
        },
        alias: [  ],
        func: function(origin, ...args) {
            system.run(() => {
                const source = origin.sourceEntity;
                WorldEdit.copy(source, args);
            });
            return { status: CustomCommandStatus.Success };
        }
    },
    { //paste
        command: {
            name: `${config.commandPrefix}:` + "paste",
            description: "コピーした建造物を設置します",
            permissionLevel: CommandPermissionLevel.Admin,
            mandatoryParameters: [
                { type: CustomCommandParamType.String, name: "id" },
            ],
            optionalParameters: [
                { type: CustomCommandParamType.Enum, name: "w:position" },
                { type: CustomCommandParamType.Enum, name: "w:rotate" },
                { type: CustomCommandParamType.Enum, name: "w:mirrorAxis" },
            ],
        },
        alias: [  ],
        enums: {
            "w:position": [ "my", "view", "pos1", "pos2" ],
            "w:rotate": [ "0", "90", "180", "270" ],
            "w:mirrorAxis": [ "X", "Z", "XZ" ],
        },
        func: function(origin, ...args) {
            system.run(() => {
                const source = origin.sourceEntity;
                WorldEdit.paste(source, args);
            });
            return { status: CustomCommandStatus.Success };
        }
    },

    { //fill
        command: {
            name: `${config.commandPrefix}:`+ "fill",
            description: "自身を中心にブロックを敷き詰めていきます",
            permissionLevel: CommandPermissionLevel.Admin,
            mandatoryParameters: [
                { type: CustomCommandParamType.String, name: `setBlock§d${ENUMS.block}§f` },
                { type: CustomCommandParamType.Integer, name: "count" },
            ],
        },
        alias: [  ],
        func: function(origin, ...args) {
            system.run(() => {
                const source = origin.sourceEntity;
                WorldEdit.fill(source, args);
            });
            return { status: CustomCommandStatus.Success };
        }
    },
    { //center
        command: {
            name: `${config.commandPrefix}:`+ "center",
            description: "初期位置から終了位置の中心座標を表示します",
            permissionLevel: CommandPermissionLevel.Admin,
            optionalParameters: [
                { type: CustomCommandParamType.Boolean, name: "teleport" },
            ],
        },
        alias: [  ],
        func: function(origin, ...args) {
            system.run(() => {
                const source = origin.sourceEntity;
                WorldEdit.center(source, args);
            });
            return { status: CustomCommandStatus.Success };
        }
    },
    { //size
        command: {
            name: `${config.commandPrefix}:`+ "size",
            description: "初期位置から終了位置のサイズを表示します",
            permissionLevel: CommandPermissionLevel.Admin,
        },
        alias: [  ],
        func: function(origin, ...args) {
            system.run(() => {
                const source = origin.sourceEntity;
                WorldEdit.size(source, args);
            });
            return { status: CustomCommandStatus.Success };
        }
    },
    { //count
        command: {
            name: `${config.commandPrefix}:`+ "count",
            description: "初期位置から終了位置のブロック数を表示します",
            permissionLevel: CommandPermissionLevel.Admin,
        },
        alias: [  ],
        func: function(origin, ...args) {
            system.run(() => {
                const source = origin.sourceEntity;
                WorldEdit.count(source, args);
            });
            return { status: CustomCommandStatus.Success };
        }
    },
    { //move
        command: {
            name: `${config.commandPrefix}:`+ "move",
            description: "初期位置から終了位置内の建造物を移動させます",
            permissionLevel: CommandPermissionLevel.Admin,
            optionalParameters: [
                { type: CustomCommandParamType.Integer, name: "x" },
                { type: CustomCommandParamType.Integer, name: "y" },
                { type: CustomCommandParamType.Integer, name: "z" },
            ],
        },
        alias: [  ],
        func: function(origin, ...args) {
            system.run(() => {
                const source = origin.sourceEntity;
                WorldEdit.move(source, args);
            });
            return { status: CustomCommandStatus.Success };
        }
    },
    { //stack
        command: {
            name: `${config.commandPrefix}:`+ "stack",
            description: "初期位置から終了位置内の建造物を複製します",
            permissionLevel: CommandPermissionLevel.Admin,
            mandatoryParameters: [
                { type: CustomCommandParamType.Enum, name: "w:axis" },
                { type: CustomCommandParamType.Integer, name: "count" },
            ],
        },
        alias: [  ],
        enums: {
            "w:axis": [ "x", "-x", "y", "-y", "z", "z" ]
        },
        func: function(origin, ...args) {
            system.run(() => {
                const source = origin.sourceEntity;
                WorldEdit.stack(source, args);
            });
            return { status: CustomCommandStatus.Success };
        }
    },

    { //overlay
        command: {
            name: `${config.commandPrefix}:`+ "overlay",
            description: "初期位置から終了位置内の上側だけを指定したブロックに置き換えます",
            permissionLevel: CommandPermissionLevel.Admin,
            mandatoryParameters: [
                { type: CustomCommandParamType.String, name: `setBlock§d${ENUMS.block}§f` },
            ],
            optionalParameters: [
                { type: CustomCommandParamType.Integer, name: "height" },
            ],
        },
        alias: [  ],
        func: function(origin, ...args) {
            system.run(() => {
                const source = origin.sourceEntity;
                WorldEdit.overlay(source, args);
            });
            return { status: CustomCommandStatus.Success };
        }
    },
    { //fixwater
        command: {
            name: `${config.commandPrefix}:`+ "fixwater",
            description: "自身を中心に水源を敷き詰めます",
            permissionLevel: CommandPermissionLevel.Admin,
            optionalParameters: [
                { type: CustomCommandParamType.Integer, name: "count" },
            ],
        },
        alias: [  ],
        func: function(origin, ...args) {
            system.run(() => {
                const source = origin.sourceEntity;
                WorldEdit.fixwater(source, args);
            });
            return { status: CustomCommandStatus.Success };
        }
    },
    { //fixlava
        command: {
            name: `${config.commandPrefix}:`+ "fixlava",
            description: "自身を中心に溶岩源を敷き詰めます",
            permissionLevel: CommandPermissionLevel.Admin,
            optionalParameters: [
                { type: CustomCommandParamType.Integer, name: "count" },
            ],
        },
        alias: [  ],
        func: function(origin, ...args) {
            system.run(() => {
                const source = origin.sourceEntity;
                WorldEdit.fixlava(source, args);
            });
            return { status: CustomCommandStatus.Success };
        }
    },

    

    { //shortcut
        command: {
            name: `${config.commandPrefix}:`+ "shortcut",
            description: "ショートカットを設定します",
            permissionLevel: CommandPermissionLevel.Admin,
        },
        alias: [  ],
        func: function(origin, ...args) {
            system.run(() => {
                const source = origin.sourceEntity;
            });
            return { status: CustomCommandStatus.Success };
        }
    },
    { //shortcut_add
        command: {
            name: `${config.commandPrefix}:`+ "shortcut_add",
            description: "ショートカットを追加します",
            permissionLevel: CommandPermissionLevel.Admin,
            mandatoryParameters: [
                { type: CustomCommandParamType.String, name: "addCommand" },
            ],
        },
        alias: [  ],
        func: function(origin, ...args) {
            system.run(() => {
                const source = origin.sourceEntity;
                Shortcut.add(source, args);
            });
            return { status: CustomCommandStatus.Success };
        }
    },
    { //shortcut_remove
        command: {
            name: `${config.commandPrefix}:`+ "shortcut_remove",
            description: "ショートカットを削除します",
            permissionLevel: CommandPermissionLevel.Admin,
            mandatoryParameters: [
                { type: CustomCommandParamType.Integer, name: "removeIndex" },
            ],
        },
        alias: [  ],
        func: function(origin, ...args) {
            system.run(() => {
                const source = origin.sourceEntity;
                Shortcut.delete(source, args);
            });
            return { status: CustomCommandStatus.Success };
        }
    },

    { //musk
        command: {
            name: `${config.commandPrefix}:`+ "musk",
            description: "ブラシの置き換え可能ブロックを設定、削除します",
            permissionLevel: CommandPermissionLevel.Admin,
            optionalParameters: [
                { type: CustomCommandParamType.String, name: `muskBlock§d${ENUMS.block}§f` },
            ],
        },
        alias: [  ],
        func: function(origin, ...args) {
            system.run(() => {
                const source = origin.sourceEntity;
                WorldEdit.musk(source, args);
            });
            return { status: CustomCommandStatus.Success };
        }
    },

    { //brush
        command: {
            name: `${config.commandPrefix}:`+ "brush",
            description: "アイテムにブラシを設定します",
            permissionLevel: CommandPermissionLevel.Admin,
        },
        alias: [  ],
        func: function(origin, ...args) {
            system.run(() => {
                const source = origin.sourceEntity;
                // WorldEdit.brush(source, args);
            });
            return { status: CustomCommandStatus.Success };
        }
    },
    { //brush_sphere
        command: {
            name: `${config.commandPrefix}:`+ "brush_sphere",
            description: "球体ブラシを設定します",
            permissionLevel: CommandPermissionLevel.Admin,
            mandatoryParameters: [
                { type: CustomCommandParamType.String, name: `setBlock§d${ENUMS.block}§f` },
                { type: CustomCommandParamType.Integer, name: "radius" },
            ],
            optionalParameters: [
                { type: CustomCommandParamType.Boolean, name: "hollow" },
            ],
        },
        alias: [  ],
        func: function(origin, ...args) {
            system.run(() => {
                const source = origin.sourceEntity;
                args.unshift("sphere");
                Brush.set(source, args);
            });
            return { status: CustomCommandStatus.Success };
        }
    },
    { //brush_cylinder
        command: {
            name: `${config.commandPrefix}:`+ "brush_cylinder",
            description: "柱ブラシを設定します",
            permissionLevel: CommandPermissionLevel.Admin,
            mandatoryParameters: [
                { type: CustomCommandParamType.String, name: `setBlock§d${ENUMS.block}§f` },
                { type: CustomCommandParamType.Integer, name: "radius" },
                { type: CustomCommandParamType.Integer, name: "height" },
            ],
            optionalParameters: [
                { type: CustomCommandParamType.Boolean, name: "hollow" },
            ],
        },
        alias: [  ],
        func: function(origin, ...args) {
            system.run(() => {
                const source = origin.sourceEntity;
                args.unshift("cylinder");
                Brush.set(source, args);
            });
            return { status: CustomCommandStatus.Success };
        }
    },
    { //brush_smooth
        command: {
            name: `${config.commandPrefix}:`+ "brush_smooth",
            description: "整地ブラシを設定します",
            permissionLevel: CommandPermissionLevel.Admin,
            optionalParameters: [
                { type: CustomCommandParamType.Integer, name: "radius" },
            ],
        },
        alias: [  ],
        func: function(origin, ...args) {
            system.run(() => {
                const source = origin.sourceEntity;
                args.unshift("smooth");
                Brush.set(source, args);
            });
            return { status: CustomCommandStatus.Success };
        }
    },
    { //brush_square
        command: {
            name: `${config.commandPrefix}:`+ "brush_square",
            description: "正方形ブラシを設定します",
            permissionLevel: CommandPermissionLevel.Admin,
            mandatoryParameters: [
                { type: CustomCommandParamType.String, name: `setBlock§d${ENUMS.block}§f` },
                { type: CustomCommandParamType.Integer, name: "size" },
            ],
            optionalParameters: [
                { type: CustomCommandParamType.Boolean, name: "hollow" },
            ],
        },
        alias: [  ],
        func: function(origin, ...args) {
            system.run(() => {
                const source = origin.sourceEntity;
                args.unshift("square");
                Brush.set(source, args);
            });
            return { status: CustomCommandStatus.Success };
        }
    },
    { //brush_struct
        command: {
            name: `${config.commandPrefix}:`+ "brush_struct",
            description: "構造体ブラシを設定します",
            permissionLevel: CommandPermissionLevel.Admin,
            mandatoryParameters: [
                { type: CustomCommandParamType.String, name: "id" },
            ],
            optionalParameters: [
                { type: CustomCommandParamType.Enum, name: "w:pastePosType" },
                // { type: CustomCommandParamType.Enum, name: "w:rotate" },
                // { type: CustomCommandParamType.Enum, name: "w:mirrorAxis" },
            ],
        },
        alias: [  ],
        enums: {
            "w:pastePosType": [ "center", "face" ],
            // "w:rotate": [ "0", "90", "180", "270" ],
            // "w:mirrorAxis": [ "X", "Z", "XZ" ],
        },
        func: function(origin, ...args) {
            system.run(() => {
                const source = origin.sourceEntity;
                args.unshift("struct");
                Brush.set(source, args);
            });
            return { status: CustomCommandStatus.Success };
        }
    },


    { //tool
        command: {
            name: `${config.commandPrefix}:`+ "tool",
            description: "アイテムにツールを設定します",
            permissionLevel: CommandPermissionLevel.Admin,
        },
        alias: [  ],
        func: function(origin, ...args) {
            system.run(() => {
                const source = origin.sourceEntity;
            });
            return { status: CustomCommandStatus.Success };
        }
    },
    { //tool_replace
        command: {
            name: `${config.commandPrefix}:`+ "tool_replace",
            description: "置き換えツールを設定します",
            permissionLevel: CommandPermissionLevel.Admin,
        },
        alias: [  ],
        func: function(origin, ...args) {
            system.run(() => {
                const source = origin.sourceEntity;
                args.unshift("replace");
                Tool.set(source, args);
            });
            return { status: CustomCommandStatus.Success };
        }
    },
    { //tool_info
        command: {
            name: `${config.commandPrefix}:`+ "tool_info",
            description: "情報表示ツールを設定します",
            permissionLevel: CommandPermissionLevel.Admin,
        },
        alias: [  ],
        func: function(origin, ...args) {
            system.run(() => {
                const source = origin.sourceEntity;
                args.unshift("info");
                Tool.set(source, args);
            });
            return { status: CustomCommandStatus.Success };
        }
    },
    { //tool_tree
        command: {
            name: `${config.commandPrefix}:`+ "tool_tree",
            description: "ツリーツールを設定します",
            permissionLevel: CommandPermissionLevel.Admin,
            mandatoryParameters: [
                { type: CustomCommandParamType.Enum, name: "w:treeId" },
            ],
        },
        alias: [  ],
        enums: {
            "w:treeId": Tool.treeIds
        },
        func: function(origin, ...args) {
            system.run(() => {
                const source = origin.sourceEntity;
                args.unshift("tree");
                Tool.set(source, args);
            });
            return { status: CustomCommandStatus.Success };
        }
    },
    { //tool_farbuild
        command: {
            name: `${config.commandPrefix}:`+ "tool_farbuild",
            description: "長距離建築ツールを設定します",
            permissionLevel: CommandPermissionLevel.Admin,
            mandatoryParameters: [
                { type: CustomCommandParamType.String, name: `setBlock§d${ENUMS.block}§f` },
            ],
        },
        alias: [  ],
        func: function(origin, ...args) {
            system.run(() => {
                const source = origin.sourceEntity;
                args.unshift("farbuild");
                Tool.set(source, args);
            });
            return { status: CustomCommandStatus.Success };
        }
    },
    { //tool_lrbuild
        command: {
            name: `${config.commandPrefix}:`+ "tool_lrbuild",
            description: "建築用ツールを設定します",
            permissionLevel: CommandPermissionLevel.Admin,
            mandatoryParameters: [
                { type: CustomCommandParamType.String, name: `rightSetBlock§d${ENUMS.block}§f` },
                { type: CustomCommandParamType.String, name: `leftSetBlock§d${ENUMS.block}§f` },
            ],
        },
        alias: [  ],
        func: function(origin, ...args) {
            system.run(() => {
                const source = origin.sourceEntity;
                args.unshift("lrbuild");
                Tool.set(source, args);
            });
            return { status: CustomCommandStatus.Success };
        }
    },

    { //none
        command: {
            name: `${config.commandPrefix}:`+ "none",
            description: "アイテムのブラシ、ツールの設定を削除します",
            permissionLevel: CommandPermissionLevel.Admin,
        },
        alias: [  ],
        func: function(origin, ...args) {
            system.run(() => {
                const source = origin.sourceEntity;
                args.unshift("lrbuild");
                Tool.none(source, args);
            });
            return { status: CustomCommandStatus.Success };
        }
    },


    { //particles
        command: {
            name: `${config.commandPrefix}:`+ "particles",
            description: "パーティクルの設定をします",
            permissionLevel: CommandPermissionLevel.Admin,
        },
        alias: [  ],
        func: function(origin, ...args) {
            system.run(() => {
                const source = origin.sourceEntity;
                Particles.showForm(source);
            });
            return { status: CustomCommandStatus.Success };
        }
    },
    { //actionbar
        command: {
            name: `${config.commandPrefix}:`+ "actionbar",
            description: "アクションバーに表示する情報を設定します",
            permissionLevel: CommandPermissionLevel.Admin,
        },
        alias: [  ],
        func: function(origin, ...args) {
            system.run(() => {
                const source = origin.sourceEntity;
                // Particles.showForm(source);
            });
            return { status: CustomCommandStatus.Success };
        }
    },



    //Unitil
    // { //give
    //     command: {
    //         name: `${config.commandPrefix}:`+ "give",
    //         description: "プレイヤーにアイテムを与えます",
    //         permissionLevel: CommandPermissionLevel.Admin,
    //         mandatoryParameters: [
    //             { type: CustomCommandParamType.PlayerSelector, name: "player" },
    //             { type: CustomCommandParamType.ItemType, name: `itemName` },
    //         ],
    //         optionalParameters: [
    //             { type: CustomCommandParamType.Integer, name: `amount` },
    //             { type: CustomCommandParamType.String, name: `components(Json)` },
    //         ]
    //     },
    //     alias: [  ],
    //     func: function(origin, players, itemId, amount, components) {
    //         system.run(() => {
    //             const source = origin.sourceEntity;
    //             Unitil.give(source, players, itemId, amount, components);
    //         });
    //         return { status: CustomCommandStatus.Success };
    //     }
    // },

    { //killitem
        command: {
            name: `${config.commandPrefix}:`+ "killitem",
            description: "ディメンション内のドロップアイテムを削除します",
            permissionLevel: CommandPermissionLevel.Admin,
        },
        alias: [ ],
        func: function(origin, ...args) {
            system.run(() => {
                const source = origin.sourceEntity;
                Unitil.killitem(source, args);
            });
            return { status: CustomCommandStatus.Success };
        }
    },
    { //copyitem
        command: {
            name: `${config.commandPrefix}:`+ "copyitem",
            description: "手に持っているアイテムを複製します",
            permissionLevel: CommandPermissionLevel.Admin,
            optionalParameters: [
                { type: CustomCommandParamType.Integer, name: "count" },
            ],
        },
        alias: [ ],
        func: function(origin, ...args) {
            system.run(() => {
                const source = origin.sourceEntity;
                Unitil.copyitem(source, args);
            });
            return { status: CustomCommandStatus.Success };
        }
    },
    { //transferitem
        command: {
            name: `${config.commandPrefix}:`+ "transferitem",
            description: "手に持っているアイテムを複製してプレイヤーに送信します",
            permissionLevel: CommandPermissionLevel.Admin,
            mandatoryParameters: [
                { type: CustomCommandParamType.PlayerSelector, name: "player" },
            ],
        },
        alias: [ ],
        func: function(origin, ...args) {
            system.run(() => {
                const source = origin.sourceEntity;
                Unitil.transitem(source, args);
            });
            return { status: CustomCommandStatus.Success };
        }
    },
    { //gamemodeform
        command: {
            name: `${config.commandPrefix}:`+ "gf",
            description: "ゲームモードフォームを開きます",
            permissionLevel: CommandPermissionLevel.Admin,
        },
        alias: [  ],
        func: function(origin, ...args) {
            system.run(() => {
                const source = origin.sourceEntity;
                Unitil.gamemodeForm(source, args);
            });
            return { status: CustomCommandStatus.Success };
        }
    },

]



system.beforeEvents.startup.subscribe(ev => {
    for(const DATA of COMMAND_LIST) {
        if(DATA.enums) {
            for(const key of Object.keys(DATA.enums)) {
                ev.customCommandRegistry.registerEnum(key, DATA.enums[key]);
            }
        }

        ev.customCommandRegistry.registerCommand(DATA.command, DATA.func);


        if(DATA?.alias?.length > 0) {
            for(const alia of DATA.alias) {
                const commandCopy = JSON.parse(JSON.stringify(DATA.command));
                commandCopy.name = `${config.commandPrefix}:` + alia;

                ev.customCommandRegistry.registerCommand(commandCopy, DATA.func);
            }
            
        }
    }
});

