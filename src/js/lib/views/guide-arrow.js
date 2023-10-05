/* global PIXI */
const PixiTween = require('../helpers-pixi/tween');

class GuideArrow {
  constructor(pcView) {
    this.pcView = pcView;
    this.display = this.createSprite();
    this.pcView.display.addChild(this.display);
    this.visible = false;
    this.active = false;
    this.direction = { x: 0, y: 0 };
    this.tween = PixiTween.Pulse(this.display);
  }

  createSprite() {
    const sprite = new PIXI.Sprite(this.pcView.textures['guide-arrow']);
    sprite.anchor.set(0, 0.5);
    sprite.visible = false;

    return sprite;
  }

  destroy() {
    if (this.display.parent && !this.display.parent.destroyed) {
      this.display.parent.removeChild(this.display);
    }
    this.display.destroy();
  }

  show() {
    this.visible = true;
    this.updateVisibility();
  }

  hide() {
    this.visible = false;
    this.updateVisibility();
  }

  updateVisibility() {
    this.display.visible = this.active && this.visible;
  }

  /**
   * Show an arrow around the character in the specified direction
   *
   * @param {number} x
   *  -1, 0 or 1 for left, neutral or right
   * @param {number} y
   *  -1, 0 or 1 for top, neutral or bottom
   */
  pointInDirection(x, y) {
    if (x === this.direction.x && y === this.direction.y) {
      return;
    }
    this.direction = { x, y };
    if (this.direction.x === 0 && this.direction.y === 0) {
      this.active = false;
      this.updateVisibility();
      return;
    }

    this.updateVisibility();
    this.active = true;
    // By default, the sprite points to the right (x = 1, y = 0)
    this.display.rotation = Math.atan2(this.direction.y, this.direction.x);
    this.display.position = this.getArrowPosition();

    // if (this.tween) {
    //   this.tween.destroy();
    //   const position = this.getArrowPosition();
    //   this.tween = PixiTween.Yoyo(this.display, position, 1, 1.2);
    // }
  }

  getArrowPosition() {
    return {
      x: (this.pcView.display.width * 0.75) * this.direction.x,
      y: -this.pcView.display.height / 2 + (this.pcView.display.height * 0.6) * this.direction.y,
    };
  }
}

module.exports = GuideArrow;
