/* globals PIXI */
const CollisionMap = require('./collision-map');

class TownView {
  constructor(config, textures) {
    this.config = config;
    this.textures = textures;

    this.width = this.config.town.width;
    this.height = this.config.town.height;

    this.display = new PIXI.Container();
    this.bgLayer = new PIXI.Container();
    this.mainLayer = new PIXI.Container();
    this.display.addChild(this.bgLayer);
    this.display.addChild(this.mainLayer);

    this.background = PIXI.Sprite.from(this.textures['town-bg']);
    this.background.width = this.width;
    this.background.height = this.height;
    this.bgLayer.addChild(this.background);

    this.collisionMap = new CollisionMap(
      this.width,
      this.height,
      this.textures['town-collmap']
    );
  }

  async loadAssets() {
    this.assets = await PIXI.Assets.load();
  }

  isWalkable(x, y) {
    return this.collisionMap.isWalkable(x, y);
  }
}

module.exports = TownView;
