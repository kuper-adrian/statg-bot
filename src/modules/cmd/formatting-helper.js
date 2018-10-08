
exports.appendWhitespaces = (string, desiredLength) => {
  const amountOfWhitespacesNeeded = desiredLength - string.length;
  let whitespaces = '';

  for (let i = 0; i <= amountOfWhitespacesNeeded; i += 1) {
    whitespaces += ' ';
  }

  return string + whitespaces;
};

exports.longestWordLength = stringArray =>
  stringArray.sort((a, b) => b.length - a.length)[0].length;
