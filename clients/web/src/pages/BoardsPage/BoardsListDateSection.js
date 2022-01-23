import React from "react";

import BoardsListItem from "./BoardsListItem";

function BoardListDateSection({ date, selected, setSelected, selectMode }) {
  const renderedBoards = date.boards.filter((b) => !b.archived);

  return (
    <div>
      <div className="mx-2 md:mx-0 py-1 text-sm font-bold">{date.date}</div>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-1">
        {renderedBoards.map((board, i) => (
          <BoardsListItem
            key={i}
            item={board}
            selectedBoards={selected}
            setSelectedBoards={setSelected}
            selectMode={selectMode}
          />
        ))}
      </div>
    </div>
  );
}

export default BoardListDateSection;
