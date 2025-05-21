import { system, world } from "@minecraft/server";

import "./events/playerBreakBlock";
import "./events/playerInteracteWithBlock";
import "./events/itemUse";
import "./events/interval";

//database 作成
import "./database";

import "./we/WorldEdit";
import "./Unitil";

//customCommand 作成
import "./customCommands";

import { config } from "./config";
export const version = [ 0, 10, 0 ];
system.run(() => {
    if(config.announceReloadLog)world.sendMessage(`[§6WorldEdit ver${version.join(".")}§f] Reload`);
});