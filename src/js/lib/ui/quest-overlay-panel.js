const { I18nTextAdapter } = require('../helpers/i18n');

class QuestOverlayPanel {
  constructor(config, lang) {
    this.config = config;
    this.lang = lang;

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

  isVisible() {
    return this.$element.hasClass('visible');
  }

  setText(text) {
    this.promptI18n.setText(text);
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

  setCounter(value) {
    this.$counter.children().each((index, element) => {
      $(element).toggleClass('active', index < value);
    });
  }
}

module.exports = QuestOverlayPanel;
