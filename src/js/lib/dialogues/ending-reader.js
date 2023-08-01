const DialogueIterator = require('./dialogue-iterator');
const { mergeTexts } = require('../helpers/i18n');

function readEnding(dialogue, context) {
  const output = [];
  const iterator = new DialogueIterator(dialogue, context);
  while (!iterator.isEnd()) {
    const activeNode = iterator.getActiveNode();
    if (activeNode.responses !== undefined && activeNode.responses.length > 0) {
      throw new Error('An ending dialogue must only contain statements with no responses');
    }
    if (activeNode.text) {
      output.push(activeNode.text);
    }
    iterator.next();
  }

  return mergeTexts(output, {
    separator: '\n',
  });
}

module.exports = readEnding;
