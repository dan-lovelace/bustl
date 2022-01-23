import { gql, useMutation } from "@apollo/client";

import {
  boardFragment,
  boardMarkerFragment,
  calendarEventFragment,
  noteFragment,
} from "../fragments";

export function useCreateBoardMarkerMutation() {
  const mutation = gql`
    mutation CreateBoardMarker($input: CreateBoardMarkerInput!) {
      createBoardMarker(input: $input) {
        ...BoardMarker
        board {
          ...Board
        }
        note {
          ...Note
        }
        calendar_event {
          ...CalendarEvent
        }
      }
    }
    ${boardMarkerFragment}
    ${noteFragment}
    ${calendarEventFragment}
    ${boardFragment}
  `;

  return useMutation(mutation, {
    update(cache, { data: { createBoardMarker } }) {
      const boardRef = { __ref: `Board:${createBoardMarker.board.id}` };

      cache.modify({
        id: cache.identify(boardRef),
        fields: {
          markers(existing = []) {
            const newBoardMarkerRef = cache.writeFragment({
              data: createBoardMarker,
              fragment: boardMarkerFragment,
            });

            const newMarkers = [
              ...(existing && existing.length > 0 ? existing : []),
              newBoardMarkerRef,
            ];

            return newMarkers;
          },
        },
      });
    },
  });
}
