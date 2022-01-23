import React from "react";
import { useParams } from "react-router-dom";

import { useNoteQuery } from "lib/gql/queries";
import { TRASH_PAGE } from "lib/routes";

import RouterModal from "components/Modal/RouterModal";
import NoteDetails from "components/NoteDetails/NoteDetails";

export default function TrashPageNoteDetails() {
  const { noteId } = useParams();
  const { data, error, loading } = useNoteQuery(noteId);

  return (
    <RouterModal
      hideClose
      statelessFallbackRoute={TRASH_PAGE}
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
