import React from "react";

import cx from "lib/classnames";
import { gradients, sizes } from "lib/styles";

import IconButton from "components/Button/IconButton";
import ArrowLeftIcon from "components/Icons/ArrowLeftIcon";
import PlusIcon from "components/Icons/PlusIcon";
import SubtractIcon from "components/Icons/SubtractIcon";

function BoardImageToolbarButton({ children, className, onClick }) {
  return (
    <IconButton
      className={cx("hover:bg-white hover:bg-opacity-20", className)}
      onClick={onClick}
    >
      {children}
    </IconButton>
  );
}

function BoardImageToolbar({ actions, goBack, onResetTransform }) {
  return (
    <div
      className={cx(
        "board-image-toolbar",
        "absolute left-0 top-0",
        "flex items-center",
        `w-full`,
        "z-header",
        "pointer-events-none", // user can click through entire header
        sizes.headerHeight
      )}
    >
      <div
        className={cx(
          "absolute left-0 top-0 right-0",
          "h-full",
          gradients.toBottom
        )}
      />
      <div
        className={cx("board-image__tools", "flex", "mr-2", "z-10", "w-full")}
      >
        {/* user cannot click through button containers */}
        <div className="flex-1">
          <div className="pointer-events-auto inline-block">
            <BoardImageToolbarButton className="ml-2" onClick={goBack}>
              <ArrowLeftIcon color="text-white" />
            </BoardImageToolbarButton>
          </div>
        </div>
        <span className="pointer-events-auto">
          <BoardImageToolbarButton onClick={actions.zoomIn}>
            <PlusIcon color="text-white" />
          </BoardImageToolbarButton>
          <BoardImageToolbarButton className="ml-2" onClick={actions.zoomOut}>
            <SubtractIcon color="text-white" />
          </BoardImageToolbarButton>
        </span>
      </div>
    </div>
  );
}

export default BoardImageToolbar;
