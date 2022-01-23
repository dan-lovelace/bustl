import React, { useState } from "react";

import cx from "lib/classnames";
import { dateToString } from "lib/time";

import MoveNote from "./MoveNote";
import NoteDetailActions from "./NoteDetailActions";
import NoteDetailsBody from "./NoteDetailsBody";
import NoteDetailsTitle from "./NoteDetailsTitle";
import IconButton from "components/Button/IconButton";
import LinkButton from "components/Button/LinkButton";
import CloseIcon from "components/Icons/CloseIcon";

const popoverId = "note-details-move-popover";

export default function NoteDetails({ details, goBack, moveRefetchQuery }) {
  const [moveNoteEl, setMoveNoteEl] = useState(false);
  const { note: item } = details;

  if (!item) {
    return "This note doesn't exist";
  }

  const handleBack = (event) => {
    goBack(event);
  };

  const openMoveNote = (event) => {
    setMoveNoteEl(event.currentTarget);
  };

  return (
    <div className="note-details">
      {item.archived && (
        <div
          className={cx(
            "text-red-900",
            "bg-red-100",
            "p-4",
            "-m-4 mb-1",
            "rounded"
          )}
        >
          This note is archived
        </div>
      )}
      <div className="note-details__header flex">
        <div className="flex-1">
          <NoteDetailsTitle item={item} />
        </div>
        <IconButton
          className="hover:bg-gray-200 ml-2"
          noPadding
          onClick={handleBack}
          size="sm"
        >
          <CloseIcon />
        </IconButton>
      </div>

      <div className="note-details__content ml-3">
        <div className="text-sm mb-8">
          List:{" "}
          <LinkButton
            // className="underline cursor-pointer"
            aria-describedby={popoverId}
            onClick={openMoveNote}
          >
            {item.note_type.name}
          </LinkButton>
        </div>

        <div className={cx("md:flex", "mb-4")}>
          <div className="flex-1 mb-10 md:mb-0">
            <NoteDetailsBody darker item={item} />
          </div>
          <div className="md:ml-1">
            <NoteDetailActions item={item} />
          </div>
        </div>

        <div>
          <div className="text-sm text-right">
            Created {dateToString(item.created_at)}
          </div>
        </div>
      </div>

      {moveNoteEl && (
        <MoveNote
          anchorEl={moveNoteEl}
          item={item}
          moveRefetchQuery={moveRefetchQuery}
          setAnchorEl={setMoveNoteEl}
        />
      )}
    </div>
  );
}
