const PlayerAppState = require('./player-app-state');
const { PLAYING } = require('./states');

class PlayerAppPlayingState extends PlayerAppState {
  constructor(playerApp) {
    super(playerApp);
    this.state = PLAYING;
  }

  onEnter() {
    this.playerApp.gameView.cameraFollowPc();
    this.playerApp.showNpcMoods();
    this.playerApp.inputRouter.routeToMenus(this.playerApp);
    this.playerApp.roundTimer.start();
    this.playerApp.playerOverlayMgr.countdown.show();
    this.playerApp.playerOverlayMgr.showDefaultPrompt();
    const introText = this.playerApp.questTracker.activeStoryline.prompt;
    this.playerApp.playerOverlayMgr.showIntroScreen(introText);
  }

  onAction() {
    if (this.playerApp.playerOverlayMgr?.introScreen?.revealStarted) {
      if (!this.playerApp.playerOverlayMgr.introScreen.isTextRevealed()) {
        this.playerApp.playerOverlayMgr.introScreen.revealText();
      } else {
        this.playerApp.playerOverlayMgr.hideIntroScreen();
        this.playerApp.inputRouter.routeToPcMovement(this.playerApp);
      }
    }
  }

  onExit() {
    this.playerApp.dialogueSequencer.terminate();
    this.playerApp.hideNpcMoods();
    this.playerApp.playerOverlayMgr.questOverlay.hide();
    this.playerApp.playerOverlayMgr.countdown.hide();
    this.playerApp.playerOverlayMgr.hideIntroScreen();
  }
}

module.exports = PlayerAppPlayingState;
