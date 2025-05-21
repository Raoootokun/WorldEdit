import { world } from "@minecraft/server";
const scoreboard = world.scoreboard;

export class Bossbar {
  constructor(objectiveId) {
    this.objective = scoreboard.getObjective(objectiveId);
    if(!this.objective){
      scoreboard.addObjective(objectiveId);
      this.objective = scoreboard.getObjective(objectiveId);
    };
  };

  set(text, score, maxScore, color) {
    if(color == "red")var color = "§r§e§d";
    if(color == "blue")var color = "§b§l§u§e";
    this.objective.setScore(color+"§r"+text, 1000 / (maxScore/score));
  };

  show(bool) {
    if(bool) {
      scoreboard.setObjectiveAtDisplaySlot("Sidebar", { objective:this.objective });
    }else{
      scoreboard.clearObjectiveAtDisplaySlot("Sidebar");
    };
  };

  list() {
    const participants = this.objective.getParticipants();
    const list = [];

    for(const participant of participants){
      const text = participant.displayName;
      const score = this.objective.getScore(text);
      list.push({ text:text, score:score });
    };
    return list;
  };

  clear() {
    for(const participant of this.objective.getParticipants()){
      this.objective.removeParticipant(participant.displayName);
    };
  };

};