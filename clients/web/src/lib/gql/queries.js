import { gql, useQuery } from "@apollo/client";

import { noteFragment, noteTypeFragment, projectFragment } from "./fragments";

const GET_NOTE = gql`
  query GetNote($id: ID!) {
    note(id: $id) {
      ...Note
      note_type {
        id
        name
      }
    }
  }
  ${noteFragment}
`;

export function useNoteQuery(id) {
  return useQuery(GET_NOTE, { variables: { id } });
}

export const GET_PROJECT = gql`
  query GetProject($id: ID!) {
    project(id: $id) {
      ...Project
      note_types {
        ...NoteType
        notes {
          id
          title
          archived
          sort_position
        }
      }
    }
  }
  ${projectFragment}
  ${noteTypeFragment}
`;

export function useProjectQuery(id) {
  return useQuery(GET_PROJECT, { variables: { id } });
}

export const GET_PROJECTS = gql`
  query GetProjects {
    projects {
      ...Project
    }
  }
  ${projectFragment}
`;

export function useProjectsQuery() {
  return useQuery(GET_PROJECTS);
}

export const MOVE_NOTE_QUERY = gql`
  query MoveNoteQuery($id: ID!) {
    projects {
      ...Project
      note_types {
        ...NoteType
        notes {
          ...Note
        }
      }
    }

    note(id: $id) {
      ...Note
      note_type {
        id
      }
    }
  }
  ${projectFragment}
  ${noteTypeFragment}
  ${noteFragment}
`;

export function useMoveNoteQuery(options = {}) {
  return useQuery(MOVE_NOTE_QUERY, options);
}

export const UPDATE_NOTE_TYPE_QUERY = gql`
  query UpdateNoteTypeQuery($id: ID!) {
    projects {
      ...Project
      note_types {
        ...NoteType
      }
    }

    note_type(id: $id) {
      ...NoteType
    }
  }
  ${projectFragment}
  ${noteTypeFragment}
`;

export function useUpdateNoteTypeQuery(options = {}) {
  return useQuery(UPDATE_NOTE_TYPE_QUERY, options);
}
