import { gql, useMutation } from "@apollo/client";

import { noteFragment } from "../fragments";

export function useDeleteNoteMutation() {
  const mutation = gql`
    mutation DeleteNote($id: ID!) {
      deleteNotes(ids: [$id])
    }
  `;

  return useMutation(mutation, {
    update(
      cache,
      {
        data: {
          deleteNotes: [deletedNoteId],
        },
      }
    ) {
      cache.evict({
        id: cache.identify({ __ref: `Note:${deletedNoteId}` }),
      });
      cache.gc();
    },
  });
}

export const DELETE_NOTES = gql`
  mutation DeleteNotes($ids: [ID]!) {
    deleteNotes(ids: $ids)
  }
`;

export function useDeleteNotesMutation(ids) {
  return useMutation(DELETE_NOTES, {
    update(cache, { data: { deleteNotes } }) {
      for (const id of deleteNotes) {
        cache.evict({
          id: cache.identify({ __ref: `Note:${id}` }),
        });
      }

      cache.gc();
    },
  });
}

export function useBoardDetailsCreateNoteMutation() {
  const mutation = gql`
    mutation CreateNote($input: CreateNoteInput!) {
      createNote(input: $input) {
        ...Note
        note_type {
          id
        }
      }
    }
    ${noteFragment}
  `;

  return useMutation(mutation, {
    update(cache, { data: { createNote: newNote } }) {
      cache.modify({
        id: cache.identify({ __ref: `NoteType:${newNote.note_type.id}` }),
        fields: {
          notes(existing = []) {
            const previousNotes = [
              ...(existing && existing.length > 0 ? existing : []),
            ];
            const newRef = cache.writeFragment({
              data: newNote,
              fragment: noteFragment,
            });

            return [...previousNotes, newRef];
          },
        },
      });
    },
  });
}

export function useProjectDetailsCreateNoteMutation() {
  const mutation = gql`
    mutation CreateNote($input: CreateNoteInput!) {
      createNote(input: $input) {
        ...Note
        note_type {
          id
        }
      }
    }
    ${noteFragment}
  `;

  return useMutation(mutation, {
    update(cache, { data: { createNote: newNote } }) {
      cache.modify({
        id: cache.identify({ __ref: `NoteType:${newNote.note_type.id}` }),
        fields: {
          notes(existing = []) {
            const previousNotes = [
              ...(existing && existing.length > 0 ? existing : []),
            ];
            const newRef = cache.writeFragment({
              data: newNote,
              fragment: noteFragment,
            });

            return [...previousNotes, newRef];
          },
        },
      });
    },
  });
}

export function useMoveNoteMutation() {
  const mutation = gql`
    mutation MoveNote($id: ID!, $input: UpdateNoteInput!) {
      updateNote(id: $id, input: $input) {
        ...Note
        note_type {
          id
          name
        }
      }
    }
    ${noteFragment}
  `;

  return useMutation(mutation);
}

export function useUpdateNoteBodyMutation() {
  const mutation = gql`
    mutation UpdateNoteBody($id: ID!, $body: String) {
      updateNote(id: $id, input: { body: $body }) {
        id
        body
      }
    }
  `;

  return useMutation(mutation);
}

export function useUpdateNoteTitleMutation() {
  const mutation = gql`
    mutation UpdateNoteTitle($id: ID!, $title: String) {
      updateNote(id: $id, input: { title: $title }) {
        id
        title
      }
    }
  `;

  return useMutation(mutation);
}

export function useArchiveNoteMutation() {
  const mutation = gql`
    mutation ArchiveNote($id: ID!) {
      updateNote(id: $id, input: { archived: true }) {
        ...Note
      }
    }
    ${noteFragment}
  `;

  return useMutation(mutation);
}

export function useUnarchiveNoteMutation() {
  const mutation = gql`
    mutation UnarchiveNote($id: ID!) {
      updateNote(id: $id, input: { archived: false }) {
        ...Note
      }
    }
    ${noteFragment}
  `;

  return useMutation(mutation);
}

export const UPDATE_NOTE = gql`
  mutation UpdateNote($id: ID!, $input: UpdateNoteInput!) {
    updateNote(id: $id, input: $input) {
      ...Note
    }
  }
  ${noteFragment}
`;

export function useUpdateNoteMutation() {
  return useMutation(UPDATE_NOTE);
}
