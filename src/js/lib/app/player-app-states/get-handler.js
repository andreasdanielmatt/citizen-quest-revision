const {
  IDLE,
  INTRO,
  PLAYING,
  ENDING,
} = require('./states');
const PlayerAppIdleState = require('./idle-state');
const PlayerAppIntroState = require('./intro-state');
const PlayerAppPlayingState = require('./playing-state');
const PlayerAppEndingState = require('./ending-state');

function getHandler(playerApp, state) {
  switch (state) {
    case IDLE:
      return new PlayerAppIdleState(playerApp);
    case INTRO:
      return new PlayerAppIntroState(playerApp);
    case PLAYING:
      return new PlayerAppPlayingState(playerApp);
    case ENDING:
      return new PlayerAppEndingState(playerApp);
    default:
      throw new Error(`Invalid state ${state}`);
  }
}

module.exports = getHandler;
