/* globals PIXI */

require('../helpers-web/fill-with-aspect');
const Stats = require('../helpers-web/stats');
const TownView = require('../views/town-view');
const PCView = require('../views/pc-view');
const CharacterView = require('../views/character-view');
const Character = require('../model/character');
const KeyboardInputMgr = require('../input/keyboard-input-mgr');

class MapApp {
  constructor(config) {
    this.config = config;

    this.$element = $('<div></div>')
      .addClass('map-app');

    this.$pixiWrapper = $('<div></div>')
      .addClass('pixi-wrapper')
      .appendTo(this.$element);

    this.pcs = Object.fromEntries(Object.entries(this.config.players)
      .filter(([, player]) => (player.enabled === undefined || player.enabled))
      .map(([id]) => [id, new Character(id, this.config.players[id])]));
    this.npcs = Object.entries(config.storylines.touristen.npcs)
      .map(([id, props]) => new Character(id, props));
  }

  async init() {
    this.pixiApp = new PIXI.Application({
      width: MapApp.APP_WIDTH,
      height: MapApp.APP_HEIGHT,
      backgroundColor: 0xffffff,
    });
    this.$pixiWrapper.append(this.pixiApp.view);

    await this.loadTextures();

    this.camera = new PIXI.Container();
    this.pixiApp.stage.addChild(this.camera);
    this.townView = new TownView(this.config, this.textures);
    this.camera.addChild(this.townView.display);
    this.pcViews = Object.fromEntries(
      Object.entries(this.pcs)
        .map(([id, pc]) => [id, new PCView(this.config, this.textures, pc, this.townView)])
    );
    this.npcViews = Object.values(this.npcs)
      .map(npc => new CharacterView(this.config, this.textures, npc, this.townView));

    if (Object.values(this.pcViews).length > 0) {
      this.townView.mainLayer.addChild(...Object.values(this.pcViews)
        .map(pcView => pcView.display));
    }
    this.townView.mainLayer.addChild(...this.npcViews.map(npcView => npcView.display));
    this.camera.width = MapApp.APP_WIDTH;
    this.camera.height = MapApp.APP_HEIGHT;

    this.stats = new Stats();
    this.$element.append(this.stats.dom);

    this.keyboardInputMgr = new KeyboardInputMgr();
    this.keyboardInputMgr.attachListeners();
    this.keyboardInputMgr.addToggle('KeyD', () => { this.stats.togglePanel(); });

    this.pixiApp.ticker.add((time) => {
      this.stats.frameBegin();

      Object.entries(this.pcViews).forEach(([, pcView]) => {
        pcView.display.position = pcView.character.position;
        pcView.display.zIndex = pcView.character.position.y;
        pcView.animate(time);
      });
      this.townView.mainLayer.sortChildren();

      this.stats.frameEnd();
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
    this.$element.fillWithAspect(MapApp.APP_WIDTH / MapApp.APP_HEIGHT);
    this.$element.css('font-size', `${(this.$element.width() * MapApp.FONT_RATIO).toFixed(3)}px`);
  }
}

MapApp.APP_WIDTH = 1920;
MapApp.APP_HEIGHT = 1080;
MapApp.FONT_RATIO = 0.0175; // 1.75% of the width of the app

module.exports = MapApp;
