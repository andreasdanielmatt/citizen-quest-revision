/* eslint-disable no-console */
/* globals PIXI */
const PlayerAppStates = require('./player-app-states/states');
const getHandler = require('./player-app-states/get-handler');
const Stats = require('../helpers-web/stats/stats');
const GameView = require('../views/game-view');
require('../helpers-web/fill-with-aspect');
const KeyboardInputMgr = require('../input/keyboard-input-mgr');
const GamepadInputMgr = require('../input/gamepad-input-mgr');
const MultiplexInputMgr = require('../input/multiplex-input-mgr');
const PlayerAppInputRouter = require('../input/player-app-input-router');
const Character = require('../model/character');
const FlagStore = require('../dialogues/flag-store');
const QuestTracker = require('../model/quest-tracker');
const QuestOverlay = require('../ui/quest-overlay');
const DialogueOverlay = require('../dialogues/dialogue-overlay');
const DialogueSequencer = require('../dialogues/dialogue-sequencer');
const Countdown = require('../helpers-web/countdown');
const DecisionScreen = require('../ui/decision-screen');
const ScoringOverlay = require('../ui/scoring-overlay');
const { I18nTextAdapter } = require('../helpers/i18n');
const readEnding = require('../dialogues/ending-reader');
const TitleOverlay = require('../ui/title-overlay');
const TextScreen = require('../ui/text-screen');
const IntroScreen = require('../ui/intro-screen');

class PlayerApp {
  constructor(config, textures, playerId) {
    this.config = config;
    this.textures = textures;
    this.lang = config.game.defaultLanguage;
    this.playerId = playerId;

    // Game logic
    this.storylineId = null;
    this.flags = new FlagStore();

    this.questTracker = new QuestTracker(config, this.flags);

    this.pc = null;
    this.canControlPc = false;
    this.remotePcs = {};

    this.npcMoodsVisible = false;

    this.stateHandler = null;
    this.gameServerController = null;

    // HTML elements
    this.$element = $('<div></div>')
      .addClass('player-app')
      .addClass(`player-${playerId}`);

    this.$pixiWrapper = $('<div></div>')
      .addClass('pixi-wrapper')
      .appendTo(this.$element);

    this.$storylineBar = $('<div></div>')
      .addClass('storyline-bar')
      .appendTo(this.$element)
      .hide();

    this.$decisionLabel = $('<div></div>')
      .addClass('decision-label')
      .appendTo(this.$storylineBar);

    this.decisionLabelI18n = new I18nTextAdapter((text) => {
      this.$decisionLabel.html(text);
    }, this.lang);

    this.introScreen = null;
    this.endingScreen = null;

    this.countdown = new Countdown(config.game.duration);
    this.countdown.$element.appendTo(this.$element);
    this.countdown.hide();
    this.countdown.events.on('end', () => {
      this.gameServerController.roundEnd();
    });

    this.questOverlay = new QuestOverlay(this.config, this.lang, this.questTracker);
    this.$element.append(this.questOverlay.$element);

    this.textScreen = new TextScreen(this.config, this.lang);
    this.$element.append(this.textScreen.$element);

    this.dialogueOverlay = new DialogueOverlay(this.config, this.lang);
    this.dialogueSequencer = new DialogueSequencer(this.dialogueOverlay);
    this.$element.append(this.dialogueOverlay.$element);

    this.scoringOverlay = new ScoringOverlay(this.config);
    this.$element.append(this.scoringOverlay.$element);

    this.titleOverlay = new TitleOverlay(this.config, this.lang);
    this.$element.append(this.titleOverlay.$element);
    this.titleOverlay.show();

    this.stats = new Stats();
    this.$element.append(this.stats.dom);

    // Temporary scoring manager
    this.seenFlags = {};
    this.flags.events.on('flag', (flagId, value, oldValue, setter) => {
      if (this.seenFlags[flagId]) {
        return;
      }
      this.seenFlags[flagId] = true;
      if (flagId.startsWith('pnt.') && setter !== 'remote') {
        const flagParts = flagId.split('.');
        const category = flagParts[1];
        if (category) {
          this.scoringOverlay.show(category);
        }
      }
    });

    const width = PlayerApp.APP_WIDTH;
    const height = PlayerApp.APP_HEIGHT;

    // PIXI
    this.pixiApp = new PIXI.Application({
      // todo: get these from config or constants
      width,
      height,
      backgroundColor: 0xffffff,
    });
    this.$pixiWrapper.append(this.pixiApp.view);

    this.gameView = new GameView(config, textures, this.pixiApp, width, height);
    this.pixiApp.stage.addChild(this.gameView.getDisplay());

    this.inputMgr = this.createInputMgr();
    this.inputRouter = new PlayerAppInputRouter(this.inputMgr);

    // Game loop
    this.pixiApp.ticker.add((time) => {
      this.stats.frameBegin();
      this.inputMgr.update();
      if (this.canControlPc && this.pc) {
        const { x, y } = this.inputMgr.getDirection();
        this.pc.setSpeed(x * 10, y * 10);
      }

      this.gameView.animate(time);

      this.stats.frameEnd();
    });

    this.questTracker.events.on('storylineChanged', (storylineId) => {
      this.gameView.removeAllNpcs();
      const storyline = this.config?.storylines?.[storylineId];
      if (storyline) {
        Object.entries(storyline.npcs).forEach(([id, props]) => {
          this.gameView.addNpc(new Character(id, props));
        });
        this.updateNpcMoods();
        this.gameView.resetDroneTargets();
        this.decisionLabelI18n.setText(storyline.decision || '');
      }
    });

    this.questTracker.events.on('questActive', () => {
      this.updateNpcMoods();
    });
    this.questTracker.events.on('questDone', () => {
      this.updateNpcMoods();
    });
    this.questTracker.events.on('stageChanged', () => {
      this.gameView.updateTargetArrow(this.questTracker.getActiveStage()?.target);
    });
    this.questTracker.events.on('noQuest', () => {
      this.gameView.updateTargetArrow(this.questTracker.getActiveStage()?.target);
    });
  }

  createInputMgr() {
    const keyboardInputMgr = new KeyboardInputMgr();
    keyboardInputMgr.attachListeners();
    keyboardInputMgr.addToggle('KeyE', () => {
      this.gameServerController.roundEnd();
    });
    keyboardInputMgr.addToggle('KeyF', () => {
      console.log(this.flags.dump());
    });
    keyboardInputMgr.addToggle('KeyD', () => {
      this.stats.togglePanel();
    });
    keyboardInputMgr.addToggle('KeyH', () => {
      this.gameView.toggleHitboxDisplay();
    });
    keyboardInputMgr.addToggle('KeyX', () => {
      if (this.pc) {
        console.log(`x: ${this.pc.position.x}, y: ${this.pc.position.y}`);
      } else {
        console.log('No PC');
      }
    });

    const gamepadMapperConfig = this.config?.players?.[this.playerId]?.gamepadMapping ?? {};
    const gamepadInputMgr = new GamepadInputMgr(gamepadMapperConfig);
    gamepadInputMgr.attachListeners();

    const multiplexInputMgr = new MultiplexInputMgr(
      keyboardInputMgr,
      gamepadInputMgr
    );
    multiplexInputMgr.attachListeners();

    const inputMgr = multiplexInputMgr;
    inputMgr.events.on('lang', () => {
      this.toggleLanguage();
    });

    return inputMgr;
  }

  setGameServerController(gameServerController) {
    this.gameServerController = gameServerController;
  }

  setStoryline(storylineId) {
    this.storylineId = storylineId;
    this.resetGameState();
  }

  resetGameState() {
    this.setState(PlayerAppStates.IDLE);
    this.clearFlags();
    this.questTracker.setActiveStoryline(this.storylineId);
  }

  getState() {
    return (this.stateHandler && this.stateHandler.state) || null;
  }

  setState(state) {
    // Check if the state is in PlayerApp.States
    if (Object.values(PlayerAppStates).indexOf(state) === -1) {
      throw new Error(`Error: Attempting to set invalid state ${state}`);
    }

    if (this.stateHandler && this.stateHandler.state === state) {
      return;
    }

    const fromState = this.getState();
    const newHandler = getHandler(this, state);

    if (this.stateHandler) {
      this.stateHandler.onExit(state);
    }
    this.stateHandler = newHandler;
    if (this.stateHandler) {
      this.stateHandler.onEnter(fromState);
    }
  }

  setLanguage(lang) {
    this.lang = lang;
    this.titleOverlay.setLang(this.lang);
    this.dialogueOverlay.setLang(this.lang);
    this.textScreen.setLang(this.lang);
    this.questOverlay.setLang(this.lang);
    this.decisionLabelI18n.setLang(this.lang);
    if (this.introScreen) {
      this.introScreen.setLang(this.lang);
    }
    if (this.endingScreen) {
      this.endingScreen.setLang(this.lang);
    }
  }

  toggleLanguage() {
    const langIndex = this.config.game.languages.indexOf(this.lang);
    if (langIndex === this.config.game.languages.length - 1) {
      this.setLanguage(this.config.game.languages[0]);
    } else {
      this.setLanguage(this.config.game.languages[langIndex + 1]);
    }
  }

  resize() {
    this.$element.fillWithAspect(PlayerApp.APP_WIDTH / PlayerApp.APP_HEIGHT);
    this.$element.css('font-size', `${(this.$element.width() * PlayerApp.FONT_RATIO).toFixed(3)}px`);
  }

  addPc() {
    this.pc = new Character(this.playerId, this.config.players[this.playerId]);
    this.gameView.addPc(this.pc);
    this.gameView.cameraFollowPc();
  }

  removePc() {
    this.gameView.removePc();
    this.pc = null;
  }

  enablePcControl() {
    this.canControlPc = true;
  }

  disablePcControl() {
    this.canControlPc = false;
    if (this.pc) {
      this.pc.setSpeed(0, 0);
    }
  }

  getDialogueContext() {
    return {
      flags: this.flags,
      random: (max) => Math.floor(Math.random() * max),
    };
  }

  clearFlags() {
    this.flags.clear();
    this.seenFlags = {};
  }

  playDialogue(dialogue, npc = null) {
    this.gameView.hideDistractions();
    this.inputRouter.routeToDialogueOverlay(this.dialogueOverlay, this.dialogueSequencer);
    const title = npc ? npc.name : null;
    this.dialogueSequencer.play(dialogue, this.getDialogueContext(), { top: title });
    this.dialogueSequencer.events.once('end', () => {
      this.inputRouter.routeToPcMovement(this);
      this.gameView.showDistractions();
    });
  }

  pcAction() {
    const pcView = this.gameView.getPcView();
    if (!pcView) {
      return;
    }
    this.gameView.handlePcAction();
    const hitbox = pcView.getActionHitbox();
    const npcs = this.gameView.getNpcViewsInRect(hitbox).map((view) => view.character);
    let closestNpc = null;
    let closestDistance = null;
    npcs.forEach((npc) => {
      const distance = Math.max(
        Math.abs(this.pc.position.x - npc.position.x),
        Math.abs(this.pc.position.y - npc.position.y)
      );
      if (closestDistance === null || distance < closestDistance) {
        closestNpc = npc;
        closestDistance = distance;
      }
    });
    if (closestNpc) {
      this.playDialogue(this.questTracker.getNpcDialogue(closestNpc.id), closestNpc);
    }
  }

  menuAction() {
    this.stateHandler.onAction();
  }

  playerStart() {
    if (this.gameServerController) {
      this.gameServerController.playerStart();
    }
  }

  updateNpcMoods() {
    const npcsWithQuests = this.questTracker.getNpcsWithQuests();
    this.gameView.getAllNpcViews().forEach((npcView) => {
      if (this.npcMoodsVisible && Object.keys(npcsWithQuests).includes(npcView.character.id)) {
        npcView.showMoodBalloon(npcsWithQuests[npcView.character.id]);
      } else {
        npcView.hideMoodBalloon();
      }
    });
  }

  hideNpcMoods() {
    this.npcMoodsVisible = false;
    this.updateNpcMoods();
  }

  showNpcMoods() {
    this.npcMoodsVisible = true;
    this.updateNpcMoods();
  }

  showDefaultPrompt() {
    this.questOverlay.showDefaultPrompt();
  }

  showIntroScreen() {
    this.hideIntroScreen();
    const introText = this.questTracker.activeStoryline.prompt;
    this.introScreen = new IntroScreen(this.config, this.lang);
    this.$element.append(this.introScreen.$element);
    this.introScreen.showIntro(introText);
  }

  hideIntroScreen() {
    if (this.introScreen) {
      this.introScreen.$element.remove();
      this.introScreen = null;
    }
  }

  handleEnding() {
    const [endingText, classes] = readEnding(
      this.questTracker.getEndingDialogue(),
      this.getDialogueContext()
    );

    this.endingScreen = new DecisionScreen(this.config, this.lang);
    this.$element.append(this.endingScreen.$element);
    this.endingScreen.showDecision(endingText, classes);
  }

  hideEndingScreen() {
    if (this.endingScreen) {
      this.endingScreen.$element.remove();
      this.endingScreen = null;
    }
  }

  showTextScreen(text) {
    this.textScreen.setText(text);
    this.textScreen.show();
  }

  hideTextScreen() {
    this.textScreen.hide();
    this.textScreen.setText('');
  }
}

PlayerApp.APP_WIDTH = 1024;
PlayerApp.APP_HEIGHT = 768;
PlayerApp.FONT_RATIO = 0.0175; // 1.75% of the width of the app

module.exports = PlayerApp;
