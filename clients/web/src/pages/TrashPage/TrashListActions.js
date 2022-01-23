import React, { useState } from "react";
import Popover from "@material-ui/core/Popover";

import cx from "lib/classnames";
import { useDeleteBoardsMutation } from "lib/gql/mutations/board";
import { useDeleteNotesMutation } from "lib/gql/mutations/note";
import { sizes } from "lib/styles";

import Button from "components/Button/Button";
import IconButton from "components/Button/IconButton";
import CloseIcon from "components/Icons/CloseIcon";
import TrashIcon from "components/Icons/TrashIcon";
import toast from "components/Notification/toastMessage";
import Alert from "components/Typography/Alert";

export default function TrashListActions({
  resetSelected,
  selected,
  selectMode,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteBoards, { loading: deletingBoards }] = useDeleteBoardsMutation();
  const [deleteNotes, { loading: deletingNotes }] = useDeleteNotesMutation();

  const handleDeleteClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = () => {
    if (selected.boards.length) {
      // delete boards
      const boardParams = {
        variables: {
          ids: selected.boards,
        },
      };

      // call mutation with network error handler
      deleteBoards(boardParams).catch(handleNetworkError);
    }

    if (selected.notes.length) {
      // delete notes
      const noteParams = {
        variables: {
          ids: selected.notes,
        },
      };

      // call mutation with network error handler
      deleteNotes(noteParams).catch(handleNetworkError);
    }

    // reset ui states
    setAnchorEl(null);
    resetSelected();
  };

  const handleNetworkError = (error) => {
    toast.error(error.toString());
  };

  const handleResetClick = () => {
    resetSelected();
  };

  const open = !!anchorEl;
  const id = open ? "simple-popover" : undefined;
  const totalSelected = selected.boards.length + selected.notes.length;

  return (
    <div
      className={cx(
        "flex items-center",
        "fixed left-0 right-0",
        "bg-white",
        "shadow-md",
        "transition-all",
        "z-10",
        sizes.headerHeight,
        selectMode ? `top-0` : sizes.headerHeightOffset
      )}
    >
      <IconButton className="mx-2" onClick={handleResetClick}>
        <CloseIcon />
      </IconButton>
      <div className={cx("flex-1", "text-xl")}>{totalSelected} Selected</div>
      <div className="flex">
        <IconButton
          className="rounded-full mr-2 bg-red-100 hover:bg-red-200"
          aria-describedby={id}
          disabled={deletingBoards || deletingNotes}
          onClick={handleDeleteClick}
        >
          <TrashIcon color="text-red-900" />
        </IconButton>
        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
        >
          <Alert className="max-w-sm">
            <div className="mb-4">{`Delete the selected item${
              totalSelected > 1 ? "s" : ""
            }?`}</div>
            <div className="text-sm">
              <p className="mb-4">
                <span>
                  This will permanently delete all selections from your account.
                </span>{" "}
                <span className="text-red-600 font-bold underline">
                  You will not be able to get them back.
                </span>
              </p>
              <div className="mb-4">Are you sure you want to proceed?</div>
            </div>
            <div className="flex justify-end">
              <Button className="hover:bg-red-200" onClick={handleMenuClose}>
                Cancel
              </Button>
              <Button className="ml-2" primary onClick={handleDelete}>
                Yes, delete forever
              </Button>
            </div>
          </Alert>
        </Popover>
      </div>
    </div>
  );
}
