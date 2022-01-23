import React, { useState } from "react";
import Popover from "@material-ui/core/Popover";

import cx from "lib/classnames";
import { useArchiveBoardsMutation } from "lib/gql/mutations/board";
import { sizes } from "lib/styles";

import Button from "components/Button/Button";
import IconButton from "components/Button/IconButton";
import CreateBoardButton from "components/CreateBoardButton/CreateBoardButton";
import CloseIcon from "components/Icons/CloseIcon";
import PlusIcon from "components/Icons/PlusIcon";
import TrashIcon from "components/Icons/TrashIcon";
import toast from "components/Notification/toastMessage";

export default function BoardsListActions({
  selected,
  setSelected,
  selectMode,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [archiveBoards, { loading }] = useArchiveBoardsMutation();

  const handleArchiveClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleArchive = () => {
    const params = {
      variables: {
        ids: selected.map((s) => s.id),
      },
    };
    console.log("params", params);

    // call mutation with network error handler
    archiveBoards(params).catch(handleNetworkError);

    // reset ui states
    setAnchorEl(null);
    setSelected([]);
  };

  const handleNetworkError = (error) => {
    toast.error(error.toString());
  };

  const handleResetClick = () => {
    setSelected([]);
  };

  const open = !!anchorEl;
  const id = open ? "simple-popover" : undefined;

  return (
    <div
      className={cx(
        "flex items-center",
        "fixed left-0 right-0",
        "bg-white",
        "transition-all",
        "z-10",
        sizes.headerHeight,
        selectMode ? "shadow-md" : "shadow-none",
        selectMode ? `top-0` : sizes.headerHeightOffset
      )}
    >
      <IconButton className="mx-2" onClick={handleResetClick}>
        <CloseIcon />
      </IconButton>
      <div className={cx("flex-1", "text-xl")}>{selected.length} Selected</div>
      <div className="flex">
        <CreateBoardButton
          icon={() => <PlusIcon color="text-blue-500" />}
          iconColor="text-blue-500"
          iconOnly={true}
        />
        <IconButton
          className="rounded-full mr-2"
          aria-describedby={id}
          disabled={loading}
          onClick={handleArchiveClick}
        >
          <TrashIcon color="text-blue-500" />
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
          <div className="p-4">
            <div className="mb-4">{`Move the selected board${
              selected.length > 1 ? "s" : ""
            } to trash?`}</div>
            <div className="flex justify-end">
              <Button onClick={handleMenuClose}>Cancel</Button>
              <Button className="ml-2" primary onClick={handleArchive}>
                Move to trash
              </Button>
            </div>
          </div>
        </Popover>
      </div>
    </div>
  );
}
