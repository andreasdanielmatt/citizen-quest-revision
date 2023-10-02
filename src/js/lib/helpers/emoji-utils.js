const EMOJI_REGEX_PATTERN = ':[a-z0-9_+-]+:';

/**
 * Tokenize a string of text, splitting it into an array of strings and emoji tokens.
 *
 * @param {string} text
 * @returns {Array<string>}
 */
function tokenizeEmoji(text) {
  return text.split(new RegExp(`(${EMOJI_REGEX_PATTERN})`, 'gi'));
}

/**
 * Check if a token is an emoji.
 *
 * @param {string} token
 * @returns {boolean}
 */
function isEmoji(token) {
  return token.match(new RegExp(`^${EMOJI_REGEX_PATTERN}$`, 'i')) !== null;
}

/**
 * Get the CSS class for an emoji token.
 *
 * @param {string} token
 * @returns {string}
 */
function getEmojiClass(token) {
  return token.replace(/:/g, '');
}

/**
 * Convert a string that contains emojis into an array of lines for use with the SpeechText class
 *
 * @param {string} text
 * @returns {Array<object>}
 */
function textWithEmojisToSpeechLines(text) {
  const tokens = tokenizeEmoji(text);
  return tokens.map((token) => {
    if (isEmoji(token)) {
      return {
        string: token,
        preClasses: ['emoji', `emoji-${getEmojiClass(token)}`],
        noSplit: true,
      };
    }
    return {
      string: token,
    };
  });
}

/**
 * Convert a text with :emojis: into HTML with spans for each emoji
 */
function textWithEmojisToHtml(text) {
  const tokens = tokenizeEmoji(text);
  return tokens.map((token) => {
    if (isEmoji(token)) {
      return `<span class="emoji emoji-${getEmojiClass(token)}">${token}</span>`;
    }
    return token;
  }).join('');
}

module.exports = {
  tokenizeEmoji,
  isEmoji,
  textWithEmojisToSpeechLines,
  textWithEmojisToHtml,
};
