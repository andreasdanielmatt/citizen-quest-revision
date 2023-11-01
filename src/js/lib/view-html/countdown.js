class Countdown {
  constructor() {
    this.$element = $('<div></div>')
      .addClass('countdown');
  }

  set(remainingSeconds) {
    const timeLeft = Math.max(remainingSeconds, 0);
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
