


# WorldEdit
Java版のプラグイン/ModのWorldEditを統合版で再現しました。

## 使い方

### 権限
- オペレーター、もしくはタグ(デフォルトだと`admin`)がついているプレイヤーのみ使用可能です。
- アイテム(WandItem,TpItem,BrushItem)の使用はゲームモードがクリエイティブの時のみ使用可能です。

### 基本操作

- **WandItem**
  - WandItem(デフォルトだと木の斧)を使用することで始点と終点を決めることができます。
  - メインハンドに持って左クリック(破壊動作)で始点を設定、右クリック(インタラクト動作)で終点を設定できます。
    
- **TpItem**
  - TpItem(デフォルトだとコンパス)を使用することでテレポートできます。
  - 右クリックで視点先のブロックまで、ブロックに向かって左クリックでブロックを貫通してテレポートできます。

- **コマンド**
  - 先頭に`/w:`(デフォルト)を付けることで使用できます。
  - *[使用できるコマンド一覧](#コマンド一覧)*


- ~~**チャットコマンド**~~
  - ~~先頭に`!!`(デフォルト)を接続することで使用可能です。~~
  - ~~`!!help`と入力することで使用できるチャットコマンドの一覧を表示します。~~
  - ~~*[使用できるコマンド一覧](#チャットコマンド一覧)*~~
 

## コマンド一覧

<details><summary><bold>全般</bold></summary>
 
|書式|別名|説明|
|---|---|---|
|help||WorldEditのコマンド一覧を表示します。|
|version|v|WorldEditのバージョンを表示します。|
|undo||WorldEditでの編集を1つ前に戻します。|
|redo||WorldEditでの編集を1つ先に戻します。|
|clearhistory||編集履歴を削除します。|
|get||メインハンドのアイテムをIDを表示します。|
|getview||視点先のブロックをID、blockStateを表示します。|
|killitem|ki|ワールド内のドロップアイテムを削除します。|
|copyitem||メインハンドのアイテムを複製します。|
</details>


<details><summary><bold>プレイヤーの移動</bold></summary>

 |書式|別名|説明|
|---|---|---|
|unstuck|us|プレイヤーがブロックに埋もれている場合脱出します。|
|ascend|as|上の階に移動します。|
|descend|des|下の階に移動します。|
|ceil||天井に移動します。|
|tpitem<br><br><br><br>||メインハンドのアイテムをTpItemに登録します。<br>TpItemを持って右クリックすると視点先のブロックにテレポートします。<br> TpItemを持ってブロックに対して左クリックすると反対側にテレポートします。<br>メインハンドを空にしてコマンドを実行するとTpItemをリセットできます。|
</details>


<details><summary><bold>範囲選択</bold></summary>

|書式|別名|説明|
|---|---|---|
|pos1|pos1|プレイヤーの座標を始点にセットします。|
|pos2|pos2|プレイヤーの座標を終点にセットします。|
|size|size|始点から終点のXYZサイズを表示します。|
|count|count|始点から終点のブロック数を表示します。|
|center \<teleport><br><br><br>||始点から終点のブロックの中心座標を表示します。<br><br>**teleport**: 中心座標にテレポートします。(例: `center 1`)|
</details>

<details><summary><bold>範囲操作</bold></summary>

|書式|別名|説明|
|---|---|---|
|set \<pattern>||選択範囲内にブロックを設置します。<br><br>**\<pattern>**: 配置するブロックのパターン。<br>&emsp;**blockId**: ブロックのID。(例: `minecraft:stone、air`)<br>&emsp;**main**: メインハンドのブロックを指定。<br>&emsp;**view**: 視点先のブロックを指定。(blockStatesを所持)<br>&emsp;**複数指定**: blockId(main、viewも可)をコンマで区切ることで複数のブロックを指定可能。<br>&emsp;(例: `glass_block,dirt,stone`)<br>&emsp;**複数指定(割合)**: 複数指定時に各ブロックの割合を指定できます。<br>&emsp;(例: `1%glass_block,1%dirt,1%stone`、`50%red_wool,50%blue_wool`)|
|replace \<pattern> \<target>|repl|選択範囲内の任意のブロックのみ置換します。<br><br>**\<pattern>**: 配置するブロック対象のパターン(setコマンドと同じ)<br><br>**\<target>**: 置換するブロックのパターン。<br>&emsp;**blockId**: ブロックのID。(例: `minecraft:stone、air`)<br>&emsp;**main**: メインハンドのブロックを指定。<br>&emsp;**view**: 視点先のブロックを指定。(blockStatesを所持)|
|overlay \<pettern>||選択範囲内の1つ上のブロックのみ置換します。<br><br>**\<pattern>**: 配置するブロック対象のパターン(setコマンドと同じ)|
|move \<x> \<y> \<z>||選択範囲のブロックを動かします。<br><br>**\<x/y/z>**: 各座標の移動するブロック数。|
|stack \<axisAndCount>||選択範囲のブロックを指定回数複製します。<br><br>**\<axisAndCount>**: 複製方向の成分と複製回数を指定。<br>(例: (`x:10`、`y:-50`))|
|copy||選択範囲内のブロックをコピーします。(最大数: x:64, y:384, z:64)|
|paste \<rotate> \<mirror>||コピーしたデータを自身の座標を基準に設置します。<br><br>**\<rotate>**: 設置時の回転角度を指定。<br>&emsp;**None**: 0度。<br>&emsp;**Rotate90**: 90度。<br>&emsp;**Rotate180**: 180度。<br>&emsp;**Rotate270**: 270度。<br><br>**\<mirror>**: 設置時の反転方向を指定。。<br>&emsp;**None**: 反転無し。<br>&emsp;**X**: x方面に反転。。<br>&emsp;**Z**: z方面に反転。。<br>&emsp;**XZ**: x方面、z方面に反転。|
</details>


<details><summary><bold>ブラシ</bold></summary>
 アイテムをブラシツールに設定します。ブラシツールは右クリックすることで視点先に建造物を生成します。

|書式|別名|説明|
|---|---|---|
|**mask \<mask>**||ブラシにマスクをセットします。マスクでセットしたブロックのみをブラシで置き換えるようになります。<br>**\<mask>**未入力でマスクをリセットできます。<br><br>**\<mask>**: 配置するブロックのパターン。<br>&emsp;**blockId**: ブロックのID。(例: `minecraft:stone、air`)<br>&emsp;**main**: メインハンドのブロックを指定。<br>&emsp;**view**: 視点先のブロックを指定。(blockStatesを所持)|
|**brush <subCommand>**|br|メインハンドのアイテムを\<subCommand>で指定したブラシに設定します。|
|**brush [h]sphere \<pattern> \<radius>**|br sp<br>br hsp|球体に設定します。<br><br>**\<pattern>**: maskと同じものが使用できます。<br>**\<radius>**: 球体の半径を指定します。1~6のみ指定可能。<br>**[h]**: 先頭にhをつけると球体の中身を空洞にできる。|
|**brush [h]cylinder \<pattern> \<radius> \<height>**|br cl<br>br hcl|円柱に設定します。<br><br>**\<pattern>**: maskと同じものが使用できます。<br>**\<radius>**: 円柱の半径を指定します。1\~6のみ指定可能。<br>**\<height>**: 円柱の高さを指定します。1\~6のみ指定可能。 <br>**[h]**: 先頭にhをつけると円柱の中身を空洞にできる。|
</details>


 


