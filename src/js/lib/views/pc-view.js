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
    this.showHitbox = false;
    this.hitboxDisplay = this.createHitboxDisplay();
  }

  createSprite() {
    const sprite = new PIXI.AnimatedSprite(this.textures['character-basic'].animations['basic-es']);
    sprite.anchor.set(0, 0);
    sprite.width = PCView.SPRITE_W;
    sprite.height = PCView.SPRITE_H;
    sprite.animationSpeed = PCView.SPRITE_ANIMATION_SPEED;
    sprite.play();
    sprite.position = this.pc.position;

    return sprite;
  }

  createHitboxDisplay() {
    const display = new PIXI.Graphics();
    // Do a simple rectangle
    display.beginFill(0xff0000);
    display.drawRect(0, 0, PCView.ACTION_HITBOX_H, PCView.ACTION_HITBOX_W);
    display.endFill();
    display.position = this.pc.position;
    display.alpha = 0.5;
    display.visible = false;

    return display;
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

  getActionHitbox() {
    let top;
    let bottom;
    let left;
    let right;

    const { x, y } = this.pc.position;
    switch (this.direction) {
      case 'e':
        top = y - PCView.ACTION_HITBOX_H / 2;
        bottom = y + PCView.ACTION_HITBOX_H / 2;
        left = x;
        right = x + PCView.ACTION_HITBOX_W;
        break;
      case 'w':
        top = y - PCView.ACTION_HITBOX_H / 2;
        bottom = y + PCView.ACTION_HITBOX_H / 2;
        left = x + PCView.SPRITE_W - PCView.ACTION_HITBOX_W;
        right = x + PCView.SPRITE_W;
        break;
      case 'n':
        top = y - (PCView.ACTION_HITBOX_W / 4) * 3;
        bottom = y + PCView.ACTION_HITBOX_W / 4;
        left = x + (PCView.SPRITE_W / 2) - (PCView.ACTION_HITBOX_W / 2);
        right = x + (PCView.SPRITE_W / 2) + (PCView.ACTION_HITBOX_W / 2);
        break;
      case 's':
        top = y;
        bottom = y + PCView.ACTION_HITBOX_W;
        left = x + (PCView.SPRITE_W / 2) - (PCView.ACTION_HITBOX_W / 2);
        right = x + (PCView.SPRITE_W / 2) + (PCView.ACTION_HITBOX_W / 2);
        break;
      default:
        throw new Error(`Invalid direction ${this.direction}`);
    }

    return {
      top, right, bottom, left,
    };
  }

  showActionHitbox(hitbox) {
    this.hitboxDisplay.width = Math.abs(hitbox.right - hitbox.left);
    this.hitboxDisplay.height = Math.abs(hitbox.bottom - hitbox.top);
    this.hitboxDisplay.position.x = hitbox.left;
    this.hitboxDisplay.position.y = hitbox.top;
    this.hitboxDisplay.visible = true;

    // Show for one second
    clearTimeout(this.hitboxTimeout);
    this.hitboxTimeout = setTimeout(() => {
      this.hitboxDisplay.visible = false;
    }, 1000);
  }
}

PCView.SPRITE_H = 156;
PCView.SPRITE_W = 72;
PCView.SPRITE_ANIMATION_SPEED = 0.3;
PCView.ACTION_HITBOX_H = 150;
PCView.ACTION_HITBOX_W = 200;

module.exports = PCView;
