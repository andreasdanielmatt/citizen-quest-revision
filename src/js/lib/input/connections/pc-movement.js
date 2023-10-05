class PcMovementConnection {
  constructor(inputManager, playerApp) {
    this.inputManager = inputManager;
    this.playerApp = playerApp;
    this.handleAction = this.handleAction.bind(this);
  }

  route() {
    this.playerApp.enablePcControl();
    this.inputManager.events.on('action', this.handleAction);
  }

  unroute() {
    this.playerApp.disablePcControl();
    this.inputManager.events.off('action', this.handleAction);
  }

  handleAction() {
    this.playerApp.pcAction();
  }
}

module.exports = PcMovementConnection;
