const PlayerAppState = require('./player-app-state');
const { ENDING, IDLE } = require('./states');

class PlayerAppEndingState extends PlayerAppState {
  constructor(playerApp) {
    super(playerApp);
    this.state = ENDING;
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
    this.playerApp.hideEndingScreen();
    this.playerApp.hideTextScreen();
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

module.exports = PlayerAppEndingState;
