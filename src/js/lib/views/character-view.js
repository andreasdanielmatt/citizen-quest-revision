/* globals PIXI */

class CharacterView {
  constructor(config, textures, character, townView) {
    this.config = config;
    this.textures = textures;
    this.character = character;
    this.townView = townView;
    this.display = this.createSprite();
  }

  createSprite() {
    const sprite = new PIXI.Sprite(this.textures['npcs-demo'].textures[this.character.id]);
    sprite.anchor.set(0, 0);

    sprite.position = this.character.position;
    sprite.zIndex = sprite.position.y;

    return sprite;
  }

  inRect(rect) {
    const { x, y } = this.character.position;
    return x >= rect.left && x <= rect.right
      && y >= rect.top && y <= rect.bottom;
  }
}

CharacterView.SPRITE_ANIMATION_SPEED = 0.3;


module.exports = CharacterView;
