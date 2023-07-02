const EventEmitter = require('events');
const SpeechText = require('./speech-text');

class DialogueOverlay {
  constructor(config) {
    this.config = config;
    this.events = new EventEmitter();

    this.$element = $('<div></div>')
      .addClass('dialogue-overlay');

    this.$balloonTop = $('<div></div>')
      .addClass(['balloon', 'balloon-speech', 'top'])
      .appendTo(this.$element);

    this.$balloonBottom = $('<div></div>')
      .addClass(['balloon', 'bottom'])
      .appendTo(this.$element);

    this.speechTop = new SpeechText();
    this.$balloonTop.append(this.speechTop.$element);
    this.speechTop.events.on('complete', () => {
      this.events.emit('speechComplete');
    });

    this.responseOptions = [];
    this.selectedOption = 0;
  }

  play(dialogue) {

  }

  showSpeech(text) {
    this.$balloonTop.addClass('visible');
    this.speechTop.showText([{ string: text }]);
  }

  speedUpSpeech() {
    this.speechTop.speedUp();
  }

  showResponseOptions(options) {
    this.$balloonBottom.empty().addClass('visible');
    this.selectedOption = 0;
    this.responseOptions = Object.entries(options).map(([id, text], i) => ({
      id,
      text,
      element: $('<div></div>')
        .addClass('response-option')
        .toggleClass('selected', i === this.selectedOption)
        .append($('<span></span>').addClass('text').html(text))
        .appendTo(this.$balloonBottom),
    }));
  }

  hideSpeech() {
    this.$balloonTop.removeClass('visible');
    this.$balloonTop.removeClass('press-to-continue');
  }

  hideResponseOptions() {
    this.$balloonBottom.removeClass('visible');
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
    this.$balloonTop.addClass('press-to-continue');
  }
}

module.exports = DialogueOverlay;
