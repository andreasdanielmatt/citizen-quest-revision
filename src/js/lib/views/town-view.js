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

    this.background = PIXI.Sprite.from(this.textures['town-bg']);
    this.background.width = this.townSize.width;
    this.background.height = this.townSize.height;
    this.bgLayer.addChild(this.background);

    this.collisionRenderer = new PIXI.CanvasRenderer({
      width: this.townSize.width, height: this.townSize.height,
    });
    this.collisionTree = new PIXI.Container();
    this.baseCollisionMap = PIXI.Sprite.from(this.textures['town-collmap']);
    this.baseCollisionMap.width = this.townSize.width;
    this.baseCollisionMap.height = this.townSize.height;
    this.collisionTree.addChild(this.baseCollisionMap);
    this.collisionTree.renderCanvas(this.collisionRenderer);
    this.collisionMap = this.collisionRenderer.view
      .getContext('2d')
      .getImageData(0, 0, this.townSize.width, this.townSize.height).data;

    window.isWalkable = this.isWalkable.bind(this);
    window.collMap = this.collisionMap;
  }

  async loadAssets() {
    this.assets = await PIXI.Assets.load();
  }

  isWalkable(x, y) {
    // todo: make a map that's 1byte per pixel instead of 4
    return this.collisionMap[y * this.townSize.width * 4 + x * 4] == 0;
  }
}

module.exports = TownView;
