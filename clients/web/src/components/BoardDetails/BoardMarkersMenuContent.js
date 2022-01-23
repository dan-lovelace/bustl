import React from "react";
import MenuList from "@material-ui/core/MenuList";
import MenuItem from "@material-ui/core/MenuItem";

import CalendarIcon from "components/Icons/CalendarIcon";
import NoteIcon from "components/Icons/NoteIcon";

function BoardMarkersMenuItem({ children, icon, onClick }) {
  return (
    <MenuItem onClick={onClick}>
      {icon} {children}
    </MenuItem>
  );
}

export default function BoardMarkersMenuContent({
  calendarLabel = "Add to calendar",
  handleAddToCalendarClick,
  handleNewNoteClick,
  noteLabel = "Add note here",
  onSelection,
}) {
  const handleClick = (fn) => (event) => {
    if (onSelection && typeof onSelection === "function") {
      onSelection();
    }

    fn();
  };

  return (
    <MenuList>
      <BoardMarkersMenuItem
        icon={<NoteIcon className="mr-4" />}
        onClick={handleClick(handleNewNoteClick)}
      >
        {noteLabel}
      </BoardMarkersMenuItem>
      <BoardMarkersMenuItem
        icon={<CalendarIcon className="mr-4" />}
        onClick={handleClick(handleAddToCalendarClick)}
      >
        {calendarLabel}
      </BoardMarkersMenuItem>
    </MenuList>
  );
}
