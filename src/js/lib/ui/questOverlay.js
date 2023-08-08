const { I18nTextAdapter } = require('../helpers/i18n');

class QuestOverlay {
  constructor(config, lang, questTracker) {
    this.config = config;
    this.lang = lang;
    this.questTracker = questTracker;
    this.lastUpdate = 0;

    this.$element = $('<div></div>')
      .addClass('quest-overlay', 'visible');

    this.$prompt = $('<div></div>')
      .addClass('prompt')
      .appendTo(this.$element);

    this.promptI18n = new I18nTextAdapter((newText) => {
      this.$prompt.text(newText);
    }, this.lang);

    this.$counter = $('<div></div>')
      .addClass('counter')
      .appendTo(this.$element);

    this.questTracker.events.on('questActive', this.handleQuestActive.bind(this));
    this.questTracker.events.on('questInactive', this.handleQuestInactive.bind(this));
    this.questTracker.events.on('questDone', this.handleQuestDone.bind(this));
    this.questTracker.events.on('stageChanged', this.handleStageChange.bind(this));
    this.questTracker.events.on('stageCountChanged', this.handleStageCountChanged.bind(this));
  }

  setLang(lang) {
    this.lang = lang;
    this.promptI18n.setLang(lang);
  }

  show() {
    this.$element.addClass('visible');
  }

  hide() {
    this.$element.removeClass('visible');
  }

  setPrompt(text) {
    this.hide();
    if (text !== null) {
      setTimeout(() => {
        this.promptI18n.setText(text);
        this.show();
      }, 500);
    }
  }

  clearCounter() {
    this.$counter.empty();
    this.$counter.hide();
  }

  createCounter(max) {
    this.$counter.show();
    for (let i = 0; i < max; i += 1) {
      $('<span></span>')
        .addClass('counter-item')
        .appendTo(this.$counter);
    }
  }

  updateCounter(value) {
    this.$counter.children().each((index, element) => {
      $(element).toggleClass('active', index < value);
    });
  }

  handleQuestActive(questId) {
  }

  handleQuestInactive(questId) {
    this.hide();
  }

  handleQuestDone(questId) {
  }

  handleStageChange() {
    setTimeout(() => {
      this.setPrompt(this.questTracker.getActivePrompt());
      this.clearCounter();
      const max = this.questTracker.getActiveStageCounterMax();
      if (max) {
        this.createCounter(max);
      }
    }, Math.max(0, 1000 - (Date.now() - this.lastUpdate)));
  }

  handleStageCountChanged(activeQuestId, count) {
    this.updateCounter(count);
    this.lastUpdate = Date.now();
  }
}

module.exports = QuestOverlay;
