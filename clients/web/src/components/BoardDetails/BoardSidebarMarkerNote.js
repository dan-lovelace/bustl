import React from "react";
import { generatePath, Link, useParams } from "react-router-dom";

import cx from "lib/classnames";
import { BOARD_NOTE_DETAILS_PAGE } from "lib/routes";

import OpenInNewIcon from "components/Icons/OpenInNewIcon";
import IconButton from "components/Button/IconButton";
import NoteIcon from "components/Icons/NoteIcon";
import NoteDetailsBody from "components/NoteDetails/NoteDetailsBody";

function CollapsedComponent({ item }) {
  const {
    note: { title },
  } = item;

  return (
    <div className={cx("flex items-center")}>
      <Title text={title} />
    </div>
  );
}

function ExpandedComponent({ item, toggleMarkerExpanded }) {
  const { boardId } = useParams();
  const {
    note: { id, note_type, title },
  } = item;

  const handleTitleClick = () => {
    toggleMarkerExpanded(item.id);
  };

  return (
    <div className={cx(`note-data-${id}`, "text-sm")}>
      <div className="flex mb-4">
        <div className="flex-1 cursor-pointer" onClick={handleTitleClick}>
          <Title text={title} />
          <div className="text-gray-500">List: {note_type.name}</div>
        </div>
        <div>
          <Link
            to={generatePath(BOARD_NOTE_DETAILS_PAGE, {
              boardId,
              noteId: id,
            })}
          >
            <IconButton className="hover:bg-gray-200" size="sm">
              <OpenInNewIcon />
            </IconButton>
          </Link>
        </div>
      </div>
      <div className="">
        <NoteDetailsBody item={item.note} />
      </div>
    </div>
  );
}

function Title({ text }) {
  return (
    <div className="flex-1 text-sm flex items-center">
      <NoteIcon className="mr-2" size="sm" /> {text}
    </div>
  );
}

export default function BoardSidebarMarkerNote({ expandedMarkers, ...props }) {
  const expanded = expandedMarkers.includes(props.item.id);

  return expanded ? (
    <ExpandedComponent {...props} />
  ) : (
    <CollapsedComponent {...props} />
  );
}
