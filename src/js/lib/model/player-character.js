const clone = require('../helpers/clone');

class PlayerCharacter {
  constructor(config, id) {
    this.config = config;
    this.id = id;
    if (this.config.players[this.id] === undefined) {
      throw new Error(`Attempted to initialize a player with id ${this.id}, which was not found in the config`);
    }
    this.props = clone(this.config.players[this.id]);

    this.position = { x: 0, y: 0 };
    this.speed = { x: 0, y: 0 };
    this.direction = 'e';
    this.setPosition(this.props.spawn.x, this.props.spawn.y);
  }

  setPosition(x, y) {
    this.position.x = x;
    this.position.y = y;
  }

  setSpeed(x, y) {
    this.speed.x = x;
    this.speed.y = y;
  }

  setDirection(direction) {
    this.direction = direction;
  }
}

module.exports = PlayerCharacter;
