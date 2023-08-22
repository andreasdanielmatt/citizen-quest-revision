const {
  DialogueOverlayConnection,
  PcMovementConnection,
  MenuConnection,
} = require('./player-app-input-connections');

class PlayerAppInputRouter {
  constructor(inputManager) {
    this.inputManager = inputManager;
    this.currentConnection = null;
  }

  setConnection(connection) {
    this.unroute();
    this.currentConnection = connection;
    this.currentConnection.route();
  }

  unroute() {
    if (this.currentConnection) {
      this.currentConnection.unroute();
    }
  }

  routeToPcMovement(playerApp) {
    this.setConnection(new PcMovementConnection(this.inputManager, playerApp));
  }

  routeToDialogueOverlay(dialogueOverlay, dialogueSequencer) {
    this.setConnection(new DialogueOverlayConnection(this.inputManager, dialogueOverlay, dialogueSequencer));
  }

  routeToMenus(playerApp) {
    this.setConnection(new MenuConnection(this.inputManager, playerApp));
  }
}

module.exports = PlayerAppInputRouter;
