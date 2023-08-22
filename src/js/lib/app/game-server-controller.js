class GameServerController {
  constructor(playerApp, connector) {
    this.playerApp = playerApp;
    this.connector = connector;
  }

  playerStart() {
    this.connector.addPlayer(this.playerApp.playerId);
  }

  roundEnd() {
    // Nothing
  }

  playerReady() {
    this.connector.playerReady(this.playerApp.getState(), this.playerApp.playerId);
  }
}

module.exports = GameServerController;
