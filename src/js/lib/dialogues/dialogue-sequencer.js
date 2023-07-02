const EventEmitter = require('events');
const DialogueIterator = require('./dialogue-iterator');
const { DialogueSequencerTextState } = require('./dialogue-sequencer-states');

class DialogueSequencer {
  constructor(dialogueOverlay) {
    this.dialogueOverlay = dialogueOverlay;
    this.dialogue = null;
    this.dialogueIterator = null;
    this.uiState = null;

    this.events = new EventEmitter();
  }

  setUiState(state) {
    this.uiState = state;
    this.uiState.onBegin();
  }

  endUi(responseId = null) {
    this.uiState = null;
    if (responseId !== null) {
      this.dialogueIterator.nextWithResponse(responseId);
    } else {
      this.dialogueIterator.next();
    }
    this.runUntilInteractivity();
  }

  play(dialogue) {
    const flags = {};
    this.dialogue = dialogue;
    this.dialogueIterator = new DialogueIterator(dialogue, {
      random: max => Math.floor(Math.random() * max),
      hasFlag: flag => flags[flag] !== undefined,
      setFlag: (flag) => { flags[flag] = true; return true; },
    });
    this.runUntilInteractivity();
  }

  runUntilInteractivity() {
    const { dialogueIterator } = this;

    if (!this.handledByUI(dialogueIterator.getActiveNode())) {
      do {
        dialogueIterator.next();
      } while (!dialogueIterator.isEnd() && !this.handledByUI(dialogueIterator.getActiveNode()));
    }

    if (this.handledByUI(dialogueIterator.getActiveNode())) {
      this.setUiState(new DialogueSequencerTextState(this));
    } else {
      this.onDialogueEnd();
    }
  }

  onDialogueEnd() {
    this.dialogueOverlay.hide();
  }

  action() {
    if (this.uiState) {
      this.uiState.onAction();
    }
  }

  handledByUI(node) {
    return node && node.type === 'statement';
  }
}

module.exports = DialogueSequencer;
