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
   * @property {FlagStore} flags
   */
}
