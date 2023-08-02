const DialogueIterator = require('./dialogue-iterator');
const { mergeTexts } = require('../helpers/i18n');

function readEnding(dialogue, context) {
  const output = [];
  const classes = [];
  const iterator = new DialogueIterator(dialogue, context);
  while (!iterator.isEnd()) {
    const activeNode = iterator.getActiveNode();
    if (activeNode.responses !== undefined && activeNode.responses.length > 0) {
      throw new Error('An ending dialogue must only contain statements with no responses');
    }
    if (activeNode.text) {
      output.push(activeNode.text);
    }
    if (activeNode.class) {
      if (Array.isArray(activeNode.class)) {
        classes.push(...activeNode.class);
      } else if (typeof activeNode.class === 'string') {
        classes.push(activeNode.class);
      }
    }
    iterator.next();
  }

  return [
    mergeTexts(output, {
      separator: '\n',
    }),
    classes,
  ];
}

module.exports = readEnding;
