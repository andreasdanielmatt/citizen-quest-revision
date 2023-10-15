const GameManagerState = require('./game-manager-state');
const { PLAYING, ENDING } = require('../game-manager-states');

class GameManagerPlayingState extends GameManagerState {
  constructor(gameManager) {
    super(gameManager);
    this.state = PLAYING;
  }

  onEnter() {
    this.gameManager.roundStartTime = Date.now();
    this.gameManager.prepareStateTransition(
      ENDING,
      this.gameManager.config.game.duration * 1000
    );
  }
}

module.exports = GameManagerPlayingState;
