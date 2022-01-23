import React from "react";

import {
  MARKER_MENU_ANCHOR_PX_RADIUS,
  getMarkerElementId,
  getSidebarElementId,
  NOTE_MARKER_TYPE,
  CALENDAR_EVENT_MARKER_TYPE,
} from "./lib/utils";
import cx from "lib/classnames";

import BookmarkIcon from "components/Icons/BookmarkIcon";
import NoteIcon from "components/Icons/NoteIcon";
import CalendarIcon from "components/Icons/CalendarIcon";

const markerBackgroundClass = "bg-yellow-300 shadow-md";
const markerColorClass = "text-blue-600";
const sidebarHoverAdd = ["bg-blue-100"];

export default function BoardMarker({
  id,
  note_key,
  marker_type,
  onClick = false,
}) {
  let icon = false;
  const markerElementId = getMarkerElementId(id);
  const sidebarItemId = getSidebarElementId(id);
  const props = {
    // color: note_key === NEW_NOTE_KEY ? "text-blue-600" : "text-red-600",
    color: markerColorClass,
    size: "lg",
  };

  switch (marker_type) {
    case CALENDAR_EVENT_MARKER_TYPE:
      icon = <CalendarIcon {...props} className="-mt-1" />;
      break;
    case NOTE_MARKER_TYPE:
      icon = <NoteIcon {...props} />;
      break;
    default:
      icon = <BookmarkIcon {...props} />;
      break;
  }

  const handleClick = () => {
    if (onClick) {
      onClick(id);
    }
  };

  const handleMouseEnter = () => {
    const sidebarItemEle = document.getElementById(sidebarItemId);
    if (sidebarItemEle) {
      sidebarItemEle.classList.remove("bg-white");
      sidebarItemEle.classList.add(...sidebarHoverAdd);
    }
  };

  const handleMouseLeave = () => {
    const sidebarItemEle = document.getElementById(sidebarItemId);
    if (sidebarItemEle) {
      sidebarItemEle.classList.add("bg-white");
      sidebarItemEle.classList.remove(...sidebarHoverAdd);
    }
  };

  return (
    <div
      id={markerElementId}
      className={cx(
        "flex items-center justify-center",
        "rounded-full",
        "border border-gray-600",
        "transform transition-all",
        "cursor-pointer",
        id && "pointer-events-auto",
        markerBackgroundClass
      )}
      style={{
        // style attribute here because marker size needs to be static
        width: `${MARKER_MENU_ANCHOR_PX_RADIUS * 2}px`,
        height: `${MARKER_MENU_ANCHOR_PX_RADIUS * 2}px`,
      }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {icon}
    </div>
  );
}
