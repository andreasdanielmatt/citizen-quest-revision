/* globals PIXI */

class PCView {
  constructor(config, pc, townView) {
    this.config = config;
    this.pc = pc;
    this.townView = townView;
    this.display = new PIXI.Graphics();
    this.display.beginFill(new PIXI.Color(this.pc.props.color || '#61dcbd'));
    this.display.drawRect(0, 0, 64, 128);
    this.display.endFill();
    this.display.position = this.pc.position;
  }

  animate(time) {
    const townDisplay = this.townView.display;
    let newX;
    let newY;
    let furthestX = this.pc.position.x + this.pc.speed.x * time;
    let furthestY = this.pc.position.y + this.pc.speed.y * time;

    // Clamp the position to the town's bounds
    furthestX = Math.max(0, Math.min(furthestX, townDisplay.width - this.display.width));
    furthestY = Math.max(0, Math.min(furthestY, townDisplay.height - this.display.height));

    // Collisions are checked on a per-pixel basis, so we only need to check
    // if the player has moved to a new pixel
    if (Math.floor(furthestX) !== Math.floor(this.pc.position.x)
      || Math.floor(furthestY) !== Math.floor(this.pc.position.y)) {
      // Check for collisions
      const collisionPoints = this.collisionPoints();
      newX = this.pc.position.x;
      newY = this.pc.position.y;
      const deltaX = furthestX - this.pc.position.x;
      const deltaY = furthestY - this.pc.position.y;
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

    this.pc.setPosition(newX, newY);
    this.display.position = this.pc.position;
    this.display.zIndex = this.pc.position.y;
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
