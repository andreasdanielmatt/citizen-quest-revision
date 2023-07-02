const LogicParser = require('./logic-parser');

/**
 * An interface for the context object passed to the dialogue iterator.
 * @interface
 */
// eslint-disable-next-line no-unused-vars
class DialogueIteratorContextInterface {
  /**
   * Returns a random number between 0 and max.
   * @param {number} max
   */
  // eslint-disable-next-line no-unused-vars,class-methods-use-this
  random(max) {
    throw new Error('Not implemented');
  }

  /**
   * Returns true if the specified flag is set.
   *
   * @param {string} flag
   * @returns {boolean}
   */
  // eslint-disable-next-line no-unused-vars,class-methods-use-this
  hasFlag(flag) {
    throw new Error('Not implemented');
  }

  /**
   * Sets the specified flag.
   *
   * @param {string} flag
   * @returns {boolean}
   */
  // eslint-disable-next-line no-unused-vars,class-methods-use-this
  setFlag(flag) {
    throw new Error('Not implemented');
  }
}

/**
 * Iterates through a dialogue tree.
 */
class DialogueIterator {
  /**
   * Creates a new iterator for the given dialogue.
   *
   * @param {Dialogue} dialogue
   * @param {DialogueIteratorContextInterface} context
   */
  constructor(dialogue, context) {
    this.dialogue = dialogue;
    this.context = context;
    this.conditionParser = new LogicParser(context);
    this.reset();
  }

  /**
   * Resets the iterator to the beginning of the dialogue.
   */
  reset() {
    this.activeNode = this.dialogue.root;
  }

  /**
   * Returns true if the iterator has reached the end of the dialogue.
   * @returns {boolean}
   */
  isEnd() {
    return this.activeNode === null;
  }

  /**
   * Returns the current active node.
   * @returns {*|null}
   */
  getActiveNode() {
    return this.activeNode;
  }

  /**
   * Returns responses in the current active node that have all their conditions met.
   *
   * @returns {Array|null}
   */
  getEnabledResponses() {
    if (this.activeNode === null) {
      return null;
    }

    if (!this.activeNode.responses) {
      return null;
    }

    return this.activeNode.responses
      .filter(response => !response.cond || this.conditionParser.evaluate(response.cond));
  }

  /**
   * Returns the response with the given ID in the active node.
   *
   * @param {string} responseId
   * @returns {Object|null}
   */
  getResponse(responseId) {
    if (this.activeNode === null) {
      return null;
    }

    if (!this.activeNode.responses) {
      return null;
    }

    return this.activeNode.responsesById[responseId];
  }

  /**
   * Advances the iterator to the next node.
   *
   * @throws Error if the active node type is unknown.
   */
  next() {
    if (this.activeNode === null) {
      return;
    }

    if (this.activeNode.responses && this.activeNode.responses.length > 0) {
      throw new Error(`Can't use next() on a node of type 'statement' with responses (${this.activeNode.id}:${this.dialogue.root.id})`);
    }

    this.setFlags(this.activeNode.set);

    let transitioned = false;
    switch (this.activeNode.type) {
      case 'statement':
        transitioned = this.nextOnStatement();
        break;
      case 'root':
      case 'first':
        transitioned = this.nextOnFirst();
        break;
      case 'sequence':
        transitioned = this.nextOnSequence();
        break;
      case 'random':
        transitioned = this.nextOnRandom();
        break;
      default:
        throw new Error(`Unknown node type: ${this.activeNode.type} (${this.activeNode.id}:${this.dialogue.root.id})`);
    }
    if (transitioned === false) {
      transitioned = this.nextThroughParent();
    }
    if (transitioned === false) {
      this.activeNode = null;
    }
  }

  nextWithResponse(responseId) {
    if (this.activeNode === null) {
      return;
    }

    if (this.activeNode.responses === undefined) {
      throw new Error(`Can't use nextWithResponse on a node without responses (${this.activeNode.type}:${this.dialogue.root.id})`);
    }

    const response = this.activeNode.responsesById[responseId];
    if (!response) {
      throw new Error(`Unknown response id: ${responseId} (${this.activeNode.id}:${this.dialogue.root.id})`);
    }

    this.setFlags(this.activeNode.set);
    this.setFlags(response.set);
    if (response.then) {
      this.goTo(response.then);
      return;
    }

    if (!this.nextOnStatement()) {
      this.activeNode = null;
    }
  }

  /**
   * Jumps to a node identified by its id.
   *
   * @private
   * @throws Error if the node id is not found.
   * @param {string} nodeId
   */
  goTo(nodeId) {
    const nextNode = this.dialogue.getNode(nodeId);
    if (nextNode === undefined) {
      throw new Error(`Can't find node id: ${nodeId} (active node = ${this.activeNode}:${this.dialogue.root.id})`);
    }
    this.activeNode = nextNode;
  }

  getEnabledItems(items) {
    if (!items) return [];
    return items.filter((item) => {
      try {
        return (item.cond === undefined || items.cond === null || item.cond.trim() === ''
          || this.conditionParser.evaluate(item.cond));
      } catch (e) {
        throw new Error(`Error parsing condition: ${item.cond} (${this.activeNode.id}:${this.dialogue.root.id}): ${e.message}`);
      }
    });
  }

  setFlags(flags) {
    if (!flags) return;
    flags.forEach((flag) => {
      this.context.setFlag(flag);
    });
  }

  /**
   * Jumps to the next node when the active node is of type 'first'
   *
   * @private
   * @returns {boolean} true if the transition to the next node was successful.
   */
  nextOnFirst() {
    const matchingItems = this.getEnabledItems(this.activeNode.items);
    this.activeNode = matchingItems.length > 0 ? matchingItems[0] : null;
    return true;
  }

  /**
   * Jumps to the next node when the active node is of type 'sequence'
   *
   * @private
   * @returns {boolean} true if the transition to the next node was successful.
   */
  nextOnSequence() {
    const matchingItems = this.getEnabledItems(this.activeNode.items);
    if (matchingItems.length > 0) {
      [this.activeNode] = matchingItems;
      return true;
    }
    return false;
  }

  /**
   * Jumps to the next node when the active node is of type 'random'
   *
   * @private
   * @returns {boolean} true if the transition to the next node was successful.
   */
  nextOnRandom() {
    const matchingItems = this.getEnabledItems(this.activeNode.items);
    if (matchingItems.length > 0) {
      const index = this.context.random(matchingItems.length);
      this.activeNode = matchingItems[index];
      return true;
    }
    return false;
  }

  /**
   * Jumps to the next node when the active node is of type 'statement'
   *
   * @private
   * @returns {boolean} true if the transition to the next node was successful.
   */
  nextOnStatement() {
    if (this.activeNode.then) {
      this.goTo(this.activeNode.then);
      return true;
    }
    return false;
  }

  /**
   * Jumps to the next node by traversing the parent nodes.
   *
   * @private
   * @returns {boolean} true if the transition to the next node was successful.
   */
  nextThroughParent() {
    let currentParent = this.activeNode.parent;
    let currentChild = this.activeNode;
    while (currentParent) {
      if (currentParent.type === 'sequence') {
        const matchingItems = this.getEnabledItems(currentParent.items);
        const index = matchingItems.indexOf(currentChild);
        if (index < matchingItems.length - 1) {
          this.activeNode = matchingItems[index + 1];
          return true;
        }
      }
      if (currentParent.then) {
        this.goTo(currentParent.then);
        return true;
      }
      currentChild = currentParent;
      currentParent = currentParent.parent;
    }
    return false;
  }
}

module.exports = DialogueIterator;
