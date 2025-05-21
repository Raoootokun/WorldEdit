import { world, system } from "@minecraft/server";

const callbacks = new Map();
export class BowEvents {
  static get shoot() {
    return class shoot {
      callback = () => { };
  
      constructor(callback) {
        this.callback = callback;
        callbacks.set("shoot", this.callback);
      };
    
      static subscribe(callback) {
        new shoot(callback);
      };
    
      static unsubscribe(callback) {
        callbacks.delete(callback);
      };
    };
  };

  static get chargeStart() {
    return class chargeStart {
      callback = () => { };
  
      constructor(callback) {
        this.callback = callback;
        callbacks.set("chargeStart", this.callback);
      };
    
      static subscribe(callback) {
        new chargeStart(callback);
      };
    
      static unsubscribe(callback) {
        callbacks.delete(callback);
      };
    };
  };

  static get chargeStop() {
    class chargeStop {
      callback = () => { };
  
      constructor(callback) {
        this.callback = callback;
        callbacks.set("chargeStop", this.callback);
      };
    
      static subscribe(callback) {
        new chargeStop(callback);
      };
    
      static unsubscribe(callback) {
        callbacks.delete(callback);
      };
    };
  };
  
};

world.afterEvents.itemStartUse.subscribe(ev => {
  const { source, itemStack } = ev;
  if(source.typeId != "minecraft:player" || itemStack.typeId != "minecraft:bow")return;
  
  if(callbacks.get("chargeStart")){
    callbacks.get("chargeStart")({
      player: source,
      itemStack: itemStack,
    });
  };
  
  callbacks.set(`isCharge_${source.id}`, true);
  callbacks.set(`isChargeStartTick_${source.id}`, system.currentTick);
});

world.afterEvents.itemStopUse.subscribe(ev => {
  const { source, itemStack } = ev;
  if(source?.typeId != "minecraft:player" || itemStack?.typeId != "minecraft:bow")return;

  if(callbacks.get("chargeStop")){
    if(!callbacks.get(`isCharge_${source.id}`))return;

    callbacks.get("chargeStop")({
        player: source,
        itemStack: itemStack,
    });
  };
});

world.afterEvents.entitySpawn.subscribe(ev => {
  const { entity, cause } = ev;
  if(entity.typeId != "minecraft:arrow")return;
  
  if(callbacks.get("shoot")){
    const projeComp = entity.getComponent("projectile");
    const player = projeComp?.owner;
    if(!player)return;

    const chargeTick = system.currentTick - callbacks.get(`isChargeStartTick_${player?.id}`);
    callbacks.delete(`isChargeStartTick_${player?.id}`);

    callbacks.get("shoot")({
      projectile: entity,
      player: player,
      chargeTick: chargeTick,
      itemStack: player.getComponent("inventory").container.getItem(player.selectedSlotIndex),
    });
  };
});