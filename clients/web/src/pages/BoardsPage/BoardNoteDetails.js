import React from "react";
import { generatePath, useParams } from "react-router-dom";

import { useNoteQuery } from "lib/gql/queries";
import { BOARD_DETAILS_PAGE } from "lib/routes";

import RouterModal from "components/Modal/RouterModal";
import NoteDetails from "components/NoteDetails/NoteDetails";

export default function BoardNoteDetails() {
  const { boardId, noteId } = useParams();
  const { data, error, loading } = useNoteQuery(noteId);

  return (
    <RouterModal
      hideClose
      statelessFallbackRoute={generatePath(BOARD_DETAILS_PAGE, {
        boardId,
        noteId,
      })}
      size="xl"
      type="dialog"
    >
      {({ back, withStates }) =>
        withStates({
          component: <NoteDetails goBack={back} details={data} />,
          error,
          loading,
        })
      }
    </RouterModal>
  );
}
