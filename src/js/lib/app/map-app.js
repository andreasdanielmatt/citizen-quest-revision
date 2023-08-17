/* globals PIXI */

require('../helpers-web/fill-with-aspect');
const Stats = require('../helpers-web/stats');
const TownView = require('../views/town-view');
const PCView = require('../views/pc-view');
const CharacterView = require('../views/character-view');
const Character = require('../model/character');
const KeyboardInputMgr = require('../input/keyboard-input-mgr');
const MapMarker = require('../views/map-marker');
const FlagStore = require('../dialogues/flag-store');
const QuestTracker = require('../model/quest-tracker');

class MapApp {
  constructor(config) {
    this.config = config;

    this.$element = $('<div></div>')
      .addClass('map-app');

    this.$pixiWrapper = $('<div></div>')
      .addClass('pixi-wrapper')
      .appendTo(this.$element);

    this.flags = new FlagStore();
    window.flags = this.flags;
    this.questTracker = new QuestTracker(config, this.flags);
    this.questMarkers = {};
    window.questMarkers = this.questMarkers;

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
        .map(([id, pc]) => {
          const pcView = new PCView(this.config, this.textures, pc, this.townView);
          this.addMarker(pcView, `player-${pc.id}`);
          return [id, pcView];
        })
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

    this.updateQuestMarkers();
    this.questTracker.events.on('questActive', (questId) => {
      this.updateQuestMarkers();
    });
    this.questTracker.events.on('questDone', (questId) => {
      this.updateQuestMarkers();
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

  addMarker(character, icon) {
    const marker = new MapMarker(
      this.textures['map-markers'].textures['pin-marker'],
      this.textures.icons.textures[`icon-${icon}`], { x: 0.5, y: 1 }
    );
    marker.setScale(this.townView.display.width / MapApp.APP_WIDTH);
    character.addAttachment('map-marker', marker);
    character.display.addChild(marker.display);
    marker.setPosition(0, -character.display.height);
    marker.popper.show();
  }

  removeMarker(character, onComplete = () => {}) {
    const marker = character.getAttachment('map-marker');
    if (marker) {
      marker.hide(() => {
        character.removeAttachment('map-marker');
        onComplete();
      });
    } else {
      onComplete();
    }
  }

  updateQuestMarkers() {
    const npcsWithQuests = this.questTracker.getNpcsWithQuests();
    this.npcViews.forEach((npcView) => {
      const npcId = npcView.character.id;
      if (Object.keys(npcsWithQuests).includes(npcId)) {
        const questIcon = npcsWithQuests[npcView.character.id];
        if (this.questMarkers[npcId] === undefined) {
          this.addMarker(npcView, questIcon);
        } else if (this.questMarkers[npcId] !== questIcon) {
          this.removeMarker(npcView, () => {
            this.addMarker(npcView, questIcon);
          });
        }
        this.questMarkers[npcId] = questIcon;
      } else if (this.questMarkers[npcId]) {
        delete this.questMarkers[npcId];
        this.removeMarker(npcView);
      }
    });
  }
}

MapApp.APP_WIDTH = 1920;
MapApp.APP_HEIGHT = 1080;
MapApp.FONT_RATIO = 0.0175; // 1.75% of the width of the app

module.exports = MapApp;
