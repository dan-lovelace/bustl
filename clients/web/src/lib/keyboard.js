export function isEnterKey(event) {
  const keyCode = event.code || event.key;
  const validCodes = ["Enter", "NumpadEnter"];

  return validCodes.includes(keyCode);
}

export function isTabKey(event) {
  const keyCode = event.code || event.key;

  return keyCode === "Tab";
}
