/* globals PIXI */

class PCView {
  constructor(config, textures, pc, townView) {
    this.config = config;
    this.textures = textures;
    this.pc = pc;
    this.townView = townView;
    this.display = this.createSprite();
    this.direction = 'e';
    this.isWalking = false;
  }

  createSprite() {
    const sprite = new PIXI.AnimatedSprite(this.textures['character-basic'].animations['basic-es']);
    sprite.anchor.set(0, 0);
    sprite.width = PCView.SPRITE_WIDTH;
    sprite.height = PCView.SPRITE_HEIGHT;
    sprite.animationSpeed = PCView.SPRITE_ANIMATION_SPEED;
    sprite.play();
    sprite.position = this.pc.position;

    return sprite;
  }

  updateSprite(oldX, oldY, newX, newY) {
    let updated = false;
    let newDirection = this.direction;
    let newIsWalking = this.isWalking;

    if (newX > oldX) {
      newDirection = 'e';
    } else if (newX < oldX) {
      newDirection = 'w';
    } else if (newY > oldY) {
      newDirection = 's';
    } else if (newY < oldY) {
      newDirection = 'n';
    }

    if (oldX !== newX || oldY !== newY) {
      newIsWalking = true;
    } else {
      newIsWalking = false;
    }

    if (newDirection !== this.direction || newIsWalking !== this.isWalking) {
      const action = newIsWalking ? 'w' : 's';
      this.display.textures = this.textures['character-basic'].animations[`basic-${newDirection}${action}`];
      this.display.play();
      this.direction = newDirection;
      this.isWalking = newIsWalking;
    }
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

    this.updateSprite(this.pc.position.x, this.pc.position.y, newX, newY);
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

PCView.SPRITE_HEIGHT = 156;
PCView.SPRITE_WIDTH = 72;
PCView.SPRITE_ANIMATION_SPEED = 0.3;

module.exports = PCView;
