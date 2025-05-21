import { world, } from "@minecraft/server";

const texts = [
    { c:`help`, t:`worldeditのコマンド一覧を表示します` },
    { c:`pos1`, t:`初期位置を設定します` },
    { c:`pos2`, t:`終了位置を設定します` },
    { c:`undo`, t:`作業を1つ前に戻します` },
    { c:`redo`, t:`作業を1つ先に戻します` },
    { c:`clearhistory`, t:`編集履歴(undo,redo)を初期化します` },

    { c:`unstack/us`, t:`ブロックから抜け出します` },
    { c:`ceil`, t:`天井のテレポートします` },
    { c:`ascend/as`, t:`上の階へテレポートします` },
    { c:`descend/des`, t:`下の階へテレポートします` },

    { c:`info/i`, t:`メインハンドのアイテムの情報を表示します` },
    { c:`infoview/iv`, t:`視点先のブロックの情報を表示します` },
    { c:`getview`, t:`視点先のブロックを取得します` },
    

    { c:`killitem`, t:`ディメンション内のドロップアイテムを削除します` },
    { c:`copyitem <count?: int>`, t:`手に持っているアイテムを複製します` },
    { c:`transferitem <target: player>`, t:`手に持っているアイテムをプレイヤーに転送します` },
    { c:`gf`, t:`ゲームモード変更フォームを表示します` },
  
    { c:`set <setBlock: [BlockId/main/view/BlockPattern/slotIndex]>`, t:`初期位置から終了位置までを指定したブロックに置き換えます` },
    { c:`replace/repl <setBlock: [BlockId/main/view/BlockPattern/slotIndex]> <replaceBlock: [BlockId/main/view/BlockPattern/slotIndex]>`, t:`初期位置から終了位置までを特定のブロックのみ指定したブロックに置き換えます` },
    { c:`copy <id: string>`, t:`初期位置から終了位置をコピーします` },
    { c:`paste <id: string> <position?: [my/view/pos1/pos2]> <rotate?: [0,90,180,270]> <mirrorAxis?: [none/x/z/xz]>`, t:`コピーした建造物を設置します` },
    { c:`fill <setBlock: [BlockId/main/view/BlockPattern/slotIndex]> <count: int>`, t:`自身を中心にブロックを敷き詰めていきます` },
    { c:`center <teleport?: bool>`, t:`初期位置から終了位置の中心座標を表示します` },
    { c:`size`, t:`初期位置から終了位置のサイズを表示します` },
    { c:`count`, t:`初期位置から終了位置のブロック数を表示します` },
    { c:`move <x?: int> <y?: int> <z?: int>`, t:`初期位置から終了位置内の建造物を移動させます` },
    { c:`stack <axis: [x,-x,y,-y,z,-z]> <count: int>`, t:`初期位置から終了位置内の建造物を複製します` },
    // { c:`division <space: int>`, t:`初期位置から終了位置内にブロックを指定間隔で配置します` },
    { c:`overlay <setBlock: [BlockId/main/view/BlockPattern/slotIndex]> <height?: int>`, t:`初期位置から終了位置内の上側だけを指定したブロックに置き換えます` },
    { c:`fixwater <count?: int>`, t:`自身を中心に水源を敷き詰めます` },
    { c:`fixlava <count?: int>`, t:`自身を中心に溶岩源を敷き詰めます` },

    

    { c:`brush`, t:`アイテムにブラシを設定します` },
    { c:`brush_sphere <setBlock: [BlockId/main/view/BlockPattern/slotIndex]> <radius: int> <hollow: bool>`, t:`視点先のブロックに球体を設置します` },
    { c:`brush_cylinder <setBlock: [BlockId/main/view/BlockPattern/slotIndex]> <radius: int> <height: int> <hollow: bool>`, t:`視点先のブロックに柱を設置します` },
    { c:`brush_square <setBlock: [BlockId/main/view/BlockPattern/slotIndex]> <size: int> <hollow: bool>`, t:`視点先のブロックに正方形を設置します` },
    { c:`brush_struct <id: string> <pastePosType?: [center/face]>`, t:`視点先のブロックに構造体を設置します` },
    // { c:`brush_smooth <radius: int>`, t:`視点先のブロックの勾配等を滑らかにします` },
    { c:`musk <muskBlock: [BlockId/main/view/BlockPattern/slotIndex]>`, t:`ブラシの置き換え可能ブロックを設定します` },
    { c:`musk`, t:`マスクを削除します` },
    
    { c:`tool`, t:`アイテムにツールを設定します` },
    { c:`tool_replace`, t:`対象ツールを持って、左クリックでコピー、右クリックで設置が可能になります` },
    { c:`tool_tree <treeId: string>`, t:`対象ツールを持って右クリックで視点先にツリーが設置可能になります` },
    { c:`tool_info`, t:`対象ツールを持って右クリックで視点先のブロックの情報が取得可能になります` },
    { c:`tool_farbuild <setBlock: [BlockId/main/view/BlockPattern/slotIndex]>`, t:`対象ツールを持って右クリックで視点先にブロックを設置可能になります` },
    { c:`tool_lrbuild <rightSetBlock: [BlockId/main/view/BlockPattern/slotIndex]> <leftSetBlock: [BlockId/main/view/BlockPattern/slotIndex]>`, t:`対象ツールを持ってブロックに向かって右クリック・左クリックでブロックを設置可能になります` },

    { c:`none`, t:`アイテムのブラシ、ツールの設定を削除します` },

    { c:`shortcut`, t:`shortcutフォームを開きます` },
    { c:`shortcut add <addCommand: string>`, t:`shortcutツールにキーを追加します` },
    { c:`shortcut delete <deleteIndex: int>`, t:`shortcutツールからキーを削除します` },

    { c:`particles`, t:`パーティクルの設定をします` },
];

export class Help {
    static sendAll(player) {
        const txt = texts.map(t => { return `§7${t.c} - ${t.t}`; }).join("\n");

        player.sendMessage(`§6===== WorldEditコマンド一覧 =====§f\n${txt}\n§6=========================`);
    }

    static send(player, command) {
        
    }
}

const helpMessages = {
    "pos1": {
        msg: [
            ""
        ]
    }
}