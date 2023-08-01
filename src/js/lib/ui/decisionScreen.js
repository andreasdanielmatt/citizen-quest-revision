const EventEmitter = require('events');
const SpeechText = require('../dialogues/speech-text');
const { I18nTextAdapter } = require('../helpers/i18n');

class DecisionScreen {
  constructor(config, lang) {
    this.config = config;
    this.events = new EventEmitter();
    this.lang = lang;

    this.$element = $('<div></div>')
      .addClass('decision-screen-wrapper');

    this.$screen = $('<div></div>')
      .addClass('decision-screen')
      .appendTo(this.$element);

    this.$title = $('<h1></h1>')
      .addClass('decision-screen-title')
      .text('Eine Entscheidung wurde getroffen…')
      .appendTo(this.$screen);

    this.$icon = $('<div></div>')
      .addClass('decision-screen-icon')
      .appendTo(this.$screen);

    this.$text = $('<div></div>')
      .addClass('decision-screen-text')
      .appendTo(this.$screen);

    this.speech = new SpeechText();
    this.$text.append(this.speech.$element);

    this.titleI18n = new I18nTextAdapter((text) => {
      this.$title.text(text);
    }, this.lang);

    this.titleI18n.setText({
      de: 'Eine Entscheidung wurde getroffen…',
      en: 'A decision has been made…',
    });

    this.speechI18n = new I18nTextAdapter((text) => {
      const { revealComplete } = this.speech;
      this.speech.showText([{ string: text }]);
      if (revealComplete) {
        this.speech.revealAll();
      }
    }, this.lang);
  }

  showDecision(endingText, icon) {
    this.$icon.addClass(icon);
    this.$element.addClass('visible');
    setTimeout(() => {
      this.speechI18n.setText(endingText, true);
    }, 2000);
  }

  setLang(lang) {
    this.lang = lang;
    this.titleI18n.setLang(lang);
    this.speechI18n.setLang(lang);
  }
}

module.exports = DecisionScreen;
