import React from "react";

import {
  useArchiveNoteMutation,
  useDeleteNoteMutation,
  useUnarchiveNoteMutation,
} from "lib/gql/mutations/note";

import { NoteDetailActionButton } from "./NoteDetailActions";
import TrashIcon from "components/Icons/TrashIcon";
import toast from "components/Notification/toastMessage";
import ArchiveIcon from "components/Icons/ArchiveIcon";

export default function DeleteNoteButton({ item }) {
  const [archiveNote, { loading: archiveLoading }] = useArchiveNoteMutation();
  const [deleteNote, { loading: deleteLoading }] = useDeleteNoteMutation();
  const [unarchiveNote, { loading: unarchiveLoading }] =
    useUnarchiveNoteMutation();

  const handleArchiveClick = () => {
    if (item.archived) {
      handleUnarchive();
    } else {
      handleArchive();
    }
  };

  const handleArchive = () => {
    const params = {
      variables: {
        id: item.id,
      },
    };

    archiveNote(params).catch((e) => handleNetworkError(e));
  };

  const handleDeleteClick = () => {
    const params = {
      variables: {
        id: item.id,
      },
    };

    deleteNote(params).catch((e) =>
      handleNetworkError(e, "Error deleting note")
    );
  };

  const handleNetworkError = (error, prefix = false) => {
    toast.error(`${prefix ? `${prefix}: ` : ""}${error.toString()}`);
  };

  const handleUnarchive = () => {
    const params = {
      variables: {
        id: item.id,
      },
    };

    unarchiveNote(params).catch((e) => handleNetworkError(e));
  };

  const anythingLoading = archiveLoading || deleteLoading || unarchiveLoading;

  return (
    <div className="flex flex-col">
      <NoteDetailActionButton
        className="bg-gray-200 hover:bg-gray-300"
        disabled={anythingLoading}
        onClick={handleArchiveClick}
        short
      >
        {item.archived ? (
          <>
            <ArchiveIcon className="mr-4" /> Unarchive
          </>
        ) : (
          <>
            <ArchiveIcon className="mr-4" /> Archive
          </>
        )}
      </NoteDetailActionButton>

      {item.archived && (
        <NoteDetailActionButton
          className="bg-red-100 hover:bg-red-200 text-red-900 mt-1"
          disabled={anythingLoading}
          onClick={handleDeleteClick}
          short
        >
          <TrashIcon className="mr-4" color="text-red-900" /> Delete
        </NoteDetailActionButton>
      )}
    </div>
  );
}
