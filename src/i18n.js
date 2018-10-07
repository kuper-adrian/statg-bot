const fs = require('fs');
const path = require('path');

const enLanguage = require('../config/languages/en.json');
const logger = require('./modules/log').getLogger();

const sections = {};

const VARS_FINDER_EXPRESSION_LEFT = /\{\{\s*/;
const VARS_FINDER_EXPRESSION_RIGHT = /\s*\}\}/;

/**
 * Returns regex expression to find patterns like {{ test }} in a string
 * @param {String} varName Name of variable to find with regex
 */
function craftRegexExpression(varName) {
  return VARS_FINDER_EXPRESSION_LEFT + varName + VARS_FINDER_EXPRESSION_RIGHT;
}

/**
 * Tries to read translation file for given language and returns it as object.
 * Returns empty object on error.
 * @param {String} language Language abbreviation
 */
function readLanguageFile(language) {
  const languageFilePath = path.join(__dirname, `../config/languages/${language}.json`);

  try {
    logger.info(`reading language file at ${languageFilePath}`);
    const languageJson = fs.readFileSync(languageFilePath);
    return JSON.parse(languageJson);
  } catch (error) {
    logger.warn(error);
    return {};
  }
}

function addSection(section, targetLanguage) {
  sections[section] = {};

  Object.keys(enLanguage[section]).forEach((key) => {
    if (targetLanguage[section][key]) {
      sections[section][key] = targetLanguage[section][key];
    } else {
      sections[section][key] = enLanguage[section][key];
    }
  });
}

/**
 * Initialises i18n with given language. If certain translations are missing, english
 * is used.
 * @param {String} language Language abbreviation of desired language
 */
exports.init = (language) => {
  const targetLanguage = readLanguageFile(language);

  addSection('commandHandler', targetLanguage);
  addSection('help', targetLanguage);
  addSection('match', targetLanguage);
};

exports.getSection = section => ({
  t: (key, vars) => {
    let result = sections[section][key];

    // if no variable object was provided, return string as is
    if (!vars) {
      return result;
    }

    // otherwise replace placeholder (aka "{{ foo }}") with values
    Object.keys(vars).forEach((varsKey) => {
      result = result.replace(craftRegexExpression(varsKey), vars[varsKey]);
    });

    return result;
  },
});
