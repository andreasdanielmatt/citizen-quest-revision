/* globals PIXI */
class TownView {
  constructor(config, textures) {
    this.config = config;
    this.textures = textures;
    this.display = new PIXI.Container();

    // Temporary initialization
    this.townSize = {
      width: 1024 * 8,
      height: 768 * 6,
    };

    this.background = PIXI.Sprite.from(this.textures['town-bg']);
    this.background.width = this.townSize.width;
    this.background.height = this.townSize.height;
    this.display.addChild(this.background);

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
    // this.display.addChild(this.baseCollisionMap);

    // Create a checkerboard pattern on the display
    // First fill the full background with a color
    const checkerboard = new PIXI.Graphics();
    checkerboard.beginFill(new PIXI.Color('#dbf6c9'));
    checkerboard.drawRect(0, 0, this.townSize.width, this.townSize.height);
    checkerboard.endFill();
    const squareSize = 256;
    const squareColor = new PIXI.Color('#e34747');
    // Draw the squares
    for (let x = 0; x < this.townSize.width; x += squareSize) {
      for (let y = 0; y < this.townSize.height; y += squareSize) {
        // Only draw squares on the checkerboard pattern
        if ((x / squareSize) % 2 === (y / squareSize) % 2) {
          checkerboard.beginFill(squareColor);
          checkerboard.drawRect(x, y, squareSize, squareSize);
          checkerboard.endFill();
        }
      }
    }
    // this.display.addChild(checkerboard);
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
