import { gql, useQuery } from "@apollo/client";

import {
  boardFragment,
  boardMarkerFragment,
  calendarEventFragment,
  imageFragment,
  noteFragment,
  noteTypeFragment,
} from "../fragments";

export function useBoardQuery(args) {
  const query = gql`
    query GetBoard($id: ID!) {
      board(id: $id) {
        ...Board
        image {
          ...Image
        }
        markers {
          ...BoardMarker
          note {
            ...Note
            note_type {
              ...NoteType
            }
          }
          calendar_event {
            ...CalendarEvent
          }
        }
      }
    }
    ${boardFragment}
    ${imageFragment}
    ${boardMarkerFragment}
    ${noteFragment}
    ${noteTypeFragment}
    ${calendarEventFragment}
  `;

  return useQuery(query, args);
}

export function useBoardsQuery() {
  const query = gql`
    query GetBoards {
      boards {
        ...Board
        image {
          ...Image
        }
      }
    }
    ${boardFragment}
    ${imageFragment}
  `;

  return useQuery(query);
}
