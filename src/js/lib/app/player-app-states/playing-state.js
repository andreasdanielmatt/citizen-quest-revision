const PlayerAppState = require('./player-app-state');
const { PLAYING } = require('./states');

class PlayerAppPlayingState extends PlayerAppState {
  constructor(playerApp) {
    super(playerApp);
    this.state = PLAYING;
  }

  onEnter() {
    this.playerApp.gameView.cameraFollowPc();
    this.playerApp.inputRouter.routeToMenus(this.playerApp);
    this.playerApp.countdown.show();
    this.playerApp.countdown.start();
    this.playerApp.showNpcMoods();
    this.playerApp.showDefaultPrompt();
    this.playerApp.showIntroScreen();
  }

  onAction() {
    if (this.playerApp.introScreen && this.playerApp.introScreen.revealStarted) {
      if (!this.playerApp.introScreen.isTextRevealed()) {
        this.playerApp.introScreen.revealText();
      } else {
        this.playerApp.hideIntroScreen();
        this.playerApp.inputRouter.routeToPcMovement(this.playerApp);
      }
    }
  }

  onExit() {
    this.playerApp.dialogueSequencer.terminate();
    this.playerApp.questOverlay.hide();
    this.playerApp.countdown.hide();
    this.playerApp.hideNpcMoods();
    this.playerApp.hideIntroScreen();
  }
}

module.exports = PlayerAppPlayingState;
