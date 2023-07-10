/* globals PIXI */
const Stats = require('../helpers-web/stats.js');
const TownView = require('../views/town-view');
require('../helpers-web/fill-with-aspect');
const PCView = require('../views/pc-view');
const NPCView = require('../views/npc-view');
const KeyboardInputMgr = require('../input/keyboard-input-mgr');
const GamepadInputMgr = require('../input/gamepad-input-mgr');
const MultiplexInputMgr = require('../input/multiplex-input-mgr');
const PlayerAppInputRouter = require('../input/player-app-input-router');
const PlayerCharacter = require('../model/player-character');
const DialogueOverlay = require('../dialogues/dialogue-overlay');
const DialogueSequencer = require('../dialogues/dialogue-sequencer');
const Dialogue = require('../dialogues/dialogue');
const Countdown = require('../helpers-web/countdown');

class PlayerApp {
  constructor(config, playerId) {
    this.config = config;
    this.playerId = playerId;
    this.pc = new PlayerCharacter(this.config, playerId);
    this.otherPcs = Object.fromEntries(Object.entries(this.config.players)
      .filter(([id, player]) => (player.enabled === undefined || player.enabled) && id !== playerId)
      .map(([id]) => [id, new PlayerCharacter(this.config, id)]));
    this.canControlPc = false;
    this.npcs = config.storylines.touristen.npcs;
    Object.entries(this.npcs).forEach(([id, npc]) => npc.id = id);

    this.$element = $('<div></div>')
      .addClass('player-app');

    this.$pixiWrapper = $('<div></div>')
      .addClass('pixi-wrapper')
      .appendTo(this.$element);

    this.$storylineBar = $('<div></div>')
      .addClass('storyline-bar')
      .appendTo(this.$element);

    this.$decisionLabel = $('<div></div>')
      .addClass('decision-label')
      .html(config.storylines.touristen.decision)
      .appendTo(this.$storylineBar);

    this.countdown = new Countdown(config.game.duration);
    this.countdown.$element.appendTo(this.$storylineBar);
    this.countdown.events.on('end', () => {
      this.handleStorylineEnd();
    });

    this.flags = {};
    this.dialogueOverlay = new DialogueOverlay(this.config);
    this.dialogueSequencer = new DialogueSequencer(this.dialogueOverlay);
    this.$element.append(this.dialogueOverlay.$element);

    this.showHitbox = false;
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
    this.pcView = new PCView(this.config, this.textures, this.pc, this.townView);
    this.otherPcViews = Object.fromEntries(
      Object.entries(this.otherPcs)
        .map(([id, pc]) => [id, new PCView(this.config, this.textures, pc, this.townView)])
    );
    this.npcViews = Object.values(this.npcs).map(npc => new NPCView(this.config, this.textures, npc, this.townView));

    this.townView.mainLayer.addChild(this.pcView.display);
    this.townView.bgLayer.addChild(this.pcView.hitboxDisplay);
    this.townView.mainLayer.addChild(...this.npcViews.map(npcView => npcView.display));
    if (Object.values(this.otherPcViews).length > 0) {
      this.townView.mainLayer.addChild(...Object.values(this.otherPcViews)
        .map(pcView => pcView.display));
    }

    this.stats = new Stats();
    this.$element.append(this.stats.dom);

    this.keyboardInputMgr = new KeyboardInputMgr();
    this.keyboardInputMgr.attachListeners();
    this.keyboardInputMgr.addToggle('KeyD', () => { this.stats.togglePanel(); });
    this.keyboardInputMgr.addToggle('KeyH', () => { this.toggleHitboxDisplay(); });
    this.keyboardInputMgr.addToggle('KeyX', () => { console.log(`x: ${this.pc.position.x}, y: ${this.pc.position.y}`); });

    const gamepadMapperConfig =
      this.config?.players?.[this.playerId]?.['gamepadMapping'] ?? {};
    this.gamepadInputMgr = new GamepadInputMgr(gamepadMapperConfig);
    this.gamepadInputMgr.attachListeners();

    this.multiplexInputMgr = new MultiplexInputMgr(
      this.keyboardInputMgr,
      this.gamepadInputMgr
    );
    this.multiplexInputMgr.attachListeners();

    const inputMgrs = [
      this.keyboardInputMgr,
      this.gamepadInputMgr,
      this.multiplexInputMgr, // the multiplexer must be the last one
    ];

    const inputMgr = this.multiplexInputMgr;

    this.inputRouter = new PlayerAppInputRouter(inputMgr);
    this.inputRouter.routeToPcMovement(this);

    this.pixiApp.ticker.add((time) => {
      this.stats.frameBegin();
      inputMgrs.forEach((inputMgr) => inputMgr.update());
      if (this.canControlPc) {
        const { x, y } = inputMgr.getDirection();
        this.pc.setSpeed(x * 10, y * 10);
      }
      this.pcView.animate(time);
      Object.entries(this.otherPcViews).forEach(([, pcView]) => {
        pcView.display.position = pcView.pc.position;
        pcView.display.zIndex = pcView.pc.position.y;
      });
      this.townView.mainLayer.sortChildren();

      // Set the town view's pivot so the PC is always centered on the screen,
      // but don't let the pivot go off the edge of the town
      this.townView.display.pivot.set(
        Math.max(0, Math.min(this.pcView.display.x + this.pcView.display.width / 2 - PlayerApp.APP_WIDTH / 2, this.townView.townSize.width - PlayerApp.APP_WIDTH)),
        Math.max(0, Math.min(this.pcView.display.y + this.pcView.display.height / 2 - PlayerApp.APP_HEIGHT / 2 * 1.175, this.townView.townSize.height - PlayerApp.APP_HEIGHT)),
      );
      this.stats.frameEnd();
    });

    this.countdown.start();

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
    this.$element.css('font-size', `${(this.$element.width() * PlayerApp.FONT_RATIO).toFixed(3)}px`);
  }

  enablePcControl() {
    this.canControlPc = true;
  }

  disablePcControl() {
    this.canControlPc = false;
    this.pc.setSpeed(0, 0);
  }

  getDialogue(dialogueId) {
    const items = this.config.storylines.touristen.dialogues[dialogueId];
    if (!items) throw new Error(`No dialogue found with id ${dialogueId}`);
    try {
      return Dialogue.fromJson({
        id: dialogueId,
        items,
      });
    } catch (e) {
      if(e.errors) {
        console.error(`Error parsing dialogue with id ${dialogueId}:`);
        e.errors.forEach((error) => {
          console.error(error);
        });
      }
      throw e;
    }
  }

  hasFlag(flagId) {
    return this.flags[flagId] !== undefined;
  }

  setFlag(flagId) {
    this.flags[flagId] = true;
    return true;
  }

  playDialogue(dialogue, npc = null) {
    this.inputRouter.routeToDialogueOverlay(this.dialogueOverlay, this.dialogueSequencer);
    this.dialogueSequencer.play(dialogue, {
      hasFlag: this.hasFlag.bind(this),
      setFlag: this.setFlag.bind(this),
      random: max => Math.floor(Math.random() * max),
    }, { top: npc.name });
    this.dialogueSequencer.events.once('end', () => {
      this.inputRouter.routeToPcMovement(this);
    });
  }

  getNpcsInRect(rect) {
    return this.npcViews.filter(npcView => npcView.inRect(rect))
      .map(npcView => npcView.npc);
  }

  pcAction() {
    const hitbox = this.pcView.getActionHitbox();
    const npcs = this.getNpcsInRect(hitbox);
    let closestNpc = null;
    let closestDistance = null;
    npcs.forEach((npc) => {
      const distance = Math.max(
        Math.abs(this.pc.position.x - npc.spawn.x),
        Math.abs(this.pc.position.y - npc.spawn.y)
      );
      if (closestDistance === null || distance < closestDistance) {
        closestNpc = npc;
        closestDistance = distance;
      }
    });
    if (closestNpc) {
      this.playDialogue(this.getDialogue(closestNpc.dialogue || closestNpc.id), closestNpc);
    }
    if (this.showHitbox) {
      this.pcView.showActionHitbox(hitbox);
    }
  }

  toggleHitboxDisplay() {
    this.showHitbox = !this.showHitbox;
  }

  handleStorylineEnd() {
    console.log("The story ended");
  }
}

PlayerApp.APP_WIDTH = 1024;
PlayerApp.APP_HEIGHT = 768;
PlayerApp.FONT_RATIO = 0.0175; // 1.75% of the width of the app

module.exports = PlayerApp;
