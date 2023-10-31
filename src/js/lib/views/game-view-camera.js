/* globals PIXI */

/**
 * A camera offers a viewport that crops, pans and zooms across a child display object.
 */
class GameViewCamera {
  /**
   * @param {PIXI.DisplayObject} child
   *  The display object to be cropped, panned and zoomed.
   * @param {Number} viewportWidth
   *  The width of the viewport (the view that the camera offers).
   * @param {Number} viewportHeight
   *  The height of the viewport (the view that the camera offers).
   */
  constructor(child, viewportWidth, viewportHeight) {
    this.child = child;
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;

    this.display = new PIXI.Container();
    this.display.addChild(this.child);
    this.target = null;
    this.offset = new PIXI.Point(0, 0);
  }

  /**
   * Set the target of the camera.
   *
   * @param {PIXI.DisplayObject} target
   *  An object within the child that the camera should follow.
   */
  setTarget(target, offsetX = 0, offsetY = 0) {
    this.target = target;
    this.offset = new PIXI.Point(offsetX, offsetY);
  }

  /**
   * Update the camera.
   *
   * This should be called every frame. It will update the camera's pivot point to follow
   * the target.
   */
  update() {
    if (this.target) {
      // Set the pivot but maintain the camera within the bounds of the view
      this.display.pivot.set(
        Math.max(
          0,
          Math.min(
            this.target.x + this.offset.x - this.viewportWidth / 2 / this.display.scale.x,
            this.child.width - this.viewportWidth / this.display.scale.x
          )
        ),
        Math.max(
          0,
          Math.min(
            this.target.y + this.offset.y - this.viewportHeight / 2 / this.display.scale.y,
            this.child.height - this.viewportHeight / this.display.scale.y
          )
        )
      );
    }
  }
}

module.exports = GameViewCamera;
