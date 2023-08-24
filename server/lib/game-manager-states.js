const GameManager = require('./game-manager');

/**
 * Game states.
 *
 * See `doc/game-states.md` for a description of the game states.
 *
 * @type {{INTRO: string, IDLE: string, PLAYING: string, ENDING: string}}
 */

const GameManagerStates = {
  IDLE: 'idle',
  INTRO: 'intro',
  PLAYING: 'playing',
  ENDING: 'ending',
};

class GameManagerState {
  constructor(gameManager) {
    this.gameManager = gameManager;
  }

  // eslint-disable-next-line no-unused-vars,class-methods-use-this
  onEnter(fromState) { }

  // eslint-disable-next-line no-unused-vars,class-methods-use-this
  onExit(toState) { }
}

class GameManagerIdleState extends GameManagerState {
  constructor(gameManager) {
    super(gameManager);
    this.state = GameManagerStates.IDLE;
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

class GameManagerIntroState extends GameManagerState {
  constructor(gameManager) {
    super(gameManager);
    this.state = GameManagerStates.INTRO;
  }

  onEnter() {
    this.gameManager.prepareStateTransition(
      GameManagerStates.PLAYING,
      this.gameManager.config.game.introTimeout * 1000
    );
  }
}

class GameManagerPlayingState extends GameManagerState {
  constructor(gameManager) {
    super(gameManager);
    this.state = GameManagerStates.PLAYING;
  }

  onEnter() {
    this.gameManager.roundStartTime = Date.now();
    this.gameManager.prepareStateTransition(
      GameManagerStates.ENDING,
      this.gameManager.config.game.duration * 1000
    );
  }
}

class GameManagerEndingState extends GameManagerState {
  constructor(gameManager) {
    super(gameManager);
    this.state = GameManagerStates.ENDING;
  }

  onEnter() {
    this.gameManager.prepareStateTransition(
      GameManagerStates.IDLE,
      this.gameManager.config.game.endingTimeout * 1000
    );
  }

  onExit() {
    this.gameManager.flags.clear();
  }
}

module.exports = {
  GameManagerStates,
  GameManagerState,
  GameManagerIdleState,
  GameManagerIntroState,
  GameManagerPlayingState,
  GameManagerEndingState,
};
