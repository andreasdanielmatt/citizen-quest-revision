const { expect } = require('chai');
const LogicParser = require('../src/js/lib/dialogues/logic-parser');
const FlagStore = require('../src/js/lib/dialogues/flag-store');

describe('LogicParser', () => {
  let parser = null;
  let context = null;
  before(() => {
    context = {
      flags: new FlagStore(),
    };
    parser = new LogicParser(context);
  });

  beforeEach(() => {
    context.flags.clear();
  });

  describe('terms', () => {
    it('should evaluate number literals', () => {
      expect(parser.evaluate('0')).to.equal(0);
      expect(parser.evaluate('1')).to.equal(1);
      expect(parser.evaluate('5')).to.equal(5);
    });

    it('should evaluate flags', () => {
      parser.context.flags.touch('a');
      expect(parser.evaluate('a')).to.equal(1);
      expect(parser.evaluate('b')).to.equal(0);
    });
  });

  describe('logic operators', () => {
    it('should evaluate & and |', () => {
      parser.context.flags.touch('a');
      parser.context.flags.touch('b');
      expect(parser.evaluate('a & b')).to.equal(1);
      expect(parser.evaluate('a & c')).to.equal(0);
      expect(parser.evaluate('a | b')).to.equal(1);
      expect(parser.evaluate('a | c')).to.equal(1);
      expect(parser.evaluate('c | d')).to.equal(0);
    });

    it('should handle chains of & and |', () => {
      parser.context.flags.touch('a');
      parser.context.flags.touch('b');
      parser.context.flags.touch('c');
      expect(parser.evaluate('a & b & c')).to.equal(1);
      expect(parser.evaluate('a & b & d')).to.equal(0);
      expect(parser.evaluate('a | b | c')).to.equal(1);
      expect(parser.evaluate('a | d | e')).to.equal(1);
      expect(parser.evaluate('d | e | f')).to.equal(0);
    });

    it('should handle ^', () => {
      parser.context.flags.touch('a');
      expect(parser.evaluate('^a')).to.equal(0);
      expect(parser.evaluate('^b')).to.equal(1);
      expect(parser.evaluate('^(^a)')).to.equal(1);
      expect(parser.evaluate('a | ^a')).to.equal(1);
      expect(parser.evaluate('a | ^b')).to.equal(1);
      expect(parser.evaluate('a & ^a')).to.equal(0);
      expect(parser.evaluate('a & ^b')).to.equal(1);
    });

    it('should handle parentheses', () => {
      parser.context.flags.touch('a');
      parser.context.flags.touch('e');
      expect(parser.evaluate('(a | b | c) & (d | e)')).to.equal(1);
      expect(parser.evaluate('^(a | b | c) & (d | e)')).to.equal(0);
      expect(parser.evaluate('(a | b | c) & (d | f)')).to.equal(0);
      expect(parser.evaluate('^(b | c) & (d | e)')).to.equal(1);
      expect(parser.evaluate('(^a | e) & (^b | f)')).to.equal(1);
      expect(parser.evaluate('^((a | b | c) & (d | f))')).to.equal(1);
    });
  });

  describe('comparison operators', () => {
    it('should compare flags with literals', () => {
      parser.context.flags.touch('a');
      expect(parser.evaluate('a = 1')).to.equal(1);
      expect(parser.evaluate('1 = a')).to.equal(1);
      expect(parser.evaluate('a = 0')).to.equal(0);
      expect(parser.evaluate('0 = a')).to.equal(0);
      expect(parser.evaluate('a != 1')).to.equal(0);
      expect(parser.evaluate('a != 0')).to.equal(1);
      expect(parser.evaluate('a > 0')).to.equal(1);
      expect(parser.evaluate('a > 1')).to.equal(0);
      expect(parser.evaluate('a < 0')).to.equal(0);
      expect(parser.evaluate('a < 1')).to.equal(0);
      expect(parser.evaluate('a >= 0')).to.equal(1);
      expect(parser.evaluate('a >= 1')).to.equal(1);
      expect(parser.evaluate('a <= 0')).to.equal(0);
      expect(parser.evaluate('a <= 1')).to.equal(1);
      expect(parser.evaluate('a < 2')).to.equal(1);
      expect(parser.evaluate('a = 1 & a > 0')).to.equal(1);
      expect(parser.evaluate('a = 1 & a < 0')).to.equal(0);
    });

    it('should compare flags with flags', () => {
      parser.context.flags.touch('a');
      parser.context.flags.touch('b');
      parser.context.flags.set('c', 2);
      expect(parser.evaluate('a = a')).to.equal(1);
      expect(parser.evaluate('a = b')).to.equal(1);
      expect(parser.evaluate('b = a')).to.equal(1);
      expect(parser.evaluate('a = c')).to.equal(0);
      expect(parser.evaluate('a = d')).to.equal(0);
      expect(parser.evaluate('a < b')).to.equal(0);
      expect(parser.evaluate('a <= b')).to.equal(1);
      expect(parser.evaluate('a >= b')).to.equal(1);
      expect(parser.evaluate('a > b')).to.equal(0);
      expect(parser.evaluate('b > a')).to.equal(0);
      expect(parser.evaluate('b < a')).to.equal(0);
      expect(parser.evaluate('c > a')).to.equal(1);
      expect(parser.evaluate('c >= a')).to.equal(1);
      expect(parser.evaluate('a < c')).to.equal(1);
      expect(parser.evaluate('a <= c')).to.equal(1);
    });

    it('should allow mixing comparison and logic operators', () => {
      parser.context.flags.touch('a');
      parser.context.flags.touch('b');
      parser.context.flags.set('c', 2);

      expect(parser.evaluate('a = 1 & a = b')).to.equal(1);
      expect(parser.evaluate('a = 1 & a = c')).to.equal(0);
      expect(parser.evaluate('a = 1 | a = c')).to.equal(1);
      expect(parser.evaluate('^(a = c)')).to.equal(1);
      expect(parser.evaluate('a = 1 & ^(a = c)')).to.equal(1);
      expect(parser.evaluate('a = 1 & b = 1 & c = 2')).to.equal(1);
      expect(parser.evaluate('a = b & b != c & ^(a = c)')).to.equal(1);
    });
  });

  it('should fail with invalid syntax', () => {
    expect(() => parser.evaluate('(a')).to.throw('Mismatched Grouping (unexpected "(")');
    expect(() => parser.evaluate('a & b)')).to.throw('Mismatched Grouping (unexpected closing ")")');
    expect(() => parser.evaluate('test1 * * * test2')).to.throw('Unexpected token "*"');
    expect(() => parser.evaluate('&')).to.throw('Invalid term: &');
    expect(() => parser.evaluate('a &')).to.throw('Invalid term: &');
    expect(() => parser.evaluate('^')).to.throw('Invalid term: ^');
    expect(() => parser.evaluate('a b')).to.throw('Unexpected token "a"');
  });
});
