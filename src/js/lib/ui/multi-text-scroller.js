const TextScroller = require('./text-scroller');

class MultiTextScroller {
  constructor(config) {
    this.config = config;
    this.$element = $('<div></div>')
      .addClass('multi-text-scroller');
    this.scrollers = [];
    this.speed = this.config?.map?.promptScrollSpeed || 100; // px per second
  }

  destroy() {
    this.clear();
  }

  clear() {
    this.scrollers.forEach((s) => { s.$element.remove(); s.destroy(); });
    this.scrollers = [];
  }

  displayText(text) {
    this.clear();
    const texts = (typeof text === 'object')
      ? this.config.game.languages
        .map((lang) => text?.[lang])
        .filter((t) => t)
      : [text];
    texts.forEach((t) => { this.createScroller(t); });
    if (this.scrollers.length > 0) {
      this.scrollers[0].speed = this.speed;
      this.scrollers.forEach((scroller, i) => {
        if (i > 0) {
          scroller.speed = this.speed * (
            scroller.texts[0].width() / this.scrollers[0].texts[0].width()
          );
        }
      });
    }
  }

  createScroller(text) {
    const scroller = new TextScroller(this.config);
    this.$element.append(scroller.$element);
    this.scrollers.push(scroller);
    scroller.displayText(text);
    return scroller;
  }

  start() {
    this.scrollers.forEach((s) => { s.start(); });
  }

  stop() {
    this.scrollers.forEach((s) => { s.stop(); });
  }
}

module.exports = MultiTextScroller;
