/* globals PIXI */
require('../helpers-web/fill-with-aspect');

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
  }

  resize() {
    this.$element.fillWithAspect(PlayerApp.APP_WIDTH / PlayerApp.APP_HEIGHT);
  }
}

PlayerApp.APP_WIDTH = 1024;
PlayerApp.APP_HEIGHT = 768;

module.exports = PlayerApp;
