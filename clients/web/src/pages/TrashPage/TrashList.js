import React, { useState } from "react";

import BoardsList from "./BoardsList";
import NotesList from "./NotesList";
import TrashListActions from "./TrashListActions";

export default function TrashList() {
  const [selectedBoards, setSelectedBoards] = useState([]);
  const [selectedNotes, setSelectedNotes] = useState([]);

  const resetSelected = () => {
    setSelectedBoards([]);
    setSelectedNotes([]);
  };

  const selectMode = !!(selectedBoards.length || selectedNotes.length);
  const selected = {
    boards: selectedBoards,
    notes: selectedNotes,
  };

  return (
    <div className="trash-list max-w-md mx-auto py-2 px-2 md:px-0">
      <TrashListActions
        selected={selected}
        resetSelected={resetSelected}
        selectMode={selectMode}
      />
      <div className="mb-2">
        <BoardsList selected={selectedBoards} setSelected={setSelectedBoards} />
      </div>
      <NotesList selected={selectedNotes} setSelected={setSelectedNotes} />
    </div>
  );
}
