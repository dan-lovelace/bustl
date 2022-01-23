import React from "react";
import moment from "moment-timezone";

import BoardSidebarMarkerCalendarEvent from "./BoardSidebarMarkerCalendarEvent";
import BoardSidebarMarkerItem from "./BoardSidebarMarkerItem";
import BoardSidebarMarkerNote from "./BoardSidebarMarkerNote";

export default function BoardSidebarMarkers({
  expandedMarkers,
  markers,
  toggleMarkerExpanded,
}) {
  const sorted =
    markers && markers.length
      ? markers
          // id -1 is used for markers that don't exist yet, do not render in sidebar
          .filter((m) => m.id > 0)
          .sort(
            (a, b) =>
              moment(b.created_at).valueOf() - moment(a.created_at).valueOf()
          )
      : [];

  const getRenderComponent = (marker) => {
    const commonProps = {
      expandedMarkers,
      toggleMarkerExpanded,
      item: marker,
    };

    if (marker.note) {
      return <BoardSidebarMarkerNote {...commonProps} />;
    }

    if (marker.calendar_event) {
      return <BoardSidebarMarkerCalendarEvent {...commonProps} />;
    }

    return false;
  };

  return sorted.map((m, idx) => (
    <BoardSidebarMarkerItem
      key={idx}
      expandedMarkers={expandedMarkers}
      toggleMarkerExpanded={toggleMarkerExpanded}
      item={m}
    >
      {getRenderComponent(m)}
    </BoardSidebarMarkerItem>
  ));
}
