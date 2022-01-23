export function cleanupTitle(string) {
  // remove newline and carriage return characters
  const newlineRegex = /[\n\r]/g;
  let replacedTitle = string.replace(newlineRegex, "");

  // trim leading/trailing space
  replacedTitle = replacedTitle.trim();

  // return result
  return replacedTitle;
}
