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

    this.collisionRenderer = new PIXI.CanvasRenderer({
      ...this.collisionSize,
    });
    this.collisionTree = new PIXI.Container();
    this.baseCollisionMap = PIXI.Sprite.from(this.textures['town-collmap']);
    this.baseCollisionMap.width = this.collisionRenderer.width;
    this.baseCollisionMap.height = this.collisionRenderer.height;
    this.collisionTree.addChild(this.baseCollisionMap);
    this.collisionRenderer.render(this.collisionTree);
    this.collisionMap = this.collisionRenderer.view
      .getContext('2d')
      .getImageData(
        0,
        0,
        this.collisionRenderer.width,
        this.collisionRenderer.height
      ).data;

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

    // todo: make a map that's 1byte per pixel instead of 4
    return (
      this.collisionMap[
        transformedY * this.collisionSize.width * 4 + transformedX * 4
      ] < 128
    );
  }
}

module.exports = TownView;
