const EventEmitter = require('events');
const DialogueBalloon = require('./dialogue-balloon');
const SpeechText = require('./speech-text');
const { I18nTextAdapter } = require('../helpers/i18n');

class DialogueOverlay {
  constructor(config, lang) {
    this.config = config;
    this.events = new EventEmitter();
    this.lang = lang;

    this.$element = $('<div></div>')
      .addClass('dialogue-overlay');

    this.balloonTop = new DialogueBalloon(['balloon-speech', 'top']);
    this.$element.append(this.balloonTop.$element);
    this.topTitleI18n = new I18nTextAdapter((text) => {
      this.balloonTop.setTitle(text);
    }, this.lang);

    this.balloonBottom = new DialogueBalloon(['bottom']);
    this.$element.append(this.balloonBottom.$element);

    this.speechTop = new SpeechText();
    this.balloonTop.append(this.speechTop.$element);
    this.speechTop.events.on('complete', () => {
      this.events.emit('speechComplete');
    });
    this.speechTopI18n = new I18nTextAdapter((text) => {
      const { revealComplete } = this.speechTop;
      this.speechTop.showText([{ string: text }]);
      if (revealComplete) {
        this.speechTop.revealAll();
      }
    }, this.lang);

    this.responseOptions = [];
    this.selectedOption = 0;
  }

  setTopTitle(title) {
    this.topTitleI18n.setText(title);
  }

  showSpeech(text, classes = null) {
    this.balloonTop.show();
    this.hidePressToContinue();
    this.speechTop.clear();
    this.speechTopI18n.setText(text, true);
    this.balloonTop.removeClasses();
    if (classes) {
      this.balloonTop.setClasses(classes);
    }
  }

  speedUpSpeech() {
    this.speechTop.speedUp();
  }

  showResponseOptions(options) {
    this.balloonBottom.empty();
    this.balloonBottom.show();
    this.selectedOption = 0;
    this.responseOptions = Object.entries(options).map(([id, [text, classes]], i) => {
      const label = $('<span></span>').addClass('text');
      const element = $('<div></div>')
        .addClass('response-option')
        .addClass(classes)
        .toggleClass('selected', i === this.selectedOption)
        .append(label)
        .appendTo(this.balloonBottom.$element);

      const i18n = new I18nTextAdapter((newText) => {
        label.text(newText);
      }, this.lang, text);

      return {
        id,
        element,
        i18n,
      };
    });
  }

  setLang(lang) {
    this.lang = lang;
    this.topTitleI18n.setLang(lang);
    this.speechTopI18n.setLang(lang);
    this.responseOptions.forEach(option => option.i18n.setLang(lang));
  }

  hideSpeech() {
    this.balloonTop.hide();
  }

  hideResponseOptions() {
    this.balloonBottom.hide();
  }

  hide() {
    this.hideSpeech();
    this.hideResponseOptions();
  }

  selectResponseOption(index) {
    this.selectedOption = Math.max(Math.min(index, this.responseOptions.length - 1), 0);
    this.responseOptions.forEach((option, i) => option.element
      .toggleClass('selected', i === this.selectedOption));
  }

  selectNextResponseOption() {
    this.selectResponseOption(this.selectedOption + 1);
  }

  selectPreviousResponseOption() {
    this.selectResponseOption(this.selectedOption - 1);
  }

  getSelectedResponseId() {
    return this.responseOptions[this.selectedOption].id;
  }

  showPressToContinue() {
    this.balloonTop.showPressToContinue();
  }

  hidePressToContinue() {
    this.balloonTop.hidePressToContinue();
  }
}

module.exports = DialogueOverlay;
