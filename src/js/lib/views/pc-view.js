/* globals PIXI */

class PCView {
  constructor(config) {
    this.config = config;
    this.display = new PIXI.Graphics();
    this.display.beginFill(new PIXI.Color('#27a6a8'));
    this.display.drawRect(0, 0, 64, 128);
    this.display.endFill();

    this.speed = {
      x: 0,
      y: 0,
    };
  }

  animate(time) {
    const parent = this.display.parent;
    const newX = this.display.x + this.speed.x * time;
    const newY = this.display.y + this.speed.y * time;
    // Clamp the position to the parent's bounds
    this.display.x = Math.max(0, Math.min(newX, parent.width - this.display.width));
    this.display.y = Math.max(0, Math.min(newY, parent.height - this.display.height));
  }
}

module.exports = PCView;
