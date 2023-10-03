/* globals PIXI */

class Fader {
  constructor(display) {
    this.display = display;
    this.ticker = PIXI.Ticker.shared;
    this.tickHandler = null;
  }

  destroy() {
    this.removeTickHandler();
  }

  removeTickHandler() {
    if (this.tickHandler) {
      this.ticker.remove(this.tickHandler);
      this.tickHandler = null;
    }
  }

  installTickHandler(duration, target, completeCallback = null) {
    this.removeTickHandler();
    const sign = Math.sign(target - this.display.alpha);
    this.tickHandler = (time) => {
      const deltaMS = time / PIXI.settings.TARGET_FPMS;
      this.display.alpha += (deltaMS / duration) * sign;
      if (Math.sign(target - this.display.alpha) !== sign) {
        this.display.alpha = target;
        this.removeTickHandler();
        if (completeCallback) {
          completeCallback();
        }
      }
    };

    this.ticker.add(this.tickHandler);
  }

  fadeOut(duration, completeCallback = null) {
    this.installTickHandler(duration, 0, () => {
      this.display.visible = false;
      if (completeCallback) {
        completeCallback();
      }
    });
  }

  fadeIn(duration, completeCallback = null) {
    this.display.visible = true;
    this.installTickHandler(duration, 1, completeCallback);
  }
}

module.exports = Fader;
