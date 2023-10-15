const GameManagerState = require('./game-manager-state');
const { IDLE } = require('../game-manager-states');

class GameManagerIdleState extends GameManagerState {
  constructor(gameManager) {
    super(gameManager);
    this.state = IDLE;
  }

  onEnter() {
    const playersToRemove = [];
    Object.keys(this.gameManager.players).forEach((playerId) => {
      if (!this.gameManager.playersContinuing.has(playerId)) {
        playersToRemove.push(playerId);
      }
    });
    if (this.gameManager.playersContinuing.size > 0) {
      this.gameManager.playersContinuing = new Set();
    }
    this.gameManager.removePlayers(playersToRemove);
  }
}

module.exports = GameManagerIdleState;
