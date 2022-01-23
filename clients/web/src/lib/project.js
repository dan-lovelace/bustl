// length of abbreviation
const abbrLen = 2;

function firstLettersFromWords(words) {
  const abbr = [];

  for (let i = 0; i <= abbrLen; i++) {
    abbr.push(words[i][0]);

    if (abbr.length === abbrLen) {
      break;
    }
  }

  return abbr.join("").toUpperCase();
}

export function abbreviateProjectName(str) {
  if (str.length <= abbrLen) {
    // string is shorter than abbreviation setting, capitalize first letter and return rest
    return `${str[0].toUpperCase()}${str.substring(1)}`;
  }

  // get capital letters
  const capitalExp = /[A-Z]/g;
  const result = str.match(capitalExp);
  const allButFirstChar = str.substring(1, abbrLen);

  if (!result) {
    // no capital letters exist, see if more than one word exists
    const words = str.split(" ");

    if (words.length >= abbrLen) {
      // use first letter of each word
      return firstLettersFromWords(words);
    }

    // not enough words exist, capitalize first letter and return rest
    return `${str[0].toUpperCase()}${allButFirstChar}`;
  }

  if (result.length < abbrLen) {
    // some capital letters exist but not enough to return yet, see if there are more words
    const words = str.split(" ");

    if (words.length >= abbrLen) {
      // enough words exist, use first letter of each word
      return firstLettersFromWords(words);
    }
  }

  if (result.length >= abbrLen) {
    // enough capital letters exist, return them
    const abbr = [];
    for (let i = 0; i <= abbrLen; i++) {
      abbr.push(result[i]);

      if (abbr.length === abbrLen) {
        break;
      }
    }

    return abbr.join("");
  }

  // capitalize first letter and return everything else
  const firstChar = str.charAt(0);
  return `${firstChar.toUpperCase()}${allButFirstChar}`;
}
