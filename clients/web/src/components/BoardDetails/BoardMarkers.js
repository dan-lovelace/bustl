import React, { useEffect, useState } from "react";
import { useResizeDetector } from "react-resize-detector/build/withPolyfill";

import {
  getMarkerRenderPosition,
  MARKER_MENU_ANCHOR_ID,
  MARKER_MENU_ANCHOR_PX_RADIUS,
} from "./lib/utils";
import cx from "lib/classnames";

import BoardMarker from "./BoardMarker";
import BoardMarkersMenu from "./BoardMarkersMenu";

function BoardMarkers({
  beginNewCalendarEvent,
  beginNewNote,
  imageLoaded,
  markers,
  menuLocation,
  setMenuLocation,
  toggleMarkerExpanded,
}) {
  const [mouseDown, setMouseDown] = useState(false);
  const { ref } = useResizeDetector();

  const handleMarkerClick = (markerId) => {
    toggleMarkerExpanded(markerId);
  };

  const handleMouseUp = (event) => {
    const { clientX, clientY } = event;

    if (mouseDown) {
      const { x_position, y_position } = mouseDown;

      if (x_position === clientX && y_position === clientY) {
        if (!menuLocation.anchorEl) {
          // show menu
          const ele = document.getElementById(MARKER_MENU_ANCHOR_ID);
          const newX = clientX;
          const newY = clientY;

          ele.style.left = `${newX - MARKER_MENU_ANCHOR_PX_RADIUS}px`;
          ele.style.top = `${newY - MARKER_MENU_ANCHOR_PX_RADIUS}px`;

          setMenuLocation({
            x_position: newX,
            y_position: newY,
            anchorEl: ele,
          });
        }
      }
    }
  };

  const handleMouseDown = (event) => {
    if (event.button === 0) {
      const { target } = event;
      const classList = Array.from(target.classList);
      const hasDataTrigger =
        target.getAttribute("data-menu-trigger") === "true";
      const isTransformComponent = classList.includes(
        "react-transform-component"
      );

      const isMenuTrigger = !!(hasDataTrigger || isTransformComponent);

      if (isMenuTrigger) {
        setMouseDown({
          x_position: event.clientX,
          y_position: event.clientY,
        });
      }
    }
  };

  useEffect(() => {
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousedown", handleMouseDown);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  });

  return (
    <div
      ref={ref}
      className={cx(
        "board-markers",
        "absolute left-0 top-0",
        "w-full h-full",
        "bg-none",
        "pointer-events-none",
        "transition-opacity",
        imageLoaded ? "opacity-100" : "opacity-0"
      )}
    >
      <BoardMarkersMenu
        beginNewCalendarEvent={beginNewCalendarEvent}
        beginNewNote={beginNewNote}
        menuLocation={menuLocation}
        setMenuLocation={setMenuLocation}
      />
      {markers &&
        markers.map((m, idx) => {
          if (m.hidden) return false;

          const position = getMarkerRenderPosition(m);

          return (
            <div
              key={idx}
              className={cx("absolute")}
              style={{ left: `${position.x}px`, top: `${position.y}px` }}
            >
              <BoardMarker onClick={handleMarkerClick} {...m} />
            </div>
          );
        })}
    </div>
  );
}

export default BoardMarkers;
