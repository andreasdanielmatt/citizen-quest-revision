const EventEmitter = require('events');
const Character = require('../../src/js/lib/model/character');
const reportError = require('./errors');
const {
  GameManagerIdleState,
  GameManagerIntroState,
  GameManagerPlayingState,
  GameManagerEndingState, GameManagerStates,
} = require('./game-manager-states');

class GameManager {
  constructor(config) {
    this.config = config;
    this.events = new EventEmitter();
    this.players = {};
    this.roundStartTime = null;

    this.stateHandler = null;
    this.transitionState = null;
    this.readyPlayers = new Set();
    this.transitionTimeout = null;
    this.playersContinuing = new Set();

    this.events.on('playerCountChange', this.handlePlayerCountChange.bind(this));
    this.setState(GameManagerStates.IDLE);
  }

  /**
   * Add a player to the game.
   *
   * @param {string} playerId
   */
  addPlayer(playerId) {
    if (this.config.players[playerId] === undefined) {
      reportError(`Error: Attempting to add unknown player ${playerId}`);
      return;
    }

    if (this.config.players[playerId].enabled === false) {
      reportError(`Error: Attempting to add disabled player ${playerId}`);
      return;
    }

    if (this.players[playerId] !== undefined) {
      reportError(`Error: Attempting to add already added player ${playerId}`);
      return;
    }

    this.players[playerId] = new Character(playerId, this.config.players[playerId]);
    this.events.emit('playerAdded', playerId);
    this.events.emit('playerCountChange', 1);

    if (this.getState() === GameManagerStates.ENDING) {
      this.playerContinuing(playerId);
    }
  }

  /**
   * Remove a player from the game.
   *
   * @param {string} playerId
   */
  removePlayers(playerIds) {
    let delta = 0;
    playerIds.forEach((playerId) => {
      if (this.players[playerId]) {
        delete this.players[playerId];
        this.readyPlayers.delete(playerId);
        this.events.emit('playerRemoved', playerId);
        delta -= 1;
      }
    });
    this.events.emit('playerCountChange', delta);
  }

  handlePlayerCountChange(delta) {
    const playerCount = Object.keys(this.players).length;
    if (this.getState() === GameManagerStates.IDLE) {
      if (playerCount > 0) {
        this.setState(GameManagerStates.PLAYING);
      }
    } else if (playerCount === 0) {
      this.setState(GameManagerStates.IDLE);
    } else {
      this.checkAllPlayersReady();
    }
  }

  /**
   * Called when a player is ready to move to the next stateHandler. If all players are ready,
   * the game stateHandler is advanced.
   *
   * @param {string} state
   *  The stateHandler the player is ready to move away from.
   * @param {string} playerId
   *  The player ID.
   */
  playerReady(state, playerId) {
    // Check if the player is in the players list.
    if (this.players[playerId] === undefined) {
      reportError(`Error: Attempting to set ready state for a non active player (${playerId})`);
      return;
    }
    if (this.getState() !== state) {
      return;
    }
    this.readyPlayers.add(playerId);
    this.checkAllPlayersReady();
  }

  playerContinuing(playerId) {
    this.playersContinuing.add(playerId);
  }

  /**
   * Check if all players are ready to move to the next stateHandler. If so, advance the game stateHandler.
   */
  checkAllPlayersReady() {
    const allReady = Object.keys(this.players).reduce((acc, playerId) => (
      acc && this.readyPlayers.has(playerId)
    ), true);

    if (allReady) {
      this.transitionToPreparedState();
    }
  }

  /**
   * Clear the list of players ready to move to the next stateHandler.
   */
  clearReadyPlayers() {
    this.readyPlayers = new Set();
  }

  getState() {
    return (this.stateHandler && this.stateHandler.state) || null;
  }

  /**
   * Set the current game stateHandler.
   *
   * @param {string} state
   */
  setState(state) {
    if (this.getState() === state) {
      return;
    }
    // Check if the stateHandler is valid.
    if (Object.values(GameManagerStates).indexOf(state) === -1) {
      reportError(`Error: Attempting to set invalid state ${state}`);
      return;
    }

    this.clearStateTransition();
    const oldState = this.getState();
    if (this.stateHandler) {
      this.stateHandler.onExit(state);
    }
    this.stateHandler = this.createStateHandler(state);
    if (this.stateHandler) {
      this.stateHandler.onEnter(oldState);
    }
    this.events.emit('stateChanged', state);
  }

  createStateHandler(state) {
    switch (state) {
      case GameManagerStates.IDLE:
        return new GameManagerIdleState(this);
      case GameManagerStates.INTRO:
        return new GameManagerIntroState(this);
      case GameManagerStates.PLAYING:
        return new GameManagerPlayingState(this);
      case GameManagerStates.ENDING:
        return new GameManagerEndingState(this);
      default:
        reportError(`Error: Attempting to create invalid state ${state}`);
        return new GameManagerIdleState(this);
    }
  }

  /**
   * Prepare a transition to another stateHandler, conditional to every player confirming.
   */
  prepareStateTransition(nextState, timeout) {
    if (Object.values(GameManagerStates).indexOf(nextState) === -1) {
      reportError(`Error: Attempting to prepare invalid state ${nextState}`);
      return;
    }
    this.clearStateTransition();
    this.transitionState = nextState;
    if (timeout > 0) {
      this.transitionTimeout = setTimeout(() => {
        this.transitionToPreparedState();
      }, timeout);
    }
  }

  /**
   * Clear the current prepared stateHandler transition.
   */
  clearStateTransition() {
    this.transitionState = null;
    if (this.transitionTimeout) {
      clearTimeout(this.transitionTimeout);
      this.transitionTimeout = null;
    }
    this.clearReadyPlayers();
  }

  /**
   * Transition to the prepared stateHandler.
   */
  transitionToPreparedState() {
    const nextState = this.transitionState;
    this.clearStateTransition();
    this.setState(nextState);
  }
}

module.exports = GameManager;
