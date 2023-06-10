class DialogueSequencer {
  constructor() {
    this.dialogue = null;
    this.activeNode = null;
  }

  play(dialogue) {
    this.loadDialogue(dialogue);
  }

  step() {
  }
}

module.exports = DialogueSequencer;
