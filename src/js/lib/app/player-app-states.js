// eslint-disable-next-line max-classes-per-file
const PlayerAppStates = {
  IDLE: 'idle',
  INTRO: 'intro',
  PLAYING: 'playing',
  ENDING: 'ending',
};

class PlayerAppState {
  constructor(playerApp) {
    this.playerApp = playerApp;
    this.state = null;
  }

  // eslint-disable-next-line class-methods-use-this,no-unused-vars
  onEnter(fromState) { }

  // eslint-disable-next-line class-methods-use-this,no-unused-vars
  onExit(toState) { }

  // eslint-disable-next-line class-methods-use-this
  onAction() { }
}

class PlayerAppIdleState extends PlayerAppState {
  constructor(playerApp) {
    super(playerApp);
    this.state = PlayerAppStates.IDLE;
  }

  onEnter() {
    this.playerApp.titleOverlay.show();
    this.playerApp.cameraFollowDrone();
    this.playerApp.inputRouter.routeToMenus(this.playerApp);
  }

  onAction() {
    this.playerApp.playerStart();
  }

  onExit() {
    this.playerApp.titleOverlay.hide();
  }
}

class PlayerAppIntroState extends PlayerAppState {
  constructor(playerApp) {
    super(playerApp);
    this.state = PlayerAppStates.INTRO;
  }

  onEnter() {
    this.playerApp.cameraFollowPc();
    this.playerApp.inputRouter.routeToMenus(this.playerApp);
  }
}

class PlayerAppPlayingState extends PlayerAppState {
  constructor(playerApp) {
    super(playerApp);
    this.state = PlayerAppStates.PLAYING;
  }

  onEnter() {
    this.playerApp.cameraFollowPc();
    this.playerApp.inputRouter.routeToPcMovement(this.playerApp);
    this.playerApp.countdown.show();
    this.playerApp.countdown.start();
    this.playerApp.showNpcMoods();
    this.playerApp.showStorylinePrompt();
  }

  onExit() {
    this.playerApp.dialogueSequencer.terminate();
    this.playerApp.questOverlay.hide();
    this.playerApp.countdown.hide();
    this.playerApp.hideNpcMoods();
  }
}

class PlayerAppEndingState extends PlayerAppState {
  constructor(playerApp) {
    super(playerApp);
    this.state = PlayerAppStates.ENDING;
  }

  showWaitingToBeginScreen() {
    this.playerApp.showTextScreen(
      this.playerApp.config.i18n.ui.waitingToBegin
    );
  }

  showWaitingToEndScreen() {
    this.playerApp.showTextScreen(
      this.playerApp.config.i18n.ui.waitingToEnd
    );
  }

  onEnter(fromState) {
    this.playerApp.cameraFollowPc();
    if (fromState !== PlayerAppStates.IDLE) {
      this.playerApp.inputRouter.routeToMenus(this.playerApp);
      this.playerApp.handleStorylineEnd();
    } else {
      this.playerApp.inputRouter.unroute();
      this.showWaitingToBeginScreen();
      this.playerApp.gameServerController.playerReady();
    }
  }

  onExit() {
    super.onExit();
    this.playerApp.hideEndingScreen();
    this.playerApp.hideTextScreen();
    this.playerApp.questTracker.reset();
    this.playerApp.clearFlags();
  }

  onAction() {
    if (this.playerApp.endingScreen && this.playerApp.endingScreen.revealStarted) {
      if (!this.playerApp.endingScreen.isTextRevealed()) {
        this.playerApp.endingScreen.revealText();
      } else {
        this.playerApp.hideEndingScreen();
        this.showWaitingToEndScreen();
        this.playerApp.gameServerController.playerReady();
      }
    }
  }
}

function getHandler(playerApp, state) {
  switch (state) {
    case PlayerAppStates.IDLE:
      return new PlayerAppIdleState(playerApp);
    case PlayerAppStates.INTRO:
      return new PlayerAppIntroState(playerApp);
    case PlayerAppStates.PLAYING:
      return new PlayerAppPlayingState(playerApp);
    case PlayerAppStates.ENDING:
      return new PlayerAppEndingState(playerApp);
    default:
      throw new Error(`Invalid state ${state}`);
  }
}

module.exports = {
  getHandler,
  PlayerAppStates,
};
