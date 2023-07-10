const SpeechText = require('../dialogues/speech-text');

class DecisionScreen {
  constructor() {
    this.$element = $('<div></div>')
      .addClass('decision-screen-wrapper');

    this.$screen = $('<div></div>')
      .addClass('decision-screen')
      .appendTo(this.$element);

    this.$title = $('<h1></h1>')
      .addClass('decision-screen-title')
      .text('Eine Entscheidung wurde getroffen…')
      .appendTo(this.$screen);

    this.$icon = $('<div></div>')
      .addClass('decision-screen-icon')
      .appendTo(this.$screen);

    this.$text = $('<div></div>')
      .addClass('decision-screen-text')
      .appendTo(this.$screen);

    this.speech = new SpeechText();
    this.$text.append(this.speech.$element);
  }

  showDecision(lines, icon) {
    this.$icon.addClass(icon);
    this.$element.addClass('visible');
    setTimeout(() => {
      this.speech.showText(lines.map((line) => ({ string: line })));
    }, 2000);
  }
}

module.exports = DecisionScreen;
