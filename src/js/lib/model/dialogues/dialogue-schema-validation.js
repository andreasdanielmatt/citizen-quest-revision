/* eslint-disable no-console */
const Ajv = require('ajv');
const schema = require('../../../../../specs/dialogue.schema.json');

function validateDialogueDefinition(dialogueDefinition) {
  if (!validateDialogueDefinition.validate) {
    const ajv = new Ajv();
    validateDialogueDefinition.validate = ajv.compile(schema);
  }
  const valid = validateDialogueDefinition.validate(dialogueDefinition);
  if (!valid) {
    console.error('Error validating dialogue', validateDialogueDefinition.validate.errors);
    throw new Ajv.ValidationError(validateDialogueDefinition.validate.errors);
  }
  return true;
}

module.exports = { validateDialogueDefinition };
