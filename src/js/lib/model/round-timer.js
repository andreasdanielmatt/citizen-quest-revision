const EventEmitter = require('events');

class RoundTimer {
  constructor(seconds) {
    this.durationSecs = seconds;
    this.remainingSecs = 0;
    this.events = new EventEmitter();
    this.ended = false;
  }

  setDuration(seconds) {
    this.durationSecs = seconds;
  }

  setRemainingTime(seconds) {
    this.remainingSecs = seconds;
    this.events.emit('update', this.remainingSecs);
    if (this.remainingSecs <= 0) {
      this.onEnd();
    }
  }

  getRemainingTime() {
    return this.remainingSecs;
  }

  start() {
    this.ended = false;
    this.setRemainingTime(this.durationSecs);
    if (this.getRemainingTime() > 0) {
      this.interval = setInterval(() => {
        this.setRemainingTime(this.getRemainingTime() - 1);
      }, 1000);
    }
  }

  forceEnd() {
    this.setRemainingTime(0);
  }

  onEnd() {
    clearInterval(this.interval);
    if (!this.ended) {
      this.ended = true;
      this.events.emit('end');
    }
  }
}

module.exports = RoundTimer;
