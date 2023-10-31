const PlayerAppState = require('./player-app-state');
const { ENDING, IDLE } = require('./states');

class PlayerAppEndingState extends PlayerAppState {
  constructor(playerApp) {
    super(playerApp);
    this.state = ENDING;
  }

  showWaitingToBeginScreen() {
    this.playerApp.playerOverlayMgr.showTextScreen(
      this.playerApp.config.i18n.ui.waitingToBegin
    );
  }

  showWaitingToEndScreen() {
    this.playerApp.playerOverlayMgr.showTextScreen(
      this.playerApp.config.i18n.ui.waitingToEnd
    );
  }

  onEnter(fromState) {
    this.playerApp.gameView.cameraFollowPc();
    if (fromState !== IDLE) {
      this.playerApp.inputRouter.routeToMenus(this.playerApp);
      this.playerApp.handleEnding();
    } else {
      this.playerApp.inputRouter.unroute();
      this.showWaitingToBeginScreen();
      this.playerApp.gameServerController.playerReady();
    }
  }

  onExit() {
    super.onExit();
    this.playerApp.playerOverlayMgr.hideEndingScreen();
    this.playerApp.playerOverlayMgr.hideTextScreen();
  }

  onAction() {
    if (this.playerApp.playerOverlayMgr.endingScreen
      && this.playerApp.playerOverlayMgr.endingScreen.revealStarted) {
      if (!this.playerApp.playerOverlayMgr.endingScreen.isTextRevealed()) {
        this.playerApp.playerOverlayMgr.endingScreen.revealText();
      } else {
        this.playerApp.playerOverlayMgr.hideEndingScreen();
        this.showWaitingToEndScreen();
        this.playerApp.gameServerController.playerReady();
      }
    }
  }
}

module.exports = PlayerAppEndingState;
