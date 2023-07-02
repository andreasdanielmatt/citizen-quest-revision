class DialogueBalloon {
  constructor(classes) {
    this.$element = $('<div></div>')
      .addClass('balloon')
      .addClass(classes);
  }

  show() {
    this.cancelHide();
    this.$element.addClass('visible');
  }

  hide() {
    this.$element.addClass('fading');
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(() => {
      this.$element.removeClass('fading');
      this.$element.removeClass('visible');
      this.$element.removeClass('press-to-continue');
    }, 250);
  }

  cancelHide() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.$element.removeClass('fading');
  }

  showPressToContinue() {
    this.$element.addClass('press-to-continue');
  }

  hidePressToContinue() {
    this.$element.removeClass('press-to-continue');
  }

  empty() {
    this.$element.empty();
  }

  append(element) {
    this.$element.append(element);
  }
}

module.exports = DialogueBalloon;
