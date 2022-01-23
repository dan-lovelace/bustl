import moment from "moment-timezone";

export const BOARD_IMAGE_CLASS_NAME = "board-image__image";
export const BOARD_IMAGE_CONTAINER_CLASS_NAME =
  "board-image-container__component";
export const MARKER_MENU_ANCHOR_ID = "marker-menu-popover-anchor";
export const MARKER_MENU_ANCHOR_PX_RADIUS = "24";
export const NEW_CALENDAR_EVENT_KEY = "new-calendar-event";
export const NEW_NOTE_KEY = "new-note";
export const CALENDAR_EVENT_MARKER_TYPE = "new_calendar_event";
export const NOTE_MARKER_TYPE = "new_note";
export const MARKER_ID_PREFIX = "board-marker__";
export const SIDEBAR_ITEM_ID_PREFIX = "sidebar-marker__";

export class BoardMarkerClass {
  constructor(props) {
    // database fields
    this.id = props.id;
    this.x_position = props.x_position;
    this.y_position = props.y_position;
    this.marker_type = props.marker_type;
    this.note = props.note;
    this.calendar_event = props.calendar_event;
    this.sort_position = props.sort_position;
    this.hidden = props.hidden;

    // additional fields
    this.note_key = props.note_key;

    // optional
    this.expanded = props.expanded || false;
  }
}

// getMarkerElementId provides an identifier to match individual marker elements
// for further styling such as hover effects from the sidebar.
export function getMarkerElementId(markerId) {
  return `${MARKER_ID_PREFIX}${markerId}`;
}

// getSidebarElementId provides an identifier to match individual sidebar elements
// for further targeting. An example includes highlighting the current sidebar item.
export function getSidebarElementId(markerId) {
  return `${SIDEBAR_ITEM_ID_PREFIX}${markerId}`;
}

// getMarkerRenderPosition translates an X, Y position from the database into
// a position relative to the client window. It produces coordinates to be used
// when positioning markers within the render space.
export function getMarkerRenderPosition(marker) {
  const imageElement = document.querySelector(`.${BOARD_IMAGE_CLASS_NAME}`);
  const rect = imageElement && imageElement.getBoundingClientRect();
  if (!rect) {
    return false;
  }

  const xScale = rect.width / imageElement.naturalWidth;
  const yScale = rect.height / imageElement.naturalHeight;
  const pixelX = marker.x_position * xScale;
  const pixelY = marker.y_position * yScale;

  const renderX = pixelX + rect.x - MARKER_MENU_ANCHOR_PX_RADIUS;
  const renderY = pixelY + rect.y - MARKER_MENU_ANCHOR_PX_RADIUS;

  return {
    x: renderX,
    y: renderY,
  };
}

// getMarkerDatabasePosition translates a transformed X, Y to a position relative
// to the board image itself. It produces values that are ready to use for
// database operations.
export function getMarkerDatabasePosition(renderPosition) {
  const imageElement = document.querySelector(`.${BOARD_IMAGE_CLASS_NAME}`);
  const rect = imageElement && imageElement.getBoundingClientRect();
  if (!rect) {
    throw new Error("Image element does not exist");
  }

  const { naturalWidth: imageActualWidth, naturalHeight: imageActualHeight } =
    imageElement;
  const { x: imageX, y: imageY, width: imageWidth, height: imageHeight } = rect;

  // get the clicked position
  if (!renderPosition) {
    throw new Error("Unknown render position");
  }
  const { x_position: clickX, y_position: clickY } = renderPosition;

  // get origin offset from the clicked position
  const originOffsetX = clickX - imageX;
  const originOffsetY = clickY - imageY;

  // get the X, Y scales
  const xScale = imageWidth / imageActualWidth;
  const yScale = imageHeight / imageActualHeight;

  // apply scales to origin offset to get position relative to the image
  const actualX = originOffsetX / xScale;
  const actualY = originOffsetY / yScale;

  return {
    x_position: actualX,
    y_position: actualY,
  };
}

export function constructBoardsData(data) {
  if (!data || !data.length) {
    return [];
  }

  // group by date
  const dateKey = (d) => moment(d.created_at).format("LL");
  const dateGroups = data.reduce((acc, val) => {
    const currentKey = dateKey(val);

    return {
      ...acc,
      [currentKey]: [...(acc[currentKey] || []), { ...val }],
    };
  }, {});

  const ret = Object.keys(dateGroups).map((key, idx) => ({
    id: `date_group_${idx}`,
    date: key,
    boards: [...dateGroups[key]],
  }));

  return ret;
}

export function rescaleMarker(markerId, direction = "up") {
  const markerElementId = getMarkerElementId(markerId);
  const markerEle = document.getElementById(markerElementId);

  if (markerEle) {
    markerEle.classList[direction === "up" ? "add" : "remove"]("scale-125");
  }
}
