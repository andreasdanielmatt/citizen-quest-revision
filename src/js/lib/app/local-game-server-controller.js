const { PlayerAppStates } = require('./player-app-states');

class LocalGameServerController {
  constructor(playerApp) {
    this.playerApp = playerApp;
  }

  playerStart() {
    this.playerApp.addPc();
    this.playerApp.setState(PlayerAppStates.PLAYING);
  }

  roundEnd() {
    this.playerApp.setState(PlayerAppStates.ENDING);
  }

  playerReady() {
    if (this.playerApp.getState() === PlayerAppStates.ENDING) {
      this.playerApp.setState(PlayerAppStates.IDLE);
    }
  }
}

module.exports = LocalGameServerController;
