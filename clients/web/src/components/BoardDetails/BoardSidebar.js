import React, { useState } from "react";
import MenuList from "@material-ui/core/MenuList";
import MenuItem from "@material-ui/core/MenuItem";
import Popover from "@material-ui/core/Popover";

import { NEW_CALENDAR_EVENT_KEY, NEW_NOTE_KEY } from "./lib/utils";
import cx from "lib/classnames";
import {
  useArchiveBoardMutation,
  useUnarchiveBoardMutation,
} from "lib/gql/mutations/board";
import { sizes } from "lib/styles";

import BoardSidebarMarkerItem from "./BoardSidebarMarkerItem";
import BoardSidebarMarkers from "./BoardSidebarMarkers";
import CreateNoteForm from "./CreateNoteForm";
import Button from "components/Button/Button";
import IconButton from "components/Button/IconButton";
import CloseIcon from "components/Icons/CloseIcon";
import DotsVerticalIcon from "components/Icons/DotsVerticalIcon";
import ListIcon from "components/Icons/ListIcon";
import PlusIcon from "components/Icons/PlusIcon";
import TrashIcon from "components/Icons/TrashIcon";
import toast from "components/Notification/toastMessage";
import CreateCalendarEventForm from "./CreateCalendarEventForm";
import BoardMarkersMenuContent from "./BoardMarkersMenuContent";

const boardPopoverId = "sidebar-board-popover";
const createPopoverId = "sidebar-create-popover";

export default function BoardSidebar({
  beginNewCalendarEvent,
  beginNewNote,
  board,
  cancelNewCalendarEvent,
  cancelNewNote,
  creatingCalendarEvent,
  creatingNote,
  expandedMarkers,
  handleSidebarToggle,
  markers,
  onCalendarEventCreated,
  onNoteCreated,
  sidebarOpen,
  toggleMarkerExpanded,
}) {
  const [boardPopoverAnchorEl, setBoardPopoverAnchorEl] = useState(false);
  const [createPopoverAnchorEl, setCreatePopoverAnchorEl] = useState(false);
  const [archiveBoard, { loading: archiving }] = useArchiveBoardMutation();
  const [unarchiveBoard, { loading: unarchiving }] =
    useUnarchiveBoardMutation();
  const loading = !!(archiving || unarchiving);

  const closeMenu = () => {
    setBoardPopoverAnchorEl(null);
    setCreatePopoverAnchorEl(null);
  };

  const getCreatingComponent = () => {
    if (creatingCalendarEvent) {
      return (
        <BoardSidebarMarkerItem
          expandedMarkers={expandedMarkers}
          item={markers.find((m) => m.note_key === NEW_CALENDAR_EVENT_KEY)}
        >
          <CreateCalendarEventForm
            cancelNewCalendarEvent={cancelNewCalendarEvent}
            markers={markers}
            onCalendarEventCreated={onCalendarEventCreated}
          />
        </BoardSidebarMarkerItem>
      );
    }

    if (creatingNote) {
      return (
        <BoardSidebarMarkerItem
          expandedMarkers={expandedMarkers}
          item={markers.find((m) => m.note_key === NEW_NOTE_KEY)}
        >
          <CreateNoteForm
            cancelNewNote={cancelNewNote}
            markers={markers}
            onNoteCreated={onNoteCreated}
          />
        </BoardSidebarMarkerItem>
      );
    }

    return false;
  };

  const handleArchiveBoardClick = () => {
    closeMenu();

    const params = {
      variables: {
        id: board.id,
      },
    };

    // call mutation with network error handler
    if (board.archived) {
      unarchiveBoard(params).catch(handleNetworkError);
    } else {
      archiveBoard(params).catch(handleNetworkError);
    }
  };

  const handleCreatePopoverMenuToggle = (event) => {
    setCreatePopoverAnchorEl(event.currentTarget);
  };

  const handleBoardPopoverMenuToggle = (event) => {
    setBoardPopoverAnchorEl(event.currentTarget);
  };

  const handleNetworkError = (error) => {
    toast.error(error.toString());
  };

  const handleNewCalendarEventClick = () => {
    beginNewCalendarEvent();
  };

  const handleNewNoteClick = () => {
    beginNewNote();
  };

  const creatingComponent = getCreatingComponent();

  return (
    <div
      className={cx(
        "board-details-sidebar",
        "z-default",
        "fixed right-0",
        "transition-all",
        "h-screen",
        sizes.headerHeightTopPadding,
        sidebarOpen ? "w-80 lg:w-96" : "w-0"
      )}
      style={{
        maxWidth: "100vw",
      }}
    >
      <div
        className={cx(
          "flex flex-col",
          "bg-gray-100",
          "rounded-tl-lg",
          "overflow-hidden",
          "h-full",
          "shadow-md"
        )}
      >
        {board.archived && (
          <div className={cx("bg-red-100", "text-red-900", "p-4")}>
            This board is archived
          </div>
        )}
        <div
          className={cx(
            "board-details-sidebar__header",
            "p-2",
            "flex justify-between",
            "overflow-hidden",
            sizes.headerHeight
          )}
        >
          <div className="flex items-center">
            <IconButton
              className="rounded-full mr-2 hover:bg-gray-200"
              aria-describedby={boardPopoverId}
              disabled={loading}
              onClick={handleBoardPopoverMenuToggle}
            >
              <DotsVerticalIcon />
            </IconButton>
            {!creatingComponent && (
              <Button primary onClick={handleCreatePopoverMenuToggle}>
                <PlusIcon className="mr-2" color="text-white" size="sm" /> New
              </Button>
            )}
          </div>
          <div>
            <Button
              className={cx(
                "sidebar-toggle",
                "rounded-l-full",
                "p-3",
                sidebarOpen
                  ? "rounded-r-full bg-gray-100 hover:bg-gray-200"
                  : "absolute -left-12 top-20 bg-white shadow-md"
              )}
              onClick={handleSidebarToggle}
              noPadding
            >
              {sidebarOpen ? <CloseIcon /> : <ListIcon />}
            </Button>
          </div>
        </div>

        <div
          className={cx(
            "board-details-sidebar__content",
            "flex-1",
            "overflow-hidden"
          )}
        >
          <div
            className={cx(
              "h-full",
              "overflow-y-auto overflow-x-hidden",
              "px-2 pb-28 lg:pb-0" // bottom padding on mobile to resolve iOS issue
            )}
          >
            {creatingComponent}
            <BoardSidebarMarkers
              expandedMarkers={expandedMarkers}
              markers={markers}
              toggleMarkerExpanded={toggleMarkerExpanded}
            />
          </div>
        </div>

        <Popover
          id={boardPopoverId}
          open={!!boardPopoverAnchorEl}
          anchorEl={boardPopoverAnchorEl}
          onClose={closeMenu}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
        >
          <MenuList>
            <MenuItem onClick={handleArchiveBoardClick} disabled={loading}>
              <TrashIcon className="mr-4" />{" "}
              {board.archived ? "Unarchive" : "Archive"} this board
            </MenuItem>
          </MenuList>
        </Popover>

        <Popover
          id={createPopoverId}
          open={!!createPopoverAnchorEl}
          anchorEl={createPopoverAnchorEl}
          onClose={closeMenu}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
        >
          <BoardMarkersMenuContent
            calendarLabel="Calendar event"
            handleAddToCalendarClick={handleNewCalendarEventClick}
            handleNewNoteClick={handleNewNoteClick}
            noteLabel="Note"
            onSelection={closeMenu}
          />
        </Popover>
      </div>
    </div>
  );
}
