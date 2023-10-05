/* global PIXI */
const Fader = require('../helpers-pixi/fader');
const PixiTween = require('../helpers-pixi/tween');

class TargetArrow {
  constructor(characterView) {
    this.characterView = characterView;
    this.display = this.createSprite();
    this.characterView.display.addChild(this.display);

    this.visible = false;
    this.fader = new Fader(this.display);

    const [from, to] = this.getArrowCoords();
    this.tween = PixiTween.Yoyo(
      this.display,
      { x: 0, y: 1 },
      from,
      to
    );

    this.show();
  }

  createSprite() {
    const sprite = new PIXI.Sprite(this.characterView.textures['target-arrow']);
    sprite.anchor.set(0.5, 1);
    sprite.position.set(
      0,
      -this.characterView.display.height
    );
    sprite.visible = false;
    sprite.alpha = 0;

    return sprite;
  }

  destroy() {
    this.fader.fadeOut(200, () => {
      this.fader.destroy();
      this.tween.destroy();
      if (this.display.parent && !this.display.parent.destroyed) {
        this.display.parent.removeChild(this.display);
      }
      this.display.destroy();
    });
  }

  hide() {
    this.visible = false;
    this.fader.fadeOut(200);
  }

  show() {
    this.visible = true;
    this.fader.fadeIn(200);
  }

  getArrowCoords() {
    if (this.characterView.hasMoodBalloon()) {
      return [
        -this.characterView.display.height * 1.2,
        -this.characterView.display.height * 1.35,
      ];
    }

    return [
      -this.characterView.display.height,
      -this.characterView.display.height * 1.15,
    ];
  }
}

module.exports = TargetArrow;
