export class DialogueSequencerState {
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

export class DialogueSequencerThenTextState extends DialogueSequencerState {
  constructor(dialogueSequencer, responseId) {
    super(dialogueSequencer);
    this.responseId = responseId;
    this.handleSpeechComplete = this.handleSpeechComplete.bind(this);
  }

  onBegin() {
    this.speechDone = false;
    const response = this.dialogueIterator.getResponse(this.responseId);
    this.dialogueOverlay.showSpeech(response.thenText, response.thenClass || null);
    this.dialogueOverlay.events.once('speechComplete', this.handleSpeechComplete);
  }

  handleSpeechComplete() {
    this.speechDone = true;
    this.dialogueOverlay.showPressToContinue();
  }

  onAction() {
    if (this.speechDone) {
      this.dialogueOverlay.hideSpeech();
      this.dialogueSequencer.endUi(this.responseId);
    } else {
      this.dialogueOverlay.speedUpSpeech();
    }
  }

  onEnd() {
    this.dialogueOverlay.events.off('speechComplete', this.handleSpeechComplete);
  }
}

export class DialogueSequencerResponseState extends DialogueSequencerState {
  constructor(dialogueSequencer) {
    super(dialogueSequencer);
    this.responses = this.dialogueIterator.getEnabledResponses();
  }

  onBegin() {
    this.dialogueOverlay.showResponseOptions(
      Object.fromEntries(this.responses.map(
        response => [response.id, [response.text, response.class || null]]
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

export class DialogueSequencerTextState extends DialogueSequencerState {

  constructor(dialogueSequencer) {
    super(dialogueSequencer);
    this.handleSpeechComplete = this.handleSpeechComplete.bind(this);
  }

  handleSpeechComplete() {
    this.speechDone = true;
    const responses = this.dialogueIterator.getEnabledResponses();
    if (responses && responses.length > 0) {
      this.dialogueSequencer.setUiState(
        new DialogueSequencerResponseState(this.dialogueSequencer)
      );
    } else {
      this.dialogueOverlay.showPressToContinue();
    }
  }

  onBegin() {
    this.speechDone = false;
    this.dialogueOverlay.showSpeech(this.activeNode.text, this.activeNode.class || null);
    this.dialogueOverlay.events.once('speechComplete', this.handleSpeechComplete);
  }

  onAction() {
    if (this.speechDone) {
      this.dialogueOverlay.hideSpeech();
      this.dialogueSequencer.endUi();
    } else {
      this.dialogueOverlay.speedUpSpeech();
    }
  }

  onEnd() {
    this.dialogueOverlay.events.off('speechComplete', this.handleSpeechComplete);
  }
}
