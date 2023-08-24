const Dialogue = require('./dialogue');

function safeBuildDialogueFromItems(id, items) {
  try {
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
    return Dialogue.fromJson({
      id,
      items: [{
        text: '...'
      }]
    });
  }
}

module.exports = safeBuildDialogueFromItems;
