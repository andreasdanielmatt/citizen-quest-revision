/* globals PIXI */

const CharacterView = require('./character-view');

class PCView extends CharacterView {
  constructor(config, textures, character, townView) {
    super(config, textures, character, townView);

    this.direction = 'e';
    this.isWalking = false;
    this.hitboxDisplay = this.createHitboxDisplay();
    this.positionMarker = this.createPositionMarker();
    this.display.addChild(this.positionMarker);
  }

  destroy() {
    super.destroy();
    this.hitboxDisplay.destroy();
    this.positionMarker.destroy();
  }

  getTextureId() {
    return `player-${this.character.id}`;
  }

  createSprite() {
    const textureId = this.getTextureId();
    const sprite = new PIXI.AnimatedSprite(this.textures[textureId].animations[`${textureId}-es`]);
    sprite.anchor.set(0.5, 1);

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

  // eslint-disable-next-line class-methods-use-this
  createPositionMarker() {
    const display = new PIXI.Graphics();
    // Do a simple square
    display.beginFill(0x00ff00);
    display.drawCircle(0, 0, 5);
    display.endFill();
    display.position = { x: 0, y: 0 };
    display.visible = false;

    return display;
  }

  updateSprite(oldX, oldY, newX, newY) {
    let newDirection = this.direction;

    if (newX > oldX) {
      newDirection = 'e';
    } else if (newX < oldX) {
      newDirection = 'w';
    } else if (newY > oldY) {
      newDirection = 's';
    } else if (newY < oldY) {
      newDirection = 'n';
    }

    const newIsWalking = oldX !== newX || oldY !== newY;

    if (newDirection !== this.direction || newIsWalking !== this.isWalking) {
      const action = newIsWalking ? 'w' : 's';
      const textureId = this.getTextureId();
      this.display.textures = this.textures[textureId].animations[`${textureId}-${newDirection}${action}`];
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
    // The collisions are only checked for four points at the baseline of the PC,
    return [
      { x: -(this.display.width / 2 - PCView.COLL_X_OFFSET), y: -PCView.COLL_Y_OFFSET },
      { x: -(this.display.width / 2 - PCView.COLL_X_OFFSET), y: 0 },
      { x: this.display.width / 2 - PCView.COLL_X_OFFSET, y: -PCView.COLL_Y_OFFSET },
      { x: this.display.width / 2 - PCView.COLL_X_OFFSET, y: 0 },
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
        left = x - PCView.SPRITE_W;
        right = (x - PCView.SPRITE_W) + PCView.ACTION_HITBOX_W;
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
        left = x - (PCView.ACTION_HITBOX_H / 2);
        right = x + (PCView.ACTION_HITBOX_H / 2);
        break;
      case 's':
        top = y - PCView.ACTION_HITBOX_W / 4;
        bottom = (y - PCView.ACTION_HITBOX_W / 4) + PCView.ACTION_HITBOX_W;
        left = x - (PCView.ACTION_HITBOX_H / 2);
        right = x + (PCView.ACTION_HITBOX_H / 2);
        break;
      default:
        throw new Error(`Invalid direction ${this.direction}`);
    }

    return {
      top, right, bottom, left,
    };
  }

  showActionHitbox() {
    const hitbox = this.getActionHitbox();
    this.hitboxDisplay.width = Math.abs(hitbox.right - hitbox.left);
    this.hitboxDisplay.height = Math.abs(hitbox.bottom - hitbox.top);
    this.hitboxDisplay.position.x = hitbox.left;
    this.hitboxDisplay.position.y = hitbox.top;
    this.hitboxDisplay.visible = true;
    this.positionMarker.visible = true;

    // Show for one second
    clearTimeout(this.hitboxTimeout);
    this.hitboxTimeout = setTimeout(() => {
      this.hitboxDisplay.visible = false;
      this.positionMarker.visible = false;
    }, 1000);
  }
}

PCView.SPRITE_H = 156;
PCView.SPRITE_W = 72;
PCView.SPRITE_ANIMATION_SPEED = 0.3;
PCView.ACTION_HITBOX_H = 150;
PCView.ACTION_HITBOX_W = 200;
PCView.COLL_X_OFFSET = 10;
PCView.COLL_Y_OFFSET = 10;

module.exports = PCView;
