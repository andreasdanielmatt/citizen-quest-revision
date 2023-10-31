const UIQueue = require('./ui-queue');
const QuestOverlayPanel = require('./quest-overlay-panel');

class QuestOverlay {
  constructor(config, lang) {
    this.config = config;
    this.lang = lang;

    this.uiQueue = new UIQueue();

    this.panel = new QuestOverlayPanel(config, lang);
    this.$element = this.panel.$element;
  }

  setLang(lang) {
    this.lang = lang;
    this.panel.setLang(lang);
  }

  hide() {
    this.uiQueue.cancel();
    this.panel.hide();
  }

  setCounter(count) {
    this.uiQueue.add(() => {
      this.panel.setCounter(count);
    }, 1000);
  }

  showDefaultPrompt() {
    this.show(this.config?.i18n?.ui?.defaultPrompt || '');
  }

  showActiveQuestPrompt(prompt, counter = null) {
    this.show(prompt, counter, true);
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
