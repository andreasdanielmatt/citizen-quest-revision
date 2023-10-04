/* eslint-disable no-bitwise */

/**
 * A bitvector implementation that uses a Uint32Array for storage
 */
class BitVector {
  constructor(numBits) {
    this.length = numBits;
    this.data = new Uint32Array(Math.ceil(numBits / 32));
  }

  set(idx, value) {
    const bigIndex = Math.floor(idx / 32);
    const smallIndex = idx % 32;

    if (value) {
      this.data[bigIndex] |= (1 << smallIndex);
    } else {
      this.data[bigIndex] &= ~(1 << smallIndex);
    }
  }

  get(idx) {
    const bigIndex = Math.floor(idx / 32);
    const smallIndex = idx % 32;

    const value = this.data[bigIndex] & (1 << smallIndex);

    // we convert to boolean to make sure the result is always 0 or 1,
    // instead of what is returned by the mask
    return value !== 0;
  }
}

module.exports = BitVector;
