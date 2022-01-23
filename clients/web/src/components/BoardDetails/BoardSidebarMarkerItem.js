import React from "react";

import { getSidebarElementId, rescaleMarker } from "./lib/utils";
import cx from "lib/classnames";

export default function BoardSidebarMarkerItem({
  children,
  expandedMarkers,
  item,
  toggleMarkerExpanded,
}) {
  if (!item) return false;
  const sidebarItemId = getSidebarElementId(item.id);
  const expanded = !!expandedMarkers.includes(item.id);

  const handleClick = () => {
    if (!expanded && toggleMarkerExpanded) {
      toggleMarkerExpanded(item.id);
    }
  };

  const handleMouseEnter = () => {
    if (item.hidden) return;
    rescaleMarker(item.id);
  };

  const handleMouseLeave = () => {
    if (item.hidden) return;
    rescaleMarker(item.id, "down");
  };

  return (
    <div
      className={cx("mb-2", "transition-all", !expanded && "cursor-pointer")}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        id={sidebarItemId}
        className={cx(
          "board-sidebar-marker-item",
          "bg-white",
          "shadow-md",
          "rounded",
          "p-2",
          !expanded && "hover:bg-gray-50"
        )}
      >
        {children}
      </div>
    </div>
  );
}
