class LiveTestManager {
  constructor() {
    this.testers = {};
  }

  registerTester(type, tester) {
    this.testers[type] = tester;
  }

  run(context, testDefinition) {
    const definitionParts = testDefinition.match(/^([^-]+)(-(.+))?$/);
    const testType = definitionParts[1];
    const testArgs = definitionParts[3];
    if (this.testers[testType] === undefined) {
      throw new Error(`Unknown test type: ${testType}`);
    }
    return this.testers[testType].run(context, testArgs);
  }
}

if (window && !window.IMAGINARY) {
  window.IMAGINARY = {};
}

if (window && window.IMAGINARY.liveTestManager === undefined) {
  window.IMAGINARY.liveTestManager = new LiveTestManager();
}

module.exports = LiveTestManager;
