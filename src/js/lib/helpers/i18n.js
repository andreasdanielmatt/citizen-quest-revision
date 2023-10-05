function getText(text, lang = null) {
  if (lang !== null && typeof text === 'object') {
    return text[lang];
  }
  return text;
}

/**
 * Given an array of texts (objects with language keys), merge them into a single object with the
 * same keys. If any text is a simple string instead of an object, it is merged into all languages.
 * If all texts are strings, a single string is returned.
 *
 * @param {Array} texts
 * @param {Object} userOptions
 *   - {string} separator - If set, the texts are joined with this separator
 *   - {string} prefix - If set, the texts are prefixed with this string
 *   - {string} suffix - If set, the texts are suffixed with this string
 * @returns {string|Object}
 */
function mergeTexts(texts, userOptions = {}) {
  const result = {};
  const defaultOptions = {
    separator: '',
    prefix: '',
    suffix: '',
  };
  const options = { ...defaultOptions, ...userOptions };
  let allStrings = true;
  texts.forEach((text) => {
    if (typeof text === 'object') {
      allStrings = false;
      Object.keys(text).forEach((lang) => {
        result[lang] = '';
      });
    }
  });

  if (allStrings) {
    return texts.map((t) => `${options.prefix}${t}${options.suffix}`).join(options.separator);
  }

  texts.forEach((text, i) => {
    let part;
    Object.keys(result).forEach((lang) => {
      if (typeof text === 'string') {
        part = text;
      } else if (text[lang] !== undefined) {
        part = text[lang];
      } else {
        part = '';
      }
      result[lang] += `${options.prefix}${part}${options.suffix}`;
      if (i < texts.length - 1) {
        result[lang] += options.separator;
      }
    });
  });

  return result;
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
  mergeTexts,
  I18nTextAdapter,
};
