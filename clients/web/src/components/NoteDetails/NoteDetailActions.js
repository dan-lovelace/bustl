import React from "react";

import cx from "lib/classnames";

import DeleteNoteButton from "./DeleteNoteButton";
import Button from "components/Button/Button";

export function NoteDetailActionButton({ className, ...props }) {
  return (
    <Button {...props} className={cx("w-40", className)} justify="start" />
  );
}

export default function NoteDetailActions({ item }) {
  return (
    <div
      className={cx(
        "note-detail-actions",
        "flex items-end justify-end ",
        "w-full h-full"
      )}
    >
      <DeleteNoteButton item={item} />
    </div>
  );
}
