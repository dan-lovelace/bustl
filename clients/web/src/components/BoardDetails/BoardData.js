import React, { useState } from "react";

import {
  BoardMarkerClass,
  getMarkerDatabasePosition,
  NEW_NOTE_KEY,
  NEW_CALENDAR_EVENT_KEY,
  CALENDAR_EVENT_MARKER_TYPE,
  NOTE_MARKER_TYPE,
  rescaleMarker,
} from "./lib/utils";
import cx from "lib/classnames";
import { useBoardQuery } from "lib/gql/queries/board";
import * as storage from "lib/local-storage";

import BoardImageContainer from "./BoardImageContainer";
import BoardMarkers from "./BoardMarkers";
import BoardSidebar from "./BoardSidebar";
import toast from "components/Notification/toastMessage";

const initialImageTransform = {
  positionX: 0,
  positionY: 0,
  scale: 1,
};

const initialMenuLocation = {
  anchorEl: null,
  x_position: 0,
  y_position: 0,
};

function BoardData({ boardId, goBack }) {
  const storageSidebarSetting = storage.getBoardDetailsSidebarOpen();
  const [additionalMarkers, setAdditionalMarkers] = useState([]);
  const [creatingCalendarEvent, setCreatingCalendarEvent] = useState(false);
  const [creatingNote, setCreatingNote] = useState(false);
  const [expandedMarkers, setExpandedMarkers] = useState([]);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageTransform, setImageTransform] = useState(initialImageTransform);
  const [menuLocation, setMenuLocation] = useState(initialMenuLocation);
  const [sidebarOpen, setSidebarOpen] = useState(storageSidebarSetting);
  const { data, error, loading } = useBoardQuery({
    variables: {
      id: boardId,
    },
  });

  if (loading) return false;
  if (error) return `Error: ${error.toString()}`;
  if (!data || !data.board) return "No data";

  // parse board data
  const { board: dataBoard } = data;
  const { markers: boardMarkers = [] } = dataBoard;

  // merge additional markers and board's markers, only render un-archived
  const renderedMarkers = [
    ...(boardMarkers && boardMarkers.length ? [...boardMarkers] : []),
    ...additionalMarkers,
  ].filter(
    (m) =>
      (m.calendar_event ||
        m.note ||
        [NEW_CALENDAR_EVENT_KEY, NEW_NOTE_KEY].includes(m.note_key)) &&
      (!m.calendar_event || (m.calendar_event && !m.calendar_event.archived)) &&
      (!m.note || (m.note && !m.note.archived))
  );

  const beginNewMarker = (overrides = {}) => {
    // one new marker at a time
    if (creatingCalendarEvent || creatingNote) {
      toast.info("You can only create one thing at a time");
      return;
    }

    // create a new hidden marker with zeroed position
    const newMarker = new BoardMarkerClass({
      id: -1,
      x_position: 0,
      y_position: 0,
      hidden: true,
      ...overrides,
    });

    // update additional markers
    setAdditionalMarkers([...additionalMarkers, newMarker]);

    // start note creation
    switch (newMarker.marker_type) {
      case CALENDAR_EVENT_MARKER_TYPE:
        setCreatingCalendarEvent(true);
        break;
      case NOTE_MARKER_TYPE:
        setCreatingNote(true);
        break;
      default:
        throw new Error("Invalid marker type");
    }

    // add to expanded
    setExpandedMarkers([...expandedMarkers, newMarker.id]);

    // open sidebar if closed
    if (!sidebarOpen) {
      handleSidebarToggle();
    }
  };

  const beginNewSidebarCalendarEvent = (overrides = {}) => {
    // create a new hidden marker with zeroed position
    beginNewMarker({
      note_key: NEW_CALENDAR_EVENT_KEY,
      marker_type: CALENDAR_EVENT_MARKER_TYPE,
    });
  };

  const beginNewSidebarNote = (overrides = {}) => {
    beginNewMarker({
      note_key: NEW_NOTE_KEY,
      marker_type: NOTE_MARKER_TYPE,
    });
  };

  const beginNewMarkerCalendarEvent = () => {
    // create a new marker from a clicked position
    const dbPosition = getMarkerDatabasePosition(menuLocation);
    beginNewMarker({
      note_key: NEW_CALENDAR_EVENT_KEY,
      x_position: dbPosition.x_position,
      y_position: dbPosition.y_position,
      hidden: false,
      marker_type: CALENDAR_EVENT_MARKER_TYPE,
    });
  };

  const beginNewMarkerNote = () => {
    // create a new marker from a clicked position
    const dbPosition = getMarkerDatabasePosition(menuLocation);
    beginNewMarker({
      note_key: NEW_NOTE_KEY,
      x_position: dbPosition.x_position,
      y_position: dbPosition.y_position,
      hidden: false,
      marker_type: NOTE_MARKER_TYPE,
    });
  };

  const cancelNewCalendarEvent = () => {
    // remove new note from additional markers
    const newMarkers =
      additionalMarkers &&
      additionalMarkers.filter((m) => m.note_key !== NEW_CALENDAR_EVENT_KEY);

    // update additional markers
    setAdditionalMarkers(newMarkers);

    // stop note creation
    setCreatingCalendarEvent(false);

    // remove from expanded
    setExpandedMarkers(expandedMarkers.filter((m) => m !== -1));
  };

  const cancelNewNote = () => {
    // remove new note from additional markers
    const newMarkers =
      additionalMarkers &&
      additionalMarkers.filter((m) => m.note_key !== NEW_NOTE_KEY);

    // update additional markers
    setAdditionalMarkers(newMarkers);

    // stop note creation
    setCreatingNote(false);

    // remove from expanded
    setExpandedMarkers(expandedMarkers.filter((m) => m !== -1));
  };

  const handleImageLoaded = () => {
    // update image loaded state
    setImageLoaded(true);
  };

  const handleNewCalendarEventCreated = () => {
    // remove new calendar event from additional markers
    const newMarkers =
      additionalMarkers &&
      additionalMarkers.filter((m) => m.note_key !== NEW_CALENDAR_EVENT_KEY);

    // update additional markers
    setAdditionalMarkers(newMarkers);

    // stop calendar event creation
    setCreatingCalendarEvent(false);
  };

  const handleNewNoteCreated = () => {
    // remove new note from additional markers
    const newMarkers =
      additionalMarkers &&
      additionalMarkers.filter((m) => m.note_key !== NEW_NOTE_KEY);

    // update additional markers
    setAdditionalMarkers(newMarkers);

    // stop note creation
    setCreatingNote(false);
  };

  const handlePanChange = (event) => {
    // update transform x, y position
    setImageTransform({
      ...imageTransform,
      positionX: event.positionX,
      positionY: event.positionY,
    });
  };

  const handleSidebarToggle = () => {
    const newOpen = !sidebarOpen;

    storage.setBoardDetailsSidebarOpen(newOpen.toString());
    setSidebarOpen(newOpen);
    document.activeElement.blur(); // reset button outline
  };

  const handleZoomChange = (event) => {
    // update transform scale, x and y position
    setImageTransform({
      ...imageTransform,
      scale: event.scale,
      positionX: event.positionX,
      positionY: event.positionY,
    });
  };

  const toggleMarkerExpanded = (markerId) => {
    let newExpanded = [...expandedMarkers];

    if (expandedMarkers.includes(markerId)) {
      newExpanded = newExpanded.filter((e) => e !== markerId);
      rescaleMarker(markerId, "down");
    } else {
      newExpanded = [...newExpanded, markerId];
    }

    setExpandedMarkers(newExpanded);

    if (!sidebarOpen) {
      setSidebarOpen(true);
    }
  };

  return (
    <div className="board-data flex w-full h-full overflow-hidden">
      <div
        className={cx(
          "board-data__overlay",
          "fixed top-0 right-0 bottom-0 left-0",
          "bg-black"
        )}
      />
      <div className={cx("board-data__image", "relative", "flex-1", "h-full")}>
        <BoardImageContainer
          goBack={goBack}
          imageLoaded={imageLoaded}
          imageTransform={imageTransform}
          onImageLoad={handleImageLoaded}
          handlePanChange={handlePanChange}
          handleZoomChange={handleZoomChange}
          sidebarOpen={sidebarOpen}
          src={dataBoard.image.source}
        />
        <BoardMarkers
          beginNewCalendarEvent={beginNewMarkerCalendarEvent}
          beginNewNote={beginNewMarkerNote}
          imageLoaded={imageLoaded}
          markers={renderedMarkers}
          menuLocation={menuLocation}
          setMenuLocation={setMenuLocation}
          toggleMarkerExpanded={toggleMarkerExpanded}
        />
      </div>

      <BoardSidebar
        beginNewCalendarEvent={beginNewSidebarCalendarEvent}
        beginNewNote={beginNewSidebarNote}
        board={dataBoard}
        cancelNewCalendarEvent={cancelNewCalendarEvent}
        cancelNewNote={cancelNewNote}
        creatingCalendarEvent={creatingCalendarEvent}
        creatingNote={creatingNote}
        expandedMarkers={expandedMarkers}
        handleSidebarToggle={handleSidebarToggle}
        markers={renderedMarkers}
        onCalendarEventCreated={handleNewCalendarEventCreated}
        onNoteCreated={handleNewNoteCreated}
        sidebarOpen={sidebarOpen}
        toggleMarkerExpanded={toggleMarkerExpanded}
      />
    </div>
  );
}

export default BoardData;
