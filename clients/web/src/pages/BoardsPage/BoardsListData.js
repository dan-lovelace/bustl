import React from "react";

import { constructBoardsData } from "./lib/utils";
import { useBoardsQuery } from "lib/gql/queries/board";

import BoardsList from "./BoardsList";
import Spinner from "components/Loader/Spinner";

export default function BoardsListData() {
  const { data, error, loading } = useBoardsQuery();

  if (loading) {
    return (
      <div className="px-1 py-2">
        <Spinner />
      </div>
    );
  }

  if (error) return `Error: ${error}`;
  if (!data || !data.boards || !data.boards.length) return "No boards";

  const { boards: dataBoards } = data;

  const activeBoards = dataBoards.filter((b) => !b.archived);
  const boardsData = constructBoardsData(activeBoards);

  return <BoardsList boards={boardsData} />;
}
