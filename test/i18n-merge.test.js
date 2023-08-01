const { expect } = require('chai');
const { mergeTexts } = require('../src/js/lib/helpers/i18n');

describe('i18n', () => {
  describe('mergeTexts', () => {
    it('should merge texts in objects', () => {
      expect(mergeTexts([
        { en: 'A', de: 'a' },
        { en: 'B', de: 'b' },
        { en: 'C', de: 'c' },
      ])).to.deep.equal({
        en: 'ABC',
        de: 'abc',
      });
    });

    it('should allow for missing texts', () => {
      expect(mergeTexts([
        { en: 'A', de: 'a' },
        { en: 'B', it: '1' },
        { en: 'C', de: 'c' },
      ])).to.deep.equal({
        en: 'ABC',
        de: 'ac',
        it: '1',
      });
    });

    it('should merge strings', () => {
      expect(mergeTexts([
        { en: 'A', de: 'a' },
        'b',
        { en: 'C', de: 'c' },
      ])).to.deep.equal({
        en: 'AbC',
        de: 'abc',
      });
    });

    it('should handle an array of strings as input', () => {
      expect(mergeTexts([
        'a',
        'b',
        'c',
      ])).to.equal('abc');
    });

    it('should support prefixes', () => {
      expect(mergeTexts([
        'a',
        'b',
        'c',
      ], { prefix: '<' })).to.equal('<a<b<c');

      expect(mergeTexts([
        { en: 'A', de: 'a' },
        'b',
        { en: 'C', de: 'c', it: '1' },
      ], { prefix: '<' }))
        .to.deep.equal({
          en: '<A<b<C',
          de: '<a<b<c',
          it: '<<b<1',
        });
    });

    it('should support suffixes', () => {
      expect(mergeTexts([
        'a',
        'b',
        'c',
      ], { suffix: '>' })).to.equal('a>b>c>');

      expect(mergeTexts([
        { en: 'A', de: 'a' },
        'b',
        { en: 'C', de: 'c', it: '1' },
      ], { suffix: '>' }))
        .to.deep.equal({
          en: 'A>b>C>',
          de: 'a>b>c>',
          it: '>b>1>',
        });
    });

    it('should support separators', () => {
      expect(mergeTexts([
        'a',
        'b',
        'c',
      ], { separator: ',' })).to.equal('a,b,c');

      expect(mergeTexts([
        { en: 'A', de: 'a' },
        'b',
        { en: 'C', de: 'c', it: '1' },
      ], { separator: ',' }))
        .to.deep.equal({
          en: 'A,b,C',
          de: 'a,b,c',
          it: ',b,1',
        });
    });

    it('should support all three', () => {
      expect(mergeTexts([
        'a',
        'b',
        'c',
      ], { prefix: '<', suffix: '>', separator: ',' })).to.equal('<a>,<b>,<c>');

      expect(mergeTexts([
        { en: 'A', de: 'a' },
        'b',
        { en: 'C', de: 'c', it: '1' },
      ], { prefix: '<', suffix: '>', separator: ',' }))
        .to.deep.equal({
          en: '<A>,<b>,<C>',
          de: '<a>,<b>,<c>',
          it: '<>,<b>,<1>',
        });
    });
  });
});
