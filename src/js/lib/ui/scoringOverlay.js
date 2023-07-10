class ScoringOverlay {
  constructor(config) {
    this.config = config;
    this.$element = $('<div></div>')
      .addClass('scoring-overlay');
  }

  show(achievement) {
    $('<div></div>')
      .addClass('achievement')
      .addClass(`achievement-${achievement}`)
      .appendTo(this.$element);
  }
}

module.exports = ScoringOverlay;
