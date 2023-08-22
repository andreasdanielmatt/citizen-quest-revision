const EventEmitter = require('events');

class Countdown {
  constructor(seconds) {
    this.seconds = seconds;
    this.remainingSeconds = 0;
    this.events = new EventEmitter();
    this.$element = $('<div></div>')
      .addClass('countdown');
    this.update();
  }

  setSeconds(seconds) {
    this.seconds = seconds;
  }

  setRemainingSeconds(seconds) {
    this.remainingSeconds = seconds;
  }

  start() {
    this.remainingSeconds = this.seconds;
    this.update();
    if (this.remainingSeconds > 0) {
      this.interval = setInterval(() => {
        this.remainingSeconds -= 1;
        this.update();
        if (this.remainingSeconds <= 0) {
          this.onEnd();
        }
      }, 1000);
    }
  }

  forceEnd() {
    this.remainingSeconds = 0;
    this.update();
    this.onEnd();
  }

  onEnd() {
    clearInterval(this.interval);
    this.events.emit('end');
  }

  update() {
    const timeLeft = Math.max(this.remainingSeconds, 0);
    const secondsLeft = timeLeft % 60;
    const minutes = Math.floor(timeLeft / 60);
    this.$element.html(`${minutes}:${secondsLeft < 10 ? '0' : ''}${secondsLeft}`);
  }

  hide() {
    this.$element.hide();
  }

  show() {
    this.$element.show();
  }
}

module.exports = Countdown;
