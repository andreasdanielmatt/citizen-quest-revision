const { I18nTextAdapter } = require('../helpers/i18n');
const Countdown = require('./countdown');
const QuestOverlay = require('./quest-overlay');
const TextScreen = require('./text-screen');
const DialogueOverlay = require('./dialogue-overlay');
const ScoringOverlay = require('./scoring-overlay');
const TitleOverlay = require('./title-overlay');
const IntroScreen = require('./intro-screen');
const DecisionScreen = require('./decision-screen');

class PlayerOverlayManager {
  constructor(config, lang, playerId) {
    this.config = config;
    this.lang = lang;
    this.playerId = playerId;

    const width = this.config?.game?.playerAppWidth ?? 1024;
    const height = this.config?.game?.playerAppHeight ?? 768;
    this.screenRatio = width / height;
    this.fontRatio = this.config?.game?.playerAppFontRatio ?? 0.0175;

    this.$element = $('<div></div>')
      .addClass('player-app')
      .addClass(`player-${playerId}`);

    this.$pixiWrapper = $('<div></div>')
      .addClass('pixi-wrapper')
      .appendTo(this.$element);

    this.$storylineBar = $('<div></div>')
      .addClass('storyline-bar')
      .appendTo(this.$element)
      .hide();

    this.$decisionLabel = $('<div></div>')
      .addClass('decision-label')
      .appendTo(this.$storylineBar);

    this.decisionLabelI18n = new I18nTextAdapter((text) => {
      this.$decisionLabel.html(text);
    }, this.lang);

    this.introScreen = null;
    this.endingScreen = null;

    this.countdown = new Countdown();
    this.countdown.$element.appendTo(this.$element);
    this.countdown.hide();

    this.questOverlay = new QuestOverlay(this.config, this.lang);
    this.$element.append(this.questOverlay.$element);

    this.textScreen = new TextScreen(this.config, this.lang);
    this.$element.append(this.textScreen.$element);

    this.dialogueOverlay = new DialogueOverlay(this.config, this.lang);
    this.$element.append(this.dialogueOverlay.$element);

    this.scoringOverlay = new ScoringOverlay(this.config);
    this.$element.append(this.scoringOverlay.$element);

    this.titleOverlay = new TitleOverlay(this.config, this.lang);
    this.$element.append(this.titleOverlay.$element);
    this.titleOverlay.show();

    $(window).on('resize', () => {
      this.handleResize();
    });
  }

  refresh() {
    this.handleResize();
  }

  handleResize() {
    this.$element.fillWithAspect(this.screenRatio);
    this.$element.css('font-size', `${(this.$element.width() * this.fontRatio).toFixed(3)}px`);
  }

  setLang(lang) {
    this.lang = lang;

    this.titleOverlay.setLang(this.lang);
    this.dialogueOverlay.setLang(this.lang);
    this.textScreen.setLang(this.lang);
    this.questOverlay.setLang(this.lang);
    this.decisionLabelI18n.setLang(this.lang);
    if (this.introScreen) {
      this.introScreen.setLang(this.lang);
    }
    if (this.endingScreen) {
      this.endingScreen.setLang(this.lang);
    }
  }

  showIntroScreen(introText) {
    this.hideIntroScreen();
    this.introScreen = new IntroScreen(this.config, this.lang);
    this.$element.append(this.introScreen.$element);
    this.introScreen.showIntro(introText);
  }

  hideIntroScreen() {
    if (this.introScreen) {
      this.introScreen.$element.remove();
      this.introScreen = null;
    }
  }

  showDefaultPrompt() {
    this.questOverlay.showDefaultPrompt();
  }

  showEndingScreen(endingText, classes) {
    this.endingScreen = new DecisionScreen(this.config, this.lang);
    this.$element.append(this.endingScreen.$element);
    this.endingScreen.showDecision(endingText, classes);
  }

  hideEndingScreen() {
    if (this.endingScreen) {
      this.endingScreen.$element.remove();
      this.endingScreen = null;
    }
  }

  showTextScreen(text) {
    this.textScreen.setText(text);
    this.textScreen.show();
  }

  hideTextScreen() {
    this.textScreen.hide();
    this.textScreen.setText('');
  }
}

module.exports = PlayerOverlayManager;
