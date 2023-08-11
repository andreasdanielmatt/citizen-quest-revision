class DialogueBalloon {
  constructor(classes) {
    this.$element = $('<div></div>')
      .addClass('balloon')
      .addClass(classes);
    this.$styling = $('<div></div>')
      .appendTo(this.$element);
    this.$title = $('<div></div>')
      .addClass('title')
      .appendTo(this.$styling);
  }

  show() {
    this.cancelHide();
    this.$element.addClass('visible');
  }

  setTitle(title = null) {
    if (title === null) {
      this.$title.hide();
    } else {
      this.$title.html(title);
    }
  }

  setClasses(classes) {
    this.removeClasses();
    this.$styling.addClass(classes);
  }

  removeClasses() {
    this.$styling.removeClass();
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
