/* globals PIXI */
class NPCView {
  constructor(config, textures, npc, townView) {
    this.config = config;
    this.textures = textures;
    this.npc = npc;
    this.townView = townView;
    this.display = this.createSprite();
  }

  createSprite() {
    const sprite = new PIXI.Sprite(this.textures['npcs-demo'].textures[this.npc.id]);
    sprite.anchor.set(0, 0);
    // sprite.width = 72;
    // sprite.height = 156;
    // sprite.animationSpeed = PCView.SPRITE_ANIMATION_SPEED;
    // sprite.play();
    sprite.position = this.npc.spawn;
    sprite.zIndex = this.npc.spawn.y;

    return sprite;
  }

  inRect(rect) {
    return this.npc.spawn.x >= rect.left
      && this.npc.spawn.x <= rect.right
      && this.npc.spawn.y >= rect.top
      && this.npc.spawn.y <= rect.bottom;
  }
}

module.exports = NPCView;
