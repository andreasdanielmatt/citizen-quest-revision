/* globals PIXI */
const Stats = require('stats.js');
const TownView = require('../views/town-view');
require('../helpers-web/fill-with-aspect');
const PCView = require('../views/pc-view');
const KeyboardInputMgr = require('../input/keyboard-input-mgr');
const PlayerCharacter = require('../model/player-character');

class PlayerApp {
  constructor(config, playerId) {
    this.config = config;
    this.playerId = playerId;
    this.pc = new PlayerCharacter(this.config, playerId);
    this.otherPcs = Object.fromEntries(Object.entries(this.config.players)
      .filter(([id, player]) => (player.enabled === undefined || player.enabled) && id !== playerId)
      .map(([id]) => [id, new PlayerCharacter(this.config, id)]));

    this.$element = $('<div></div>')
      .addClass('player-app');

    this.$pixiWrapper = $('<div></div>')
      .addClass('pixi-wrapper')
      .appendTo(this.$element);
  }

  async init() {
    this.pixiApp = new PIXI.Application({
      // todo: get these from config or constants
      width: PlayerApp.APP_WIDTH,
      height: PlayerApp.APP_HEIGHT,
      backgroundColor: 0xffffff,
    });
    this.$pixiWrapper.append(this.pixiApp.view);

    await this.loadTextures();

    this.townView = new TownView(this.config, this.textures);
    this.pixiApp.stage.addChild(this.townView.display);
    this.pcView = new PCView(this.config, this.pc, this.townView);
    this.otherPcViews = Object.fromEntries(
      Object.entries(this.otherPcs)
        .map(([id, pc]) => [id, new PCView(this.config, pc, this.townView)])
    );

    this.townView.display.addChild(this.pcView.display);
    if (Object.values(this.otherPcViews).length > 0) {
      this.townView.display.addChild(...Object.values(this.otherPcViews)
        .map(pcView => pcView.display));
    }

    this.stats = Stats();
    this.statsVisible = null;
    this.stats.showPanel(null);
    this.statsCount = 3;
    this.$element.append(this.stats.dom);

    this.keyboardInputMgr = new KeyboardInputMgr();
    this.keyboardInputMgr.addListeners();
    this.keyboardInputMgr.addToggle('KeyD', () => { this.toggleStats(); });

    this.pixiApp.ticker.add((time) => {
      this.stats.begin();
      const { x, y } = this.keyboardInputMgr.getDirection();
      this.pc.setSpeed(x * 10, y * 10);
      this.pcView.animate(time);
      Object.entries(this.otherPcViews).forEach(([, pcView]) => {
        pcView.display.position = pcView.pc.position;
      });

      // Set the town view's pivot so the PC is always centered on the screen,
      // but don't let the pivot go off the edge of the town
      this.townView.display.pivot.set(
        Math.max(0, Math.min(this.pcView.display.x - PlayerApp.APP_WIDTH / 2, this.townView.townSize.width - PlayerApp.APP_WIDTH)),
        Math.max(0, Math.min(this.pcView.display.y - PlayerApp.APP_HEIGHT / 2, this.townView.townSize.height - PlayerApp.APP_HEIGHT)),
      );
      this.stats.end();
    });

    return this;
  }

  async loadTextures() {
    PIXI.Assets.init({
      basePath: './static/textures',
      manifest: this.config.textures,
    });

    this.textures = await PIXI.Assets.loadBundle('town-view');
  }

  resize() {
    this.$element.fillWithAspect(PlayerApp.APP_WIDTH / PlayerApp.APP_HEIGHT);
  }

  addStats(panel) {
    this.stats.addPanel(panel);
    this.statsCount += 1;
    this.stats.showPanel(null);
  }

  toggleStats() {
    if (this.statsVisible === null) {
      this.statsVisible = 0;
    } else {
      this.statsVisible += 1;
      if (this.statsVisible >= this.statsCount) {
        this.statsVisible = null;
      }
    }
    this.stats.showPanel(this.statsVisible);
  }

  showStats(id) {
    this.statsVisible = id;
    this.stats.showPanel(id);
  }
}

PlayerApp.APP_WIDTH = 1024;
PlayerApp.APP_HEIGHT = 768;

module.exports = PlayerApp;
