const DialogueSequencerState = require('./dialogue-sequencer-state');
const DialogueSequencerThenTextState = require('./then-state');

class DialogueSequencerResponseState extends DialogueSequencerState {
  constructor(dialogueSequencer) {
    super(dialogueSequencer);
    this.responses = this.dialogueIterator.getEnabledResponses();
  }

  onBegin() {
    this.dialogueOverlay.showResponseOptions(
      Object.fromEntries(this.responses.map(
        (response) => [response.id, [response.text, response.class || null]]
      ))
    );
  }

  onAction() {
    this.dialogueOverlay.hideResponseOptions();
    this.dialogueOverlay.hideSpeech();
    const responseId = this.dialogueOverlay.getSelectedResponseId();
    const selectedResponse = this.dialogueIterator.getResponse(responseId);
    if (selectedResponse.thenText) {
      this.dialogueSequencer.setUiState(
        new DialogueSequencerThenTextState(this.dialogueSequencer, responseId)
      );
    } else {
      this.dialogueSequencer.endUi(responseId);
    }
  }
}

module.exports = DialogueSequencerResponseState;
