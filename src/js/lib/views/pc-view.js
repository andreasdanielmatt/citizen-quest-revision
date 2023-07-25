/* globals PIXI */

const CharacterView = require('./character-view');

class PCView extends CharacterView {
  constructor(config, textures, character, townView) {
    super(config, textures, character, townView);

    this.direction = 'e';
    this.isWalking = false;
    this.hitboxDisplay = this.createHitboxDisplay();
  }

  createSprite() {
    const sprite = new PIXI.AnimatedSprite(this.textures['character-basic'].animations['basic-es']);
    sprite.anchor.set(0, 0);

    sprite.animationSpeed = PCView.SPRITE_ANIMATION_SPEED;
    sprite.play();
    sprite.position = this.character.position;

    return sprite;
  }

  createHitboxDisplay() {
    const display = new PIXI.Graphics();
    // Do a simple rectangle
    display.beginFill(0xff0000);
    display.drawRect(0, 0, PCView.ACTION_HITBOX_H, PCView.ACTION_HITBOX_W);
    display.endFill();
    display.position = this.character.position;
    display.alpha = 0.5;
    display.visible = false;

    return display;
  }

  updateSprite(oldX, oldY, newX, newY) {
    let newDirection = this.direction;
    let newIsWalking;

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
    const { position, speed } = this.character;
    let furthestX = position.x + speed.x * time;
    let furthestY = position.y + speed.y * time;
    let newX;
    let newY;

    // Clamp the position to the town's bounds
    furthestX = Math.max(0, Math.min(furthestX, townDisplay.width - this.display.width));
    furthestY = Math.max(0, Math.min(furthestY, townDisplay.height - this.display.height));

    // Collisions are checked on a per-pixel basis, so we only need to check
    // if the player has moved to a new pixel
    if (Math.floor(furthestX) !== Math.floor(position.x)
      || Math.floor(furthestY) !== Math.floor(position.y)) {
      // Check for collisions
      const collisionPoints = this.collisionPoints();
      newX = position.x;
      newY = position.y;
      const deltaX = furthestX - position.x;
      const deltaY = furthestY - position.y;
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

    this.updateSprite(position.x, position.y, newX, newY);
    this.character.setPosition(newX, newY);
    this.display.position = position;
    this.display.zIndex = position.y;
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

    const { x, y } = this.character.position;
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
