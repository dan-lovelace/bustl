export const HOME_PAGE = "/";
export const NOT_FOUND_PAGE = "*";

export const ACCOUNT_PAGE = "/account";
export const BOARDS_PAGE = "/photos";
export const BOARD_DETAILS_PAGE = `${BOARDS_PAGE}/:boardId`;
export const BOARD_NOTE_DETAILS_PAGE = `${BOARD_DETAILS_PAGE}/note/:noteId`;
export const NOTES_PAGE = "/notes";
export const LOGIN_PAGE = "/login";
export const LOGOUT_PAGE = "/logout";
export const PROJECTS_PAGE = "/projects";
export const PROJECT_DETAILS_PAGE = `${PROJECTS_PAGE}/:projectId`;
export const PROJECT_NOTE_DETAILS_PAGE = `${PROJECT_DETAILS_PAGE}/note/:noteId`;
export const REMINDERS_PAGE = "/reminders";
export const SIGNUP_PAGE = "/signup";
export const TRASH_PAGE = "/trash";
export const TRASH_BOARD_DETAILS_PAGE = `${TRASH_PAGE}/photos/:boardId`;
export const TRASH_NOTE_DETAILS_PAGE = `${TRASH_PAGE}/notes/:noteId`;

export function openNewTab(to) {
  window.open(to, "_blank") || window.location.replace(to);
}
