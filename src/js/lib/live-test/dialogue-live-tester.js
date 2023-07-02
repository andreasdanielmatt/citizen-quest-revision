const Dialogue = require('../dialogues/dialogue');
const helloWorldDialogue = require(
  '../../../../test/fixtures/dialogues/core/hello-world.dialogue.json');

class DialogueLiveTester {
  // eslint-disable-next-line class-methods-use-this
  async run(playerApp, dialogueId) {
    if (!dialogueId.match(/^[a-z0-9-_]+$/)) {
      throw new Error(`Invalid dialogue ID: ${dialogueId}`);
    }
    const fixturePath = `test/fixtures/dialogues/live/${dialogueId}.json`;
    return fetch(fixturePath, { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error. Status: ${response.status}`);
        }
        return response.json();
      })
      .then((json) => {
        const dialogue = Dialogue.fromJson(json);
        playerApp.playDialogue(dialogue);
      })
      .catch((err) => {
        throw err;
      });
  }
}

if (window && window.IMAGINARY && window.IMAGINARY.liveTestManager) {
  window.IMAGINARY.liveTestManager.registerTester('dialogue', new DialogueLiveTester());
}

module.exports = DialogueLiveTester;
