const EventEmitter = require('events');

class Countdown {
  constructor(seconds) {
    this.seconds = seconds;
    this.events = new EventEmitter();
    this.$element = $('<div></div>')
      .addClass('countdown');
    this.update();
  }

  start() {
    if (this.seconds > 0) {
      this.interval = setInterval(() => {
        this.seconds -= 1;
        this.update();
        if (this.seconds <= 0) {
          this.onEnd();
        }
      }, 1000);
    }
  }

  forceEnd() {
    this.seconds = 0;
    this.update();
    this.onEnd();
  }

  onEnd() {
    clearInterval(this.interval);
    this.events.emit('end');
  }

  update() {
    const timeLeft = Math.max(this.seconds, 0);
    const secondsLeft = timeLeft % 60;
    const minutes = Math.floor(timeLeft / 60);
    this.$element.html(`${minutes}:${secondsLeft < 10 ? '0' : ''}${secondsLeft}`);
  }
}

module.exports = Countdown;
