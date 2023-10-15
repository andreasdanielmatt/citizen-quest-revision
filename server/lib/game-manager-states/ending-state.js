const GameManagerState = require('./game-manager-state');
const { ENDING, IDLE } = require('../game-manager-states');

class GameManagerEndingState extends GameManagerState {
  constructor(gameManager) {
    super(gameManager);
    this.state = ENDING;
  }

  onEnter() {
    this.gameManager.prepareStateTransition(
      IDLE,
      this.gameManager.config.game.endingTimeout * 1000
    );
  }

  onExit() {
    this.gameManager.flags.clear();
  }
}

module.exports = GameManagerEndingState;
