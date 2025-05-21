import { World, Player } from "@minecraft/server";
import { WorldDatabase, PlayerDatabase } from "./libs/Database";

export const worldDB = new WorldDatabase("worldDB");
export const playerDB = new PlayerDatabase("playerDB");