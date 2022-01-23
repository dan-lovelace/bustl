import React, { useState } from "react";

import BoardsListActions from "./BoardsListActions";
import BoardsListDateSection from "./BoardsListDateSection";
import CreateBoardButton from "components/CreateBoardButton/CreateBoardButton";
import Heading from "components/Typography/Heading";
import Subheading from "components/Typography/Subheading";

export default function BoardsList({ boards }) {
  const [selected, setSelected] = useState([]);
  const selectMode = !!(selected && selected.length > 0);

  return (
    <div className="boards-list h-full">
      <BoardsListActions
        selected={selected}
        setSelected={setSelected}
        selectMode={selectMode}
      />
      {boards && boards.length > 0 ? (
        boards.map((date, idx) => (
          <BoardsListDateSection
            key={idx}
            date={date}
            selected={selected}
            setSelected={setSelected}
            selectMode={selectMode}
          />
        ))
      ) : (
        <div className="max-w-sm mx-auto px-2 py-10">
          <Heading size="2xl">Nothing to see here...</Heading>
          <Subheading className="mb-10">
            You don't have any whiteboard images uploaded. Click the button
            below to get started.
          </Subheading>
          <CreateBoardButton
            className="bg-blue-600 hover:bg-blue-700 text-white"
            iconColor="text-white"
          />
        </div>
      )}
    </div>
  );
}
