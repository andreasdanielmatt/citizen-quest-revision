/* globals PIXI */
class TownView {
  constructor(config) {
    this.config = config;
    this.display = new PIXI.Container();

    // Temporary initialization
    this.townSize = {
      width: 1024 * 4,
      height: 768 * 3,
    };
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
    this.display.addChild(checkerboard);
  }
}

module.exports = TownView;
