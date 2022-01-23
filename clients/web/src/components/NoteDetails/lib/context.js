import { gql } from "@apollo/client";
import { createContext, useContext, useState } from "react";

import { client } from "lib/apollo";

const noteDetailsContext = createContext();
const initialState = {
  noteDetails: {
    data: null,
    error: null,
    fetched: false,
    loading: null,
  },
  noteTypes: {
    data: null,
    error: null,
    fetched: false,
    loading: null,
  },
  projects: {
    data: null,
    error: null,
    fetched: false,
    loading: null,
  },
};

const GET_NOTE_DETAILS = gql`
  query GetNoteDetails($id: ID!) {
    note(id: $id) {
      id
      title
      body
      note_type {
        id
        name
        project {
          id
          name
        }
      }
    }
  }
`;

// useProvideNoteDetailsContext stores the state for noteDetailsContext.
function useProvideNoteDetailsContext() {
  const [state, setState] = useState(initialState);

  const getNoteDetails = async (noteId) => {
    try {
      const result = await client.query({
        query: GET_NOTE_DETAILS,
        variables: {
          id: noteId,
        },
      });
      const {
        data: { note },
      } = result;

      setState({
        ...state,
        noteDetails: {
          ...state.noteDetails,
          data: note,
          error: null,
          fetched: true,
          loading: false,
        },
      });
    } catch (error) {
      setState({
        ...state,
        noteDetails: {
          ...state.noteDetails,
          error,
          fetched: true,
          loading: false,
        },
      });
    }
  };

  return {
    state,

    getNoteDetails,
  };
}

// NoteContextProvider provides a context Provider component that uses noteDetailsContext.
export function NoteDetailsProvider({ children }) {
  const providerValue = useProvideNoteDetailsContext();

  return (
    <noteDetailsContext.Provider value={providerValue}>
      {children}
    </noteDetailsContext.Provider>
  );
}

// useNoteDetailsContext provides a useContext hook with noteDetailsContext. It is
// a helper method for consumers.
export function useNoteDetailsContext() {
  return useContext(noteDetailsContext);
}
