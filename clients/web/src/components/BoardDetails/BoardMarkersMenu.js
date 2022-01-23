import React from "react";
import Popover from "@material-ui/core/Popover";

import {
  MARKER_MENU_ANCHOR_ID,
  MARKER_MENU_ANCHOR_PX_RADIUS,
} from "./lib/utils";
import cx from "lib/classnames";

import BoardMarker from "./BoardMarker";
import BoardMarkersMenuContent from "./BoardMarkersMenuContent";

const popoverId = "board-markers-menu-popover";

function BoardMarkersMenu({
  beginNewCalendarEvent,
  beginNewNote,
  menuLocation,
  setMenuLocation,
}) {
  const showMenu = !!menuLocation.anchorEl;

  const handleMenuClose = () => {
    setMenuLocation({
      ...menuLocation,
      anchorEl: null,
    });
  };

  const handleNewNoteClick = () => {
    beginNewNote();
    handleMenuClose();
  };

  const handleAddToCalendarClick = () => {
    beginNewCalendarEvent();
    handleMenuClose();
  };

  return (
    <div className="board-markers-menu relative">
      <div
        id={MARKER_MENU_ANCHOR_ID}
        aria-describedby={popoverId}
        className={cx(
          "absolute",
          "transition-opacity",
          showMenu ? "opacity-100" : "opacity-0"
        )}
        style={{
          // style attribute here because marker size needs to be static
          width: `${MARKER_MENU_ANCHOR_PX_RADIUS * 2}px`,
          height: `${MARKER_MENU_ANCHOR_PX_RADIUS * 2}px`,
        }}
      >
        <BoardMarker />
      </div>
      <Popover
        id={popoverId}
        open={showMenu}
        anchorEl={showMenu && menuLocation.anchorEl}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <BoardMarkersMenuContent
          handleAddToCalendarClick={handleAddToCalendarClick}
          handleNewNoteClick={handleNewNoteClick}
        />
      </Popover>
    </div>
  );
}

export default BoardMarkersMenu;
