const Dialogue = require('./dialogue');

function emptyDialogue(id) {
  return Dialogue.fromJson({
    id,
    items: [{
      text: '...',
    }],
  });
}

function safeBuildDialogueFromItems(id, items) {
  try {
    if (items.length === 0) {
      console.error(`Dialogue with id ${id} has no items`);
      return emptyDialogue(id);
    }
    return Dialogue.fromJson({
      id,
      items,
    });
  } catch (e) {
    if (e.errors) {
      const errorText = [];
      errorText.push(`Error parsing dialogue with id ${id}:`);
      e.errors.forEach((error) => {
        errorText.push(`- ${error.instancePath} : ${error.message}`);
      });
      console.error(errorText.join('\n'));
    }
    return emptyDialogue(id);
  }
}

module.exports = safeBuildDialogueFromItems;
