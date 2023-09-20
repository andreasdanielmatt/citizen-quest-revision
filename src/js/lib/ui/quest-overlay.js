const UIQueue = require('./ui-queue');
const QuestOverlayPanel = require('./quest-overlay-panel');

class QuestOverlay {
  constructor(config, lang, questTracker) {
    this.config = config;
    this.lang = lang;
    this.questTracker = questTracker;

    this.uiQueue = new UIQueue();

    this.panel = new QuestOverlayPanel(config, lang);
    this.$element = this.panel.$element;

    this.questTracker.events.on('questActive', this.handleQuestActive.bind(this));
    this.questTracker.events.on('questInactive', this.handleQuestInactive.bind(this));
    this.questTracker.events.on('questDone', this.handleQuestDone.bind(this));
    this.questTracker.events.on('stageChanged', this.handleStageChange.bind(this));
    this.questTracker.events.on('stageCountChanged', this.handleStageCountChanged.bind(this));
    this.questTracker.events.on('noQuest', this.handleNoQuest.bind(this));
  }

  setLang(lang) {
    this.lang = lang;
    this.panel.setLang(lang);
  }

  hide() {
    this.uiQueue.cancel();
    this.panel.hide();
  }

  // eslint-disable-next-line class-methods-use-this,no-unused-vars
  handleQuestActive(questId) {
  }

  // eslint-disable-next-line no-unused-vars,class-methods-use-this
  handleQuestInactive(questId) {
  }

  // eslint-disable-next-line class-methods-use-this,no-unused-vars
  handleQuestDone(questId) {
  }

  handleStageChange() {
    this.showActiveQuestPrompt();
  }

  handleStageCountChanged(activeQuestId, count) {
    this.uiQueue.add(() => {
      this.panel.setCounter(count);
    }, 1000);
  }

  handleNoQuest() {
    this.showStorylinePrompt();
  }

  showStorylinePrompt() {
    this.show(this.questTracker.storylineManager.getPrompt());
  }

  showActiveQuestPrompt() {
    this.show(this.questTracker.getActivePrompt(), this.questTracker.getActiveStageCounterMax());
  }

  show(promptText, counterMax = null) {
    this.uiQueue.add(() => {
      this.panel.hide();
    }, () => (this.panel.isVisible() ? 500 : 0));

    if (promptText) {
      this.uiQueue.add(() => {
        this.panel.clearCounter();
        this.panel.setText(promptText);
        if (counterMax) {
          this.panel.createCounter(counterMax);
        }
        this.panel.show();
      }, 500);
    }
  }
}

module.exports = QuestOverlay;
