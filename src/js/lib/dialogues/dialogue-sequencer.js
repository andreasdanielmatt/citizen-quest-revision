const EventEmitter = require('events');
const DialogueIterator = require('./dialogue-iterator');
const DialogueSequencerTextState = require('./dialogue-sequencer-states/text-state');

class DialogueSequencer {
  constructor(dialogueOverlay) {
    this.dialogueOverlay = dialogueOverlay;
    this.dialogue = null;
    this.dialogueIterator = null;
    this.uiState = null;

    this.events = new EventEmitter();
  }

  setUiState(state) {
    if (this.uiState) {
      this.uiState.onEnd();
    }
    this.uiState = state;
    if (this.uiState) {
      this.uiState.onBegin();
    }
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

  play(dialogue, context, options) {
    this.dialogue = dialogue;
    this.dialogueOverlay.setTopTitle(options.top || null);
    this.dialogueIterator = new DialogueIterator(dialogue, context);
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
    this.events.emit('end');
    this.terminate();
  }

  action() {
    if (this.uiState) {
      this.uiState.onAction();
    }
  }

  // eslint-disable-next-line class-methods-use-this
  handledByUI(node) {
    return node && node.type === 'statement';
  }

  terminate() {
    this.setUiState(null);
    this.dialogueOverlay.hide();
    this.dialogueIterator = null;
    this.dialogue = null;
  }
}

module.exports = DialogueSequencer;
