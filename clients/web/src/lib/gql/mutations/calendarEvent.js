import { gql, useMutation } from "@apollo/client";
import { calendarEventFragment } from "../fragments";

export function useArchiveCalendarEventMutation() {
  const mutation = gql`
    mutation ArchiveCalendarEvent($id: ID!) {
      updateCalendarEvent(id: $id, input: { archived: true }) {
        ...CalendarEvent
      }
    }
    ${calendarEventFragment}
  `;

  return useMutation(mutation);
}

export function useBoardDetailsCreateCalendarEventMutation() {
  const mutation = gql`
    mutation CreateCalendarEvent($input: CreateCalendarEventInput!) {
      createCalendarEvent(input: $input) {
        ...CalendarEvent
      }
    }
    ${calendarEventFragment}
  `;

  return useMutation(mutation, {
    update(cache, { data: { createCalendarEvent: newCalendarEvent } }) {
      cache.modify({
        fields: {
          calendarEvents(existingCalendarEvents = []) {
            const newCalendarEventRef = cache.writeFragment({
              data: newCalendarEvent,
              fragment: calendarEventFragment,
            });

            return [newCalendarEventRef, ...existingCalendarEvents];
          },
        },
      });
    },
  });
}

export function useUpdateCalendarEventMutation() {
  const mutation = gql`
    mutation UpdateCalendarEvent($id: ID!, $input: UpdateCalendarEventInput!) {
      updateCalendarEvent(id: $id, input: $input) {
        ...CalendarEvent
      }
    }
    ${calendarEventFragment}
  `;

  return useMutation(mutation);
}
