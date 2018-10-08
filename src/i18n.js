const fs = require('fs');
const path = require('path');

const enLanguage = require('../config/languages/en.json');
const logger = require('./modules/log').getLogger();

const scopes = {};

const VARS_FINDER_EXPRESSION_LEFT = '\\{\\{\\s*';
const VARS_FINDER_EXPRESSION_RIGHT = '\\s*\\}\\}';

/**
 * Returns regex expression to find patterns like {{ test }} in a string
 * @param {String} varName Name of variable to find with regex
 */
function craftRegexExpression(varName) {
  return new RegExp(VARS_FINDER_EXPRESSION_LEFT + varName + VARS_FINDER_EXPRESSION_RIGHT, 'g');
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

function addScope(scopeName, scope) {
  logger.debug(`adding scope "${scopeName}"...`);

  scopes[scopeName] = {};

  Object.keys(enLanguage[scopeName]).forEach((key) => {
    if (scope[key]) {
      scopes[scopeName][key] = scope[key];
    } else {
      scopes[scopeName][key] = enLanguage[scopeName][key];
    }
  });
}

/**
 * Initialises i18n with given language. If certain translations are missing, english
 * is used.
 * @param {String} language Language abbreviation of desired language
 */
exports.init = (language) => {
  logger.debug(`initialising i18n for language "${language}"...`);

  const targetLanguage = readLanguageFile(language);

  // add scopes from language file
  Object.keys(enLanguage).forEach((scopeName) => {
    addScope(scopeName, targetLanguage[scopeName]);
  });

  logger.debug('i18n init finished!');
};

exports.getScope = scope => ({
  t: (key, vars) => {
    let result = scopes[scope][key];

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
