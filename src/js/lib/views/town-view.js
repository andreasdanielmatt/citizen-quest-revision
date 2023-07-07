/* globals PIXI */
class TownView {
  constructor(config, textures) {
    this.config = config;
    this.textures = textures;
    this.display = new PIXI.Container();
    this.bgLayer = new PIXI.Container();
    this.mainLayer = new PIXI.Container();
    this.display.addChild(this.bgLayer);
    this.display.addChild(this.mainLayer);

    // Temporary initialization
    this.townSize = {
      width: 1024 * 8,
      height: 768 * 6,
    };

    const collisionScale = 0.5;
    this.collisionSize = {
      width: Math.round(this.townSize.width * collisionScale),
      height: Math.round(this.townSize.height * collisionScale),
    };

    this.background = PIXI.Sprite.from(this.textures['town-bg']);
    this.background.width = this.townSize.width;
    this.background.height = this.townSize.height;
    this.bgLayer.addChild(this.background);

    const collisionRenderer = new PIXI.CanvasRenderer({
      ...this.collisionSize,
    });
    const collisionTree = new PIXI.Container();
    const baseCollisionMap = PIXI.Sprite.from(this.textures['town-collmap']);
    baseCollisionMap.width = collisionRenderer.width;
    baseCollisionMap.height = collisionRenderer.height;
    collisionTree.addChild(baseCollisionMap);
    collisionRenderer.render(collisionTree);

    const collisionMapRGBA = collisionRenderer.view
      .getContext('2d')
      .getImageData(
        0,
        0,
        collisionRenderer.width,
        collisionRenderer.height
      ).data;

    // We only need a single channel, so we'll average the RGB values
    this.collisionMap = new Uint8Array(Math.floor(collisionMapRGBA.length / 4));
    for (let i = 0; i < this.collisionMap.length; i += 1) {
      this.collisionMap[i] =
        (collisionMapRGBA[i * 4] +
          collisionMapRGBA[i * 4 + 1] +
          collisionMapRGBA[i * 4 + 2]) /
        3;
    }

    window.isWalkable = this.isWalkable.bind(this);
    window.collMap = this.collisionMap;
  }

  async loadAssets() {
    this.assets = await PIXI.Assets.load();
  }

  isWalkable(x, y) {
    const transformedX = Math.floor(
      (x / this.townSize.width) * this.collisionSize.width
    );
    const transformedY = Math.floor(
      (y / this.townSize.height) * this.collisionSize.height
    );

    const index = transformedY * this.collisionSize.width + transformedX;
    return this.collisionMap[index] < 128;
  }
}

module.exports = TownView;
