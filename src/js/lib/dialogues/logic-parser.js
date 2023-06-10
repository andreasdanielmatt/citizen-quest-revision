const { ExpressionParser } = require('expressionparser');
const DialogueSchema = require('../../../../specs/dialogue.schema.json');

class LogicParser {
  constructor(context) {
    this.context = context;

    this.language = {
      INFIX_OPS: {
        // '<': (a, b) => (a() < b()),
        // '>': (a, b) => (a() > b()),
        // '=': (a, b) => (a() === b()),
        // '!=': (a, b) => (a() !== b()),
        // '>=': (a, b) => (a() >= b()),
        // '<=': (a, b) => (a() <= b()),
        '&': (a, b) => (a() && b()),
        '|': (a, b) => (a() || b()),
      },
      PREFIX_OPS: {
        '^': a => !a(),
      },
      AMBIGUOUS: {},
      PRECEDENCE: [['^'], /* ['<', '>', '>=', '<='], ['=', '!='], */ ['&', '|']],
      GROUP_OPEN: '(',
      GROUP_CLOSE: ')',
      SEPARATOR: ' ',
      SYMBOLS: [/* '<', '>', '=', '!=', '>=', '<=', */'&', '|', '^', '(', ')'],
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
      return this.context.hasFlag(term) || false;
    }
    throw new Error(`Invalid term: ${term}`);
  }
}

module.exports = LogicParser;
