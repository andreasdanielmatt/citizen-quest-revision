const { DialogueOverlayConnection, PcMovementConnection } = require('./player-app-input-connections');

class PlayerAppInputRouter {
  constructor(inputManager) {
    this.inputManager = inputManager;
    this.currentConnection = null;
  }

  setConnection(connection) {
    if (this.currentConnection) {
      this.currentConnection.unroute();
    }
    this.currentConnection = connection;
    this.currentConnection.route();
  }

  routeToPcMovement(playerApp) {
    this.setConnection(new PcMovementConnection(this.inputManager, playerApp));
  }

  routeToDialogueOverlay(dialogueOverlay, dialogueSequencer) {
    this.setConnection(new DialogueOverlayConnection(this.inputManager, dialogueOverlay, dialogueSequencer));
  }
}

module.exports = PlayerAppInputRouter;
