const PlayerAppState = require('./player-app-state');
const { INTRO } = require('./states');

class PlayerAppIntroState extends PlayerAppState {
  constructor(playerApp) {
    super(playerApp);
    this.state = INTRO;
  }

  onEnter() {
    this.playerApp.gameView.cameraFollowPc();
    this.playerApp.inputRouter.routeToMenus(this.playerApp);
  }
}

module.exports = PlayerAppIntroState;
