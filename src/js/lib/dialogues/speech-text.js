/**
 * Copyright (c) 2023 by Drew Conley (https://codepen.io/punkydrewster713/pen/zYKdywP)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software
 * and associated documentation files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge, publish, distribute,
 * sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or
 * substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
 * BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * Modified by Eric Londaits for IMAGINARY gGmbH.
 * Copyright (c) 2023 IMAGINARY gGmbH
 */
const EventEmitter = require('events');

class SpeechText {
  constructor() {
    this.$element = $('<div></div>')
      .addClass('speech-text');

    this.isSpace = /\s/;
    this.timedReveal = this.timedReveal.bind(this);
    this.revealCharacterTimeout = null;
    this.events = new EventEmitter();
    this.speedFactor = 1;
    this.revealComplete = false;
  }

  /**
   * Private method to reveal a character
   *
   * @private
   * @param {Object} character
   * @param {HTMLElement} character.span
   * @param {Array} character.classes
   */
  revealCharacter(character) {
    character.span.classList.add('revealed');
    character.classes.forEach((c) => {
      character.span.classList.add(c);
    });
  }

  /**
   * Private method to reveal a list of characters with a delay between each
   *
   * @private
   * @param {Array} Array of characters with the following properties:
   * - span {HTMLElement} The span $element to be revealed
   * - isSpace {Boolean} Whether or not the character is a space
   * - delayAfter {Number} Delay after the character is revealed
   * - classes {Array} Array of classes to be added to the character
   * - stop {Boolean} Whether or not to stop after the character
   */
  timedReveal(list) {
    const next = list.splice(0, 1)[0];
    this.revealCharacter(next);
    const delay = next.isSpace && !next.pause ? 0 : next.delayAfter;

    if (list.length > 0) {
      this.revealCharacterTimeout = setTimeout(() => {
        this.timedReveal(list);
      }, delay * this.speedFactor);
    } else {
      this.onComplete();
    }
  }

  /**
   * Set the text to be displayed
   *
   * @param lines {Array} Array of objects with the following properties:
   * - speed {Number} (optional) Speed of the text in milliseconds
   * - string {String} Text to be displayed
   * - classes {Array} (optional) Array of classes to be added to the text
   * - stop {Boolean} (optional) Whether or not to stop after the line
   */
  showText(lines) {
    this.clear();

    this.characters = [];
    lines.forEach((line, index) => {
      if (index < lines.length - 1) {
        line.string += ' '; // Add a space between lines
      }
      line.string.split('').forEach((character) => {
        const span = document.createElement('span');
        span.textContent = character;
        if (character === '\n') {
          this.$element.append($('<div>').addClass('break'));
        } else {
          this.$element.append(span);
          this.characters.push({
            span,
            isSpace: this.isSpace.test(character) && !line.pause,
            delayAfter: line.speed || SpeechText.Speeds.normal,
            classes: line.classes || [],
          });
        }
      });
    });

    this.resume();
  }

  /**
   * Stop the reveal of the text
   */
  stop() {
    clearTimeout(this.revealCharacterTimeout);
    this.speedFactor = 1;
  }

  /**
   * Resume the reveal of the text
   */
  resume() {
    clearTimeout(this.revealCharacterTimeout);
    this.revealCharacterTimeout = setTimeout(() => {
      this.timedReveal(this.characters);
    }, 600);
  }

  /**
   * Clear the text
   */
  clear() {
    this.stop();
    this.$element.empty();
    this.revealComplete = false;
  }

  /**
   * Reveal all characters immediately
   */
  revealAll() {
    this.stop();
    this.characters.forEach((c) => {
      this.revealCharacter(c);
    });
    this.onComplete();
  }

  speedUp() {
    this.speedFactor = 0.2;
  }

  onComplete() {
    this.revealComplete = true;
    this.events.emit('complete');
  }
}

SpeechText.Speeds = {
  pause: 500,
  slow: 120,
  normal: 60,
  fast: 40,
  superFast: 10,
};

module.exports = SpeechText;
