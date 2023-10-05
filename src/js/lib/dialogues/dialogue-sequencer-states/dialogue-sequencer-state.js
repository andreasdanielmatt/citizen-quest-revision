/* eslint-disable class-methods-use-this */
class DialogueSequencerState {
  constructor(dialogueSequencer) {
    this.dialogueSequencer = dialogueSequencer;
    this.dialogueOverlay = dialogueSequencer.dialogueOverlay;
    this.dialogueIterator = dialogueSequencer.dialogueIterator;
    this.activeNode = this.dialogueIterator ? this.dialogueIterator.getActiveNode() : null;
  }

  onBegin() {

  }

  onAction() {

  }

  onEnd() {

  }
}

module.exports = DialogueSequencerState;
