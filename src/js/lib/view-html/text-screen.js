const { I18nTextAdapter } = require('../helpers/i18n');

class TextScreen {
  constructor(config, lang) {
    this.config = config;
    this.lang = lang;

    this.$element = $('<div></div>')
      .addClass('text-screen');
    this.$textWrapper = $('<div></div>')
      .addClass('text-wrapper')
      .appendTo(this.$element);
    this.$text = $('<div></div>')
      .addClass('text')
      .appendTo(this.$textWrapper);

    this.textI18n = new I18nTextAdapter((text) => {
      this.$text.text(text);
    }, this.lang);
  }

  setText(text) {
    this.textI18n.setText(text);
  }

  setLang(lang) {
    this.lang = lang;
    this.textI18n.setLang(lang);
  }

  show() {
    this.$element.addClass('visible');
  }

  hide() {
    this.$element.removeClass('visible');
  }
}

module.exports = TextScreen;
