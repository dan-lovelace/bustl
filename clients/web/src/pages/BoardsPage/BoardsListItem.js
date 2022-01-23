import React from "react";
import { generatePath, Link, useLocation } from "react-router-dom";

import cx from "lib/classnames";
import * as routes from "lib/routes";

import BoardListItemImage from "./BoardsListItemImage";
import Checkbox from "components/Checkbox/Checkbox";

function BoardListItem({
  item,
  selectedBoards,
  setSelectedBoards,
  selectMode,
}) {
  const location = useLocation();
  const selected = selectedBoards.find((b) => b.id === item.id);

  const handleBoardSelectChange = (event) => {
    const { value } = event;

    if (value === true) {
      // create a unique set of selections using each board's id
      const uniqueBoards = new Map(selectedBoards.map((b) => [b.id, b]));
      uniqueBoards.set(item.id, item);

      // convert Map to array and map back into an array with each value
      const newSelected = Array.from(uniqueBoards).map((b) => b[1]);

      // update state with new selections
      setSelectedBoards(newSelected);
    } else {
      // remove item from selections
      const newSelected = selectedBoards.filter((b) => b.id !== item.id);

      // update state
      setSelectedBoards(newSelected);
    }
  };

  const handleImageClick = () => {
    handleBoardSelectChange({
      id: item.id,
      value: !selected,
    });
  };

  const imageComponent = selectMode ? (
    <div onClick={handleImageClick}>
      <BoardListItemImage
        item={item}
        selected={selected}
        selectMode={selectMode}
      />
    </div>
  ) : (
    <Link
      to={{
        pathname: generatePath(routes.BOARD_DETAILS_PAGE, {
          boardId: item.id,
        }),
        state: { overlay: location },
      }}
    >
      <BoardListItemImage
        item={item}
        selected={selected}
        selectMode={selectMode}
      />
    </Link>
  );

  return (
    <div id={`board_${item.id}`} className="relative">
      <div
        className={cx(
          "absolute left-0 top-0 right-0 bottom-0",
          "transition-all",
          "bg-blue-100",
          selected ? "opacity-100" : "opacity-0"
        )}
      ></div>
      <div
        className={cx(
          "relative",
          "overflow-hidden",
          "transform transition-all",
          selected && "scale-75"
        )}
      >
        {imageComponent}
      </div>
      <span
        className={cx(
          "flex items-center justify-center",
          "inline-block",
          "absolute left-0 top-0",
          "transform transition-all",
          "opacity-75"
        )}
      >
        <Checkbox
          classId={item.id}
          uncheckedColor="text-white"
          checkedColor="text-blue-500"
          onChange={handleBoardSelectChange}
          checked={selected || false}
        />
      </span>
    </div>
  );
}

export default BoardListItem;
