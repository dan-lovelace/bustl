import React from "react";
import { generatePath, useParams } from "react-router-dom";

import { useNoteQuery } from "lib/gql/queries";
import { moveNoteRefetchQuery } from "lib/gql/queries/note";
import { PROJECT_DETAILS_PAGE } from "lib/routes";

import RouterModal from "components/Modal/RouterModal";
import NoteDetails from "components/NoteDetails/NoteDetails";

export default function ProjectNoteDetails() {
  const { projectId, noteId } = useParams();
  const { data, error, loading } = useNoteQuery(noteId);

  // pass NoteDetails a query to refetch if the note changes lists
  const moveRefetchQuery = moveNoteRefetchQuery(projectId);

  return (
    <RouterModal
      hideClose
      statelessFallbackRoute={generatePath(PROJECT_DETAILS_PAGE, {
        projectId,
        noteId,
      })}
      size="xl"
      type="dialog"
    >
      {({ back, withStates }) =>
        withStates({
          component: (
            <NoteDetails
              goBack={back}
              details={data}
              moveRefetchQuery={moveRefetchQuery}
            />
          ),
          error,
          loading,
        })
      }
    </RouterModal>
  );
}
