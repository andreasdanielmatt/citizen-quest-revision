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
    this.markQuestAsDone();
  }

  handleStageChange(questId, stage, oldStage) {
    if (oldStage !== null) {
      this.markStageAsDone();
    }
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
    this.show(
      this.questTracker.getActivePrompt(),
      this.questTracker.getActiveStageCounter(),
      true
    );
  }

  show(promptText, counter = null, withCheckmark = false) {
    this.uiQueue.add(() => {
      this.panel.hide();
    }, () => (this.panel.isVisible() ? 500 : 0));

    if (promptText) {
      this.uiQueue.add(() => {
        this.panel.reset();
        this.panel.setText(promptText);

        if (withCheckmark) {
          this.panel.showCheckmark();
        }
        if (counter) {
          this.panel.createCounter(counter);
        }
        this.panel.show();
      }, 500);
    }
  }

  markStageAsDone() {
    this.uiQueue.add(() => {
      this.panel.checkCheckmark();
    }, 1000);
  }

  markQuestAsDone() {
    this.uiQueue.addPause(500);
    this.uiQueue.add(() => {
      this.panel.checkCheckmark();
    }, 1500);
  }
}

module.exports = QuestOverlay;
