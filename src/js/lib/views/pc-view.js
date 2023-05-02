/* globals PIXI */

class PCView {
  constructor(config, townView) {
    this.config = config;
    this.townView = townView;
    this.display = new PIXI.Graphics();
    this.display.beginFill(new PIXI.Color('#27a6a8'));
    this.display.drawRect(0, 0, 64, 128);
    this.display.endFill();
    window.pc = this;

    this.speed = {
      x: 0,
      y: 0,
    };

    // Temporary initialization
      this.spawnPoint = { x: 3462, y: 4100 };
    this.display.position = this.spawnPoint;
  }

  animate(time) {
    const { parent } = this.display;
    let newX;
    let newY;
    let furthestX = this.display.x + this.speed.x * time;
    let furthestY = this.display.y + this.speed.y * time;

    // Clamp the position to the parent's bounds
    furthestX = Math.max(0, Math.min(furthestX, parent.width - this.display.width));
    furthestY = Math.max(0, Math.min(furthestY, parent.height - this.display.height));

    // Collisions are checked on a per-pixel basis, so we only need to check
    // if the player has moved to a new pixel
    if (Math.floor(furthestX) !== Math.floor(this.display.x)
      || Math.floor(furthestY) !== Math.floor(this.display.y)) {
      // Check for collisions
      const collisionPoints = this.collisionPoints();
      newX = this.display.x;
      newY = this.display.y;
      const deltaX = furthestX - this.display.x;
      const deltaY = furthestY - this.display.y;
      const steps = Math.max(Math.abs(deltaX), Math.abs(deltaY));
      const stepX = deltaX / steps;
      const stepY = deltaY / steps;
      let collidedX = false;
      let collidedY = false;
      for (let i = 0; !(collidedX && collidedY) && i < steps; i += 1) {
        const candidateX = newX + stepX;
        const candidateY = newY + stepY;
        for (let j = 0; !(collidedX && collidedY) && j < collisionPoints.length; j += 1) {
          if (!this.townView.isWalkable(
            Math.floor(newX + collisionPoints[j].x),
            Math.floor(candidateY + collisionPoints[j].y)
          )) {
            collidedY = true;
          }
          if (!this.townView.isWalkable(
            Math.floor(candidateX + collisionPoints[j].x),
            Math.floor(newY + collisionPoints[j].y)
          )) {
            collidedX = true;
          }
          if (!collidedX && !collidedY && !this.townView.isWalkable(
            Math.floor(candidateX + collisionPoints[j].x),
            Math.floor(candidateY + collisionPoints[j].y)
          )) {
            collidedX = true;
            collidedY = true;
          }
        }
        newX = collidedX ? newX : candidateX;
        newY = collidedY ? newY : candidateY;
      }
    } else {
      newX = furthestX;
      newY = furthestY;
    }

    this.display.x = newX;
    this.display.y = newY;
  }

  collisionPoints() {
    // The collisions are only checked for two points at the baseline of the PC,
    return [
      {
        x: 0,
        y: this.display.height,
      },
      {
        x: this.display.width,
        y: this.display.height,
      },
    ];
  }
}

module.exports = PCView;
