const { expect } = require('chai');
const LogicParser = require('../src/js/lib/dialogues/logic-parser');

class TestContext {
  constructor() {
    this.flags = {};
  }

  hasFlag(flag) {
    return this.flags[flag];
  }

  setFlag(flag) {
    this.flags[flag] = true;
  }

  clearFlags() {
    this.flags = {};
  }
}

describe('LogicParser', () => {
  let parser = null;
  let context = null;
  before(() => {
    context = new TestContext();
    parser = new LogicParser(context);
  });

  beforeEach(() => {
    context.clearFlags();
  });

  describe('terms', () => {
    it('should evaluate number literals', () => {
      expect(parser.evaluate('0')).to.equal(0);
      expect(parser.evaluate('1')).to.equal(1);
      expect(parser.evaluate('5')).to.equal(5);
    });

    it('should evaluate flags', () => {
      parser.context.setFlag('a');
      expect(parser.evaluate('a')).to.be.true;
      expect(parser.evaluate('b')).to.be.false;
    });
  });

  describe('logic operators', () => {
    it('should evaluate & and |', () => {
      parser.context.setFlag('a');
      parser.context.setFlag('b');
      expect(parser.evaluate('a & b')).to.be.true;
      expect(parser.evaluate('a & c')).to.be.false;
      expect(parser.evaluate('a | b')).to.be.true;
      expect(parser.evaluate('a | c')).to.be.true;
      expect(parser.evaluate('c | d')).to.be.false;
    });

    it('should handle chains of & and |', () => {
      parser.context.setFlag('a');
      parser.context.setFlag('b');
      parser.context.setFlag('c');
      expect(parser.evaluate('a & b & c')).to.be.true;
      expect(parser.evaluate('a & b & d')).to.be.false;
      expect(parser.evaluate('a | b | c')).to.be.true;
      expect(parser.evaluate('a | d | e')).to.be.true;
      expect(parser.evaluate('d | e | f')).to.be.false;
    });

    it('should handle ^', () => {
      parser.context.setFlag('a');
      expect(parser.evaluate('^a')).to.be.false;
      expect(parser.evaluate('^b')).to.be.true;
      expect(parser.evaluate('^(^a)')).to.be.true;
      expect(parser.evaluate('a | ^a')).to.be.true;
      expect(parser.evaluate('a | ^b')).to.be.true;
      expect(parser.evaluate('a & ^a')).to.be.false;
      expect(parser.evaluate('a & ^b')).to.be.true;
    });

    it('should handle parentheses', () => {
      parser.context.setFlag('a');
      parser.context.setFlag('e');
      expect(parser.evaluate('(a | b | c) & (d | e)')).to.be.true;
      expect(parser.evaluate('^(a | b | c) & (d | e)')).to.be.false;
      expect(parser.evaluate('(a | b | c) & (d | f)')).to.be.false;
      expect(parser.evaluate('^(b | c) & (d | e)')).to.be.true;
      expect(parser.evaluate('(^a | e) & (^b | f)')).to.be.true;
      expect(parser.evaluate('^((a | b | c) & (d | f))')).to.be.true;
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
