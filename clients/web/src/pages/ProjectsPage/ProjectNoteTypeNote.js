import React from "react";
import { generatePath, Link, useLocation } from "react-router-dom";
import { Draggable } from "react-smooth-dnd";

import cx from "lib/classnames";
import { PROJECT_NOTE_DETAILS_PAGE } from "lib/routes";

export default function ProjectNoteTypeNote({ item, moving, projectId }) {
  const location = useLocation();

  return (
    <Draggable key={item.id} className={cx(moving && "pointer-events-none")}>
      <Link
        id={item.id}
        className="block"
        to={{
          pathname: generatePath(PROJECT_NOTE_DETAILS_PAGE, {
            projectId,
            noteId: item.id,
          }),
          state: { overlay: location },
        }}
        onDragStart={(e) => e.preventDefault()} // fix firefox bug
      >
        <div
          className={cx(
            moving ? "bg-gray-50" : "bg-white hover:bg-gray-50",
            "transition-colors",
            "rounded",
            "mb-2",
            "shadow-md",
            "p-2"
          )}
        >
          <div className="text-sm">{item.title}</div>
        </div>
      </Link>
    </Draggable>
  );
}
