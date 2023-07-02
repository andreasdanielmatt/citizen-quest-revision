export class DialogueSequencerState {
  constructor(dialogueSequencer) {
    this.dialogueSequencer = dialogueSequencer;
    this.dialogueOverlay = dialogueSequencer.dialogueOverlay;
    this.dialogueIterator = dialogueSequencer.dialogueIterator;
    this.activeNode = this.dialogueIterator.getActiveNode();
  }

  onBegin() {

  }

  onAction() {

  }
}

export class DialogueSequencerThenTextState extends DialogueSequencerState {
  constructor(dialogueSequencer, responseId) {
    super(dialogueSequencer);
    this.responseId = responseId;
  }

  onBegin() {
    this.speechDone = false;
    const response = this.dialogueIterator.getEnabledResponses()[this.responseId];
    this.dialogueOverlay.showSpeech(response.thenText);
    this.dialogueOverlay.events.once('speechComplete', () => {
      this.speechDone = true;
      this.dialogueOverlay.showPressToContinue();
    });
  }

  onAction() {
    if (this.speechDone) {
      this.dialogueOverlay.hideSpeech();
      this.dialogueSequencer.endUi(this.responseId);
    } else {
      this.dialogueOverlay.speedUpSpeech();
    }
  }
}

export class DialogueSequencerResponseState extends DialogueSequencerState {
  constructor(dialogueSequencer) {
    super(dialogueSequencer);
    this.responses = this.dialogueIterator.getEnabledResponses();
  }

  onBegin() {
    this.dialogueOverlay.showResponseOptions(
      Object.fromEntries(this.responses.map((response, i) => [i, response.text]))
    );
  }

  onAction() {
    this.dialogueOverlay.hideResponseOptions();
    this.dialogueOverlay.hideSpeech();
    const responseId = this.dialogueOverlay.selectedOption;
    const selectedResponse = this.responses[responseId];
    if (selectedResponse.thenText) {
      this.dialogueSequencer.setUiState(
        new DialogueSequencerThenTextState(this.dialogueSequencer, responseId)
      );
    } else {
      this.dialogueSequencer.endUi(responseId);
    }
  }
}

export class DialogueSequencerTextState extends DialogueSequencerState {

  onBegin() {
    this.speechDone = false;
    this.dialogueOverlay.showSpeech(this.activeNode.text);
    this.dialogueOverlay.events.once('speechComplete', () => {
      this.speechDone = true;
      const responses = this.dialogueIterator.getEnabledResponses();
      if (responses && responses.length > 0) {
        this.dialogueSequencer.setUiState(
          new DialogueSequencerResponseState(this.dialogueSequencer)
        );
      } else {
        this.dialogueOverlay.showPressToContinue();
      }
    });
  }

  onAction() {
    if (this.speechDone) {
      this.dialogueOverlay.hideSpeech();
      this.dialogueSequencer.endUi();
    } else {
      this.dialogueOverlay.speedUpSpeech();
    }
  }
}
