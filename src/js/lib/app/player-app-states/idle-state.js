const PlayerAppState = require('./player-app-state');
const { IDLE } = require('./states');

class PlayerAppIdleState extends PlayerAppState {
  constructor(playerApp) {
    super(playerApp);
    this.state = IDLE;
  }

  onEnter() {
    this.playerApp.titleOverlay.show();
    this.playerApp.gameView.cameraFollowDrone();
    this.playerApp.inputRouter.routeToMenus(this.playerApp);
  }

  onAction() {
    this.playerApp.playerStart();
  }

  onExit() {
    this.playerApp.titleOverlay.hide();
  }
}

module.exports = PlayerAppIdleState;
