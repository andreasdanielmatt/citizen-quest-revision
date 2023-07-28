const { ExpressionParser } = require('expressionparser');
const DialogueSchema = require('../../../../specs/dialogue.schema.json');

const num = (result) => {
  if (typeof result !== 'number') {
    throw new Error(`Expected number, found: ${typeof result} ${JSON.stringify(result)}`);
  }

  return result;
};

const str = (result) => {
  if (typeof result !== 'string') {
    throw new Error(`Expected string, found: ${typeof result} ${JSON.stringify(result)}`);
  }

  return result;
};

class LogicParser {
  constructor(context) {
    this.context = context;

    this.language = {
      INFIX_OPS: {
        '<': (a, b) => (num(a()) < num(b()) ? 1 : 0),
        '>': (a, b) => (num(a()) > num(b()) ? 1 : 0),
        '>=': (a, b) => (num(a()) >= num(b()) ? 1 : 0),
        '<=': (a, b) => (num(a()) <= num(b()) ? 1 : 0),
        '=': (a, b) => (num(a()) === num(b()) ? 1 : 0),
        '!=': (a, b) => (num(a()) !== num(b()) ? 1 : 0),
        '&': (a, b) => ((!!num(a()) && !!num(b())) ? 1 : 0),
        '|': (a, b) => ((!!num(a()) || !!num(b())) ? 1 : 0),
      },
      PREFIX_OPS: {
        '^': a => (!num(a()) ? 1 : 0),
        COUNT: a => (this.prefixCount(str(a()))),
      },
      AMBIGUOUS: {},
      PRECEDENCE: [['^', 'COUNT'], ['<', '>', '>=', '<='], ['=', '!='], ['&', '|']],
      LITERAL_OPEN: '"',
      LITERAL_CLOSE: '"',
      GROUP_OPEN: '(',
      GROUP_CLOSE: ')',
      SEPARATOR: ' ',
      SYMBOLS: ['<', '>', '!', '=', '&', '|', '^', '(', ')'],
      termDelegate: this.evaluateTerm.bind(this),
      isCaseInsensitive: false,
    };

    this.parser = new ExpressionParser(this.language);
  }

  evaluate(expression) {
    const stack = this.parser.expressionToRpn(expression);
    const result = this.parser.rpnToValue(stack);
    // return this.parser.expressionToValue(expression);
    if (stack.length !== 0) {
      throw new Error(`Unexpected token "${stack[stack.length - 1]}"`);
    }
    return result;
  }

  static isValidLiteral(term) {
    return term[0] >= '0' && term[0] <= '9';
  }

  static isValidFlag(term) {
    const regExp = new RegExp(DialogueSchema.definitions.flag_id.pattern);
    return regExp.test(term);
  }

  evaluateTerm(term) {
    if (LogicParser.isValidLiteral(term)) {
      return parseInt(term, 10);
    }
    if (LogicParser.isValidFlag(term)) {
      return this.context.flags.value(term);
    }
    throw new Error(`Invalid term: ${term}`);
  }

  prefixCount(flagPrefix) {
    const flags = Object.entries(this.context.flags.all())
      .filter(([, value]) => value > 0)
      .map(([key]) => key);

    return flags.reduce((count, flag) => {
      if (flag.startsWith(flagPrefix)) {
        return count + 1;
      }
      return count;
    }, 0);
  }
}

module.exports = LogicParser;
