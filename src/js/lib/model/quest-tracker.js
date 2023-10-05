const EventEmitter = require('events');
const LogicParser = require('../dialogues/logic-parser');
const safeBuildDialogueFromItems = require('../dialogues/dialogue-safe-builder');

/**
 * Quest active event. Fired when a quest becomes active.
 *
 * @event QuestTracker#questActive
 * @param {string} questId
 */

/**
 * Quest inactive event. Fired when a quest becomes inactive (because it's done or another quest
 * became active).
 *
 * @event QuestTracker#questInactive
 * @param {string} questId
 */

/**
 * Quest done event. Fired when a quest is done (it has been completed).
 *
 * @event QuestTracker#questDone
 * @param {string} questId
 */

/**
 * Stage changed event. Fired when the active stage changes.
 *
 * @event QuestTracker#stageChanged
 * @param {string} questId
 * @param {number} stage
 * @param {number} oldStage
 */

/**
 * Stage count changed event. Fired when the active stage counter changes.
 *
 * @event QuestTracker#stageCountChanged
 * @param {string} questId
 * @param {number} count
 * @param {number} oldCount
 */

/**
 * No quest event. Fired when there is no active quest.
 *
 * @event QuestTracker#noQuest
 */

class QuestTracker {
  constructor(config, flags) {
    this.config = config;
    this.flags = flags;
    this.events = new EventEmitter();

    this.activeStoryline = null;
    this.activeQuestId = null;
    this.activeStage = null;
    this.activeCounter = null;

    this.logicParser = new LogicParser({ flags });
    this.flags.events.on('flag', this.handleFlagChange.bind(this));
  }

  /**
   * Reset the state that tracks progress on the active storyline
   */
  reset() {
    this.activeQuestId = null;
    this.activeStage = null;
    this.activeCounter = null;
  }

  /**
   * Set the active storyline.
   *
   * @param {object} storyline
   */
  setActiveStoryline(storyline) {
    this.activeStoryline = storyline;
    this.reset();
    this.events.emit('storylineChanged', storyline.id);
  }

  handleFlagChange(flag, value) {
    const flagParts = flag.split('.');
    if (flagParts.length === 3 && flagParts[0] === 'quest') {
      if (this.activeStoryline?.quests?.[flagParts[1]] !== undefined) {
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
    return Object.keys(this.activeStoryline.quests)
      .filter((id) => !this.questIsDone(id) && this.questRequirementsMet(id))
      .slice(0, this.config.game.maxActiveQuests || 3);
  }

  getNpcsWithQuests() {
    const availableQuests = this.getAvailableQuests();
    return Object.fromEntries(
      Object.entries(this.activeStoryline.quests)
        .filter(([id]) => availableQuests.includes(id))
        .map(([, props]) => [props.npc, props.mood])
    );
  }

  questIsDone(questId) {
    return !!this.flags.value(`quest.${questId}.done`);
  }

  questRequirementsMet(questId) {
    const requiredQuests = this.activeStoryline?.quests?.[questId]?.required || [];
    return [requiredQuests].flat().every((id) => this.questIsDone(id));
  }

  setActiveQuest(questId) {
    if (questId !== this.activeQuestId) {
      if (this.activeQuestId) {
        this.events.emit('questInactive', this.activeQuestId);
        this.flags.set(`quest.${this.activeQuestId}.active`, 0);
      }
      this.activeQuestId = questId;
      this.activeStage = null;
      this.activeCounter = null;
      if (questId) {
        this.events.emit('questActive', questId);
      } else {
        this.events.emit('noQuest');
      }
      this.updateStage();
      this.updateCounter();
    }
  }

  setActiveStage(stage) {
    if (stage !== this.activeStage) {
      const oldStage = this.activeStage;
      this.activeStage = stage;
      this.activeCounter = null;
      this.events.emit('stageChanged', this.activeQuestId, stage, oldStage);
      this.updateCounter();
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
    return this.activeStoryline?.quests?.[this.activeQuestId]?.stages?.[this.activeStage]?.prompt || '';
  }

  getActiveStageCounter() {
    if (this.activeQuestId === null || this.activeStage === null) {
      return null;
    }

    return this.activeStoryline?.quests?.[this.activeQuestId]?.stages?.[this.activeStage]?.counter
      || null;
  }

  getActiveStageTarget() {
    if (this.activeQuestId === null || this.activeStage === null) {
      return null;
    }

    return this.activeStoryline?.quests?.[this.activeQuestId]?.stages?.[this.activeStage]?.target
      || null;
  }

  updateStage() {
    if (!this.activeQuestId) {
      return;
    }

    const stages = this.activeStoryline?.quests?.[this.activeQuestId]?.stages || [];
    const newStage = stages.findIndex(
      (stage) => stage.cond === undefined || !!this.logicParser.evaluate(stage.cond)
    );

    // todo: Handle the case where no stages match
    this.setActiveStage(newStage);
  }

  updateCounter() {
    if (this.activeQuestId === null || this.activeStage === null) {
      return;
    }
    const stage = this.activeStoryline.quests[this.activeQuestId].stages[this.activeStage];
    if (stage.counter !== undefined) {
      const newCount = this.logicParser.evaluate(stage.counter.expression);
      if (newCount !== this.activeCounter) {
        const oldCount = this.activeCounter;
        this.activeCounter = newCount;
        this.events.emit('stageCountChanged', this.activeQuestId, newCount, oldCount);
      }
    }
  }

  getNpcDialogue(npcId) {
    // Concatenate, in order:
    // - dialogue items from the current stage
    // - dialogue items from the current quest
    // - dialogue items from all active quests
    // - dialogue items from the current storyline

    const currentQuest = this.activeStoryline?.quests?.[this.activeQuestId];
    const currentStage = currentQuest?.stages[this.activeStage];
    const storylineDialogue = this.activeStoryline?.dialogues?.[npcId];
    const npcDialogue = this.activeStoryline?.npcs?.[npcId]?.dialogue;
    const stageDialogue = currentStage?.dialogues?.[npcId];
    const questDialogue = currentQuest?.dialogues?.[npcId];
    const dialogueItems = [
      ...(stageDialogue || []),
      ...(questDialogue || []),
      ...(this.getAvailableQuests()
        .filter((id) => this.activeStoryline.quests[id]?.npc === npcId)
        .map((id) => this.activeStoryline.quests[id]?.available?.dialogue || []).flat()),
      ...(npcDialogue || []),
      ...(storylineDialogue || []),
    ];

    return safeBuildDialogueFromItems(npcId, dialogueItems);
  }

  getEndingDialogue() {
    const items = this.activeStoryline?.ending?.dialogue;
    return safeBuildDialogueFromItems('ending', items);
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
