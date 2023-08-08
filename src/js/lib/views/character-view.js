/* globals PIXI */

const MoodBalloon = require('./mood-balloon');

class CharacterView {
  constructor(config, textures, character, townView) {
    this.config = config;
    this.textures = textures;
    this.character = character;
    this.townView = townView;
    this.display = this.createSprite();
    this.moodBalloon = null;
  }

  createSprite() {
    const sprite = new PIXI.Sprite(this.textures['npcs-demo'].textures[this.character.id]);
    sprite.anchor.set(0.5, 1);

    sprite.position = this.character.position;
    sprite.zIndex = sprite.position.y;

    return sprite;
  }

  showMoodBalloon(mood) {
    if (this.moodBalloon === null) {
      this.moodBalloon = new MoodBalloon(this);
    }
    this.moodBalloon.show(mood);
  }

  hideMoodBalloon() {
    if (this.moodBalloon) {
      this.moodBalloon.hide();
    }
  }

  inRect(rect) {
    const { x, y } = this.character.position;
    return x >= rect.left && x <= rect.right
      && y >= rect.top && y <= rect.bottom;
  }
}

CharacterView.SPRITE_ANIMATION_SPEED = 0.3;

module.exports = CharacterView;
