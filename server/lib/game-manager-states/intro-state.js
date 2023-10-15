const GameManagerState = require('./game-manager-state');
const { PLAYING, INTRO } = require('../game-manager-states');

class GameManagerIntroState extends GameManagerState {
  constructor(gameManager) {
    super(gameManager);
    this.state = INTRO;
  }

  onEnter() {
    this.gameManager.prepareStateTransition(
      PLAYING,
      this.gameManager.config.game.introTimeout * 1000
    );
  }
}

module.exports = GameManagerIntroState;
