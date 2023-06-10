const checkCyclesInDialogue = require('./dialogue-validation-cycles');

function checkDuplicateIds(dialogue) {
  const ids = new Set();
  dialogue.nodes.forEach((node) => {
    if (ids.has(node.id)) {
      throw new Error(`Dialogue contains duplicate node id: ${node.id}`);
    }
    ids.add(node.id);
  });
}

function checkInvalidReferences(dialogue) {
  const validIds = new Set(dialogue.nodes.map(node => node.id));
  dialogue.nodes.forEach((node) => {
    if (node.then && !validIds.has(node.then)) {
      throw new Error(`Dialogue contains invalid reference: ${node.then} in node ${node.id}:${dialogue.root.id}`);
    }
    if (node.resposes) {
      node.responses.forEach((response) => {
        if (response.then && !validIds.has(response.then)) {
          throw new Error(`Dialogue contains invalid reference: ${response.then} in node ${node.id}:${dialogue.root.id}`);
        }
      });
    }
  });
}

function validateDialogue(dialogue) {
  checkDuplicateIds(dialogue);
  checkInvalidReferences(dialogue);
  checkCyclesInDialogue(dialogue);
}

module.exports = { validateDialogue };
