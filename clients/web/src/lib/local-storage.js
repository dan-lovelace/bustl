const storagePrefix = "X-";

const BOARD_DETAILS_SIDEBAR_OPEN_KEY = "board-details-sidebar-open";
const PAGE_LAYOUT_SIDEBAR_OPEN_KEY = "page-layout-sidebar-open";

function getStorageSetting(key) {
  try {
    const storageItem = localStorage.getItem(`${storagePrefix}${key}`);

    if (storageItem !== null) {
      return storageItem;
    }
  } catch (e) {}

  return undefined;
}

function setStorageSetting(key, valueString) {
  try {
    localStorage.setItem(`${storagePrefix}${key}`, valueString);
    return true;
  } catch (e) {}

  return false;
}

export function getBoardDetailsSidebarOpen() {
  const openDefault = false;
  const item = getStorageSetting(BOARD_DETAILS_SIDEBAR_OPEN_KEY);

  if (item === undefined) {
    return openDefault;
  }

  return item === "true";
}

export function setBoardDetailsSidebarOpen(value) {
  return setStorageSetting(BOARD_DETAILS_SIDEBAR_OPEN_KEY, value);
}

export function getPageLayoutSidebarOpen() {
  const openDefault = true;
  const item = getStorageSetting(PAGE_LAYOUT_SIDEBAR_OPEN_KEY);

  if (item === undefined) {
    return openDefault;
  }

  return item === "true";
}

export function setPageLayoutSidebarOpen(value) {
  return setStorageSetting(PAGE_LAYOUT_SIDEBAR_OPEN_KEY, value);
}
