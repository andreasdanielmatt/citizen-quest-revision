const EventEmitter = require('events');
const LogicParser = require('../dialogues/logic-parser');

class QuestTracker {
  constructor(config, flags) {
    this.config = config;
    this.flags = flags;
    this.events = new EventEmitter();
    this.logicParser = new LogicParser({ flags });

    this.flags.events.on('flag', this.handleFlagChange.bind(this));

    this.activeQuestId = null;
    this.activeStage = null;
    this.stageCounter = null;
  }

  handleFlagChange(flag, value) {
    const flagParts = flag.split('.');
    if (flagParts.length === 3 && flagParts[0] === 'quest') {
      if (this.config.storylines.touristen.quests[flagParts[1]] !== undefined) {
        if (flagParts[2] === 'active' && value === 1) {
          this.onQuestActive(flagParts[1]);
        } else if (flagParts[2] === 'done' && value === 1) {
          this.onQuestDone(flagParts[1]);
        }
      }
    }

    this.updateCounter();
    this.updateStage();
  }

  getAvailableQuests() {
    return Object.entries(this.config.storylines.touristen.quests)
      .filter(([id]) => !this.flags.value(`quest.${id}.done`) && !this.flags.value(`quest.${id}.active`))
      .map(([id]) => id);
  }

  getNpcsWithQuests() {
    const availableQuests = this.getAvailableQuests();
    return Object.entries(this.config.storylines.touristen.quests)
      .filter(([id]) => availableQuests.includes(id))
      .map(([, props]) => props.npc);
  }

  setActiveQuest(questId) {
    if (questId !== this.activeQuestId) {
      if (this.activeQuestId) {
        this.events.emit('questInactive', this.activeQuestId);
      }
      this.activeQuestId = questId;
      this.activeStage = null;
      this.stageCounter = null;
      if (questId) {
        this.events.emit('questActive', questId);
      }
      this.updateStage();
      this.updateCounter();
    }
  }

  setActiveStage(stage) {
    if (stage !== this.activeStage) {
      const oldStage = this.activeStage;
      this.activeStage = stage;
      this.stageCounter = null;
      this.events.emit('stageChanged', this.activeQuestId, stage, oldStage);
      this.updateCounter();
    }
  }

  setStageCounter(count) {
    if (count !== this.stageCounter) {
      const oldCount = this.stageCounter;
      this.stageCounter = count;
      this.events.emit('stageCountChanged', this.activeQuestId, count, oldCount);
    }
  }

  getActiveQuest() {
    return this.activeQuestId;
  }

  getActiveStage() {
    return this.activeStage;
  }

  getActivePrompt() {
    if (this.activeQuestId === null || this.activeStage === null) {
      return null;
    }
    return this.config.storylines.touristen.quests[this.activeQuestId]
      .stages[this.activeStage].prompt;
  }

  getActiveStageCounter() {
    if (this.activeQuestId === null || this.activeStage === null || this.stageCounter === null) {
      return null;
    }

    return this.stageCounter;
  }

  getActiveStageCounterMax() {
    if (this.activeQuestId === null || this.activeStage === null) {
      return null;
    }

    const stage = this.config.storylines.touristen.quests[this.activeQuestId]
      .stages[this.activeStage];
    if (stage.counter !== undefined) {
      return stage.counter.max;
    }
    return null;
  }

  updateStage() {
    if (!this.activeQuestId) {
      return;
    }
    const newStage = this.config.storylines.touristen.quests[this.activeQuestId].stages
      .findIndex(stage => stage.cond === undefined || !!this.logicParser.evaluate(stage.cond));

    this.setActiveStage(newStage);
  }

  updateCounter() {
    if (this.activeQuestId === null || this.activeStage === null) {
      return;
    }
    const stage = this.config.storylines.touristen.quests[this.activeQuestId]
      .stages[this.activeStage];
    if (stage.counter !== undefined) {
      const newCount = this.logicParser.evaluate(stage.counter.expression);
      this.setStageCounter(newCount);
    }
  }

  onQuestActive(questId) {
    this.setActiveQuest(questId);
  }

  onQuestDone(questId) {
    this.events.emit('questDone', questId);
    this.setActiveQuest(null);
  }
}

module.exports = QuestTracker;
