import React from "react";
import { useParams } from "react-router-dom";

import BoardData from "./BoardData";

function BoardDetails({ goBack }) {
  const { boardId } = useParams();

  return <BoardData boardId={boardId} goBack={goBack} />;
}

export default BoardDetails;
