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
    this.interval = setInterval(() => {
      this.seconds -= 1;
      this.update();
      if (this.seconds === 0) {
        this.events.emit('end');
        clearInterval(this.interval);
      }
    }, 1000);
  }

  update() {
    const minutes = Math.floor(this.seconds / 60);
    const secondsLeft = this.seconds % 60;
    const timeLeft = `${minutes}:${secondsLeft < 10 ? '0' : ''}${secondsLeft}`;
    this.$element.html(timeLeft);
  }
}

module.exports = Countdown;
