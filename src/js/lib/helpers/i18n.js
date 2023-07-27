function getText(text, lang = null) {
  if (lang !== null && typeof text === 'object') {
    return text[lang];
  }
  return text;
}

class I18nTextAdapter {
  constructor(setTextCallback, lang, text = null) {
    this.setTextCallback = setTextCallback;
    this.currentLang = lang;
    this.currentText = text;

    this.update();
  }

  update() {
    if (this.currentText !== null) {
      this.setTextCallback(getText(this.currentText, this.currentLang));
    }
  }

  setText(text, forceUpdate = false) {
    if (forceUpdate || JSON.stringify(text) !== JSON.stringify(this.currentText)) {
      this.currentText = text;
      this.update();
    }
  }

  setLang(lang) {
    if (lang !== this.currentLang) {
      this.currentLang = lang;
      this.update();
    }
  }
}

module.exports = {
  getText,
  I18nTextAdapter,
};
