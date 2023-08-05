/* globals PIXI, TWEEN */
const Fader = require('../helpers-pixi/fader');

class MoodBalloon {
  constructor(characterView) {
    this.characterView = characterView;
    this.display = this.createSprite();
    this.moodIconDisplay = this.createMoodIconSprite();
    this.display.addChild(this.moodIconDisplay);

    this.characterView.display.addChild(this.display);
    this.fader = new Fader(this.display);
  }

  createSprite() {
    const sprite = new PIXI.AnimatedSprite(this.characterView.textures['mood-balloon'].animations['mood-balloon-in']);
    sprite.anchor.set(0.5, 1);
    sprite.position.set(
      this.characterView.display.width * 0.25,
      -this.characterView.display.height * 0.95
    );
    sprite.visible = false;
    sprite.alpha = 0;
    sprite.loop = false;
    sprite.animationSpeed = 0.75;

    return sprite;
  }

  createMoodIconSprite() {
    const sprite = new PIXI.Sprite(this.characterView.textures['mood-icons'].textures['mood-icon-exclamation']);
    sprite.anchor.set(0.5, 1);
    sprite.position.set(0, 0);
    sprite.visible = true;

    return sprite;
  }

  setMoodIcon(mood) {
    this.moodIconDisplay.texture = this.characterView.textures['mood-icons'].textures[`mood-icon-${mood}`];
    this.moodIconDisplay.scale = { x: 0, y: 0};
  }

  show(mood) {
    this.fader.fadeIn(200);
    this.display.gotoAndPlay(0);
    this.setMoodIcon(mood);
    this.moodIconTween = new TWEEN.Tween({ scale: 0 })
      .to({ scale: 1 })
      .easing(TWEEN.Easing.Elastic.Out)
      .onUpdate((v) => {
        this.moodIconDisplay.scale = { x: v.scale, y: v.scale };
      })
      .start(100);
    let elapsed = 0;
    const tweenTicker = (time) => {
      elapsed += Math.ceil(time / PIXI.settings.TARGET_FPMS);
      this.moodIconTween.update(elapsed);
    };
    PIXI.Ticker.shared.add(tweenTicker);
    this.moodIconTween.onComplete(() => {
      PIXI.Ticker.shared.remove(tweenTicker);
    });
  }

  hide() {
    this.moodIconTween.stop();
    this.fader.fadeOut(200);
  }
}

module.exports = MoodBalloon;
