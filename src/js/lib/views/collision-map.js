/* globals PIXI */
const BitVector = require('../helpers/bit-vector');

class CollisionMap {
  constructor(width, height, texture) {
    this.scale = 0.5;
    this.width = Math.round(width * this.scale);
    this.height = Math.round(height * this.scale);

    this.renderer = new PIXI.CanvasRenderer({
      width: this.width,
      height: this.height,
    });
    this.display = new PIXI.Container();
    const baseMap = PIXI.Sprite.from(texture);
    baseMap.width = this.width;
    baseMap.height = this.height;
    this.display.addChild(baseMap);

    this.render();
  }

  render() {
    this.renderer.render(this.display);

    const collisionMapRGBA = this.renderer.view
      .getContext('2d')
      .getImageData(
        0,
        0,
        this.width,
        this.height
      ).data;

    // We only need one bit per pixel by thresholding the grayscale value
    const numBits = Math.floor(collisionMapRGBA.length / 4);
    this.collisionMap = new BitVector(numBits);
    for (let i = 0; i < numBits; i += 1) {
      const gray = (collisionMapRGBA[i * 4]
          + collisionMapRGBA[i * 4 + 1]
          + collisionMapRGBA[i * 4 + 2])
        / 3;
      this.collisionMap.set(i, gray < 128);
    }
  }

  isWalkable(x, y) {
    return this.collisionMap.get(
      Math.floor(y * this.scale) * this.width + Math.floor(x * this.scale)
    );
  }
}

module.exports = CollisionMap;
