class PlayerAppState {
  constructor(playerApp) {
    this.playerApp = playerApp;
    this.state = null;
  }

  // eslint-disable-next-line class-methods-use-this,no-unused-vars
  onEnter(fromState) { }

  // eslint-disable-next-line class-methods-use-this,no-unused-vars
  onExit(toState) { }

  // eslint-disable-next-line class-methods-use-this
  onAction() { }
}

module.exports = PlayerAppState;
