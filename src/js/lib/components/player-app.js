/* globals PIXI */
const TownView = require('../views/town-view');
require('../helpers-web/fill-with-aspect');
const PCView = require('../views/pc-view');
const KeyboardInputMgr = require('../input/keyboard-input-mgr');

class PlayerApp {
  constructor(config) {
    this.config = config;
    this.$element = $('<div></div>')
      .addClass('player-app');

    this.$pixiWrapper = $('<div></div>')
      .addClass('pixi-wrapper')
      .appendTo(this.$element);

    this.pixiApp = new PIXI.Application({
      // todo: get these from config or constants
      width: PlayerApp.APP_WIDTH,
      height: PlayerApp.APP_HEIGHT,
      backgroundColor: 0xffffff,
    });
    this.$pixiWrapper.append(this.pixiApp.view);

    this.townView = new TownView(this.config);
    this.pixiApp.stage.addChild(this.townView.display);
    this.pcView = new PCView(this.config);
    this.townView.display.addChild(this.pcView.display);

    this.keyboardInputMgr = new KeyboardInputMgr();
    this.keyboardInputMgr.addListeners();

    window.townView = this.townView.display;
    window.townOffset = { x: 0, y: 0};

    this.pixiApp.ticker.add((time) => {
      const { x, y } = this.keyboardInputMgr.getDirection();
      this.pcView.speed.x = x * 10;
      this.pcView.speed.y = y * 10;
      this.pcView.animate(time);

      // Set the town view's pivot so the PC is always centered on the screen,
      // but don't let the pivot go off the edge of the town
      this.townView.display.pivot.set(
        Math.max(0, Math.min(this.pcView.display.x - PlayerApp.APP_WIDTH / 2, this.townView.townSize.width - PlayerApp.APP_WIDTH)),
        Math.max(0, Math.min(this.pcView.display.y - PlayerApp.APP_HEIGHT / 2, this.townView.townSize.height - PlayerApp.APP_HEIGHT)),
      );
    });
  }

  resize() {
    this.$element.fillWithAspect(PlayerApp.APP_WIDTH / PlayerApp.APP_HEIGHT);
  }
}

PlayerApp.APP_WIDTH = 1024;
PlayerApp.APP_HEIGHT = 768;

module.exports = PlayerApp;
