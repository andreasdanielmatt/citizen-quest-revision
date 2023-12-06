const EventEmitter = require('events');
const SpeechText = require('./speech-text');
const { I18nTextAdapter } = require('../helpers/i18n');
const { textWithEmojisToSpeechLines } = require('../helpers/emoji-utils');
const InclusionBar = require('./inclusion-bar');
const { fitParentWidth } = require('../helpers-web/fit-parent');

class DecisionScreen {
  constructor(config, lang) {
    this.config = config;
    this.events = new EventEmitter();
    this.lang = lang;
    this.revealStarted = false;

    this.$element = $('<div></div>')
      .addClass('decision-screen-wrapper');

    this.$styleWrapper = $('<div></div>')
      .appendTo(this.$element);

    this.$screen = $('<div></div>')
      .addClass('decision-screen')
      .appendTo(this.$styleWrapper);

    this.$title = $('<h1></h1>')
      .addClass('decision-screen-title')
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

    this.titleI18n.setText(this.config.i18n.ui.decisionMade);

    this.speechI18n = new I18nTextAdapter((text) => {
      const { revealComplete } = this.speech;
      this.speech.showText(textWithEmojisToSpeechLines(text));
      if (revealComplete) {
        this.speech.revealAll();
      }
    }, this.lang);
    this.speech.events.on('complete', () => {
      this.showContinue();
    });

    this.$continue = $('<div></div>')
      .addClass(['waiting-text', 'waiting-text-decision-screen'])
      .appendTo(this.$screen)
      .hide();

    this.$continueText = $('<span></span>')
      .addClass('text')
      .appendTo(this.$continue);

    this.continueI18n = new I18nTextAdapter(
      (text) => { this.$continueText.text(text); },
      this.lang,
      this.config.i18n.ui.pressToContinue
    );

    this.inclusionBar = new InclusionBar(this.config);
    this.$screen.append($('<div></div>')
      .addClass('inclusion-bar-wrapper')
      .append(this.inclusionBar.$element));
  }

  showDecision(endingText, classes = [], inclusionTypes = []) {
    this.$styleWrapper.removeClass();
    this.$styleWrapper.addClass(classes);
    this.$element.addClass('visible');
    setTimeout(() => {
      this.revealStarted = true;
      this.speechI18n.setText(endingText, true);
    }, 2000);
    inclusionTypes.forEach((type) => this.inclusionBar.add(type));
    fitParentWidth(this.inclusionBar.$element);
  }

  setLang(lang) {
    this.lang = lang;
    this.titleI18n.setLang(lang);
    this.speechI18n.setLang(lang);
    this.continueI18n.setLang(lang);
  }

  isTextRevealed() {
    return this.speech.revealComplete;
  }

  revealText() {
    this.speech.revealAll();
  }

  showContinue() {
    this.$continue.show();
  }
}

module.exports = DecisionScreen;
