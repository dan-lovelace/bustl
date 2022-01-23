import { gql, useMutation } from "@apollo/client";

import { noteTypeFragment } from "../fragments";

export const CREATE_NOTE_TYPE = gql`
  mutation CreateNoteType($input: CreateNoteTypeInput!) {
    createNoteType(input: $input) {
      ...NoteType
    }
  }
  ${noteTypeFragment}
`;

export function useCreateNoteTypeMutation() {
  return useMutation(CREATE_NOTE_TYPE);
}

export const DELETE_NOTE_TYPES = gql`
  mutation DeleteNoteTypes($ids: [ID]!) {
    deleteNoteTypes(ids: $ids)
  }
`;

export function useDeleteNoteTypesMutation() {
  return useMutation(DELETE_NOTE_TYPES, {
    update(cache, { data: { deleteNoteTypes } }) {
      for (const id of deleteNoteTypes) {
        cache.evict({
          id: cache.identify({ __ref: `NoteType:${id}` }),
        });
      }

      cache.gc();
    },
  });
}

export const UPDATE_NOTE_TYPE = gql`
  mutation UpdateNoteType($id: ID!, $input: UpdateNoteTypeInput!) {
    updateNoteType(id: $id, input: $input) {
      ...NoteType
    }
  }
  ${noteTypeFragment}
`;

export function useUpdateNoteTypeMutation() {
  return useMutation(UPDATE_NOTE_TYPE);
}
