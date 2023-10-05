class MenuConnection {
  constructor(inputManager, playerApp) {
    this.inputManager = inputManager;
    this.playerApp = playerApp;
    this.handleAction = this.handleAction.bind(this);
  }

  route() {
    this.inputManager.events.on('action', this.handleAction);
  }

  unroute() {
    this.inputManager.events.off('action', this.handleAction);
  }

  handleAction() {
    this.playerApp.menuAction();
  }
}

module.exports = MenuConnection;
