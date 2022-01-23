import { gql, useQuery } from "@apollo/client";

import { noteFragment, noteTypeFragment, projectFragment } from "../fragments";
import { GET_PROJECT } from "../queries";

export const moveNoteRefetchQuery = (projectId) => ({
  query: GET_PROJECT,
  variables: {
    id: projectId,
  },
});

export function useArchivedNotesQuery(args) {
  const query = gql`
    query GetArchivedNotes {
      notes(filter: { archived: true }) {
        ...Note
      }
    }
    ${noteFragment}
  `;

  return useQuery(query, args);
}

export function useNotesQuery(args) {
  const query = gql`
    query GetNotes {
      notes {
        ...Note
      }
    }
    ${noteFragment}
  `;

  return useQuery(query, args);
}

export function useCreateNoteQuery(args = {}) {
  const query = gql`
    query CreateNoteQuery {
      projects {
        ...Project
        note_types {
          ...NoteType
        }
      }
    }
    ${projectFragment}
    ${noteTypeFragment}
  `;

  return useQuery(query, args);
}
