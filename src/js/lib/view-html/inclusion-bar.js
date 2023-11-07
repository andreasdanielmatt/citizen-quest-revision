class InclusionBar {
  constructor(config) {
    this.config = config;
    this.$element = $('<div></div>')
      .addClass('inclusion-bar')
      .append($('<div></div>')
        .addClass('title')
        .append($('<div></div>')
          .addClass(['text', 'de'])
          .html(config.i18n.ui.inclusionBarTitle.de))
        .append($('<div></div>')
          .addClass(['text', 'en'])
          .html(config.i18n.ui.inclusionBarTitle.en)));
    this.included = [];
    window.inclusion = this;
  }

  clear() {
    this.included.forEach(($e) => $e.remove());
    this.included = [];
  }

  add(type) {
    const $e = $('<div></div>')
      .addClass('inclusion')
      .addClass(`inclusion-${type}`)
      .append($('<div></div>')
        .addClass('inclusion-image-container')
        .append($('<img></img>')
          .addClass('inclusion-image')
          .attr('src', `/static/inclusion/${type}.svg`)));
    this.$element.append($e);
    this.included.push($e);
  }
}

module.exports = InclusionBar;
