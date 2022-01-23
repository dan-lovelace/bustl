import React from "react";
import { useParams } from "react-router-dom";

import { NEW_CALENDAR_EVENT_KEY } from "./lib/utils";
import { getCalendarLink } from "lib/calendar-event";
import { useCreateBoardMarkerMutation } from "lib/gql/mutations/boardMarker";
import { useBoardDetailsCreateCalendarEventMutation } from "lib/gql/mutations/calendarEvent";

import toast from "components/Notification/toastMessage";
import CalendarEventForm from "components/CalendarEventForm/CalendarEventForm";

export default function CreateCalendarEventForm({
  cancelNewCalendarEvent,
  markers,
  onCalendarEventCreated,
}) {
  const { boardId } = useParams();
  const [createCalendarEvent, { loading: creatingCalendarEvent }] =
    useBoardDetailsCreateCalendarEventMutation();
  const [createBoardMarker, { loading: creatingBoardMarker }] =
    useCreateBoardMarkerMutation();
  const loading = creatingCalendarEvent || creatingBoardMarker;

  const handleFormSubmit = async (values) => {
    const newCalendarEvent = {
      all_day: values.all_day,
      description: values.description,
      end_time: values.end_time,
      start_time: values.start_time,
      title: values.title,
      calendar_type: values.calendar_type,
    };
    const requestParams = {
      variables: {
        input: newCalendarEvent,
      },
    };

    const createResult = await createCalendarEvent(requestParams).catch(
      handleCreateError
    );
    if (
      createResult &&
      createResult.data &&
      createResult.data.createCalendarEvent
    ) {
      const {
        data: {
          createCalendarEvent: { id: calendarEventId },
        },
      } = createResult;
      const newBoardMarker = markers.find(
        (m) => m.note_key === NEW_CALENDAR_EVENT_KEY
      );
      const boardMarkerParams = {
        variables: {
          input: {
            board_id: boardId,
            x_position: Math.round(newBoardMarker.x_position),
            y_position: Math.round(newBoardMarker.y_position),
            marker_type: newBoardMarker.marker_type,
            hidden: newBoardMarker.hidden,

            calendar_event_id: calendarEventId,
          },
        },
      };

      // call mutation then open calendar link in a new tab
      await createBoardMarker(boardMarkerParams)
        .then(handleCreateSuccess(newCalendarEvent))
        .catch(handleCreateError);

      // reset ui states
      onCalendarEventCreated();
    }
  };

  const handleCreateError = (error) => {
    toast.error(error.toString());
  };

  const handleCreateSuccess = (calendarEventData) => (event) => {
    window.open(
      getCalendarLink({
        ...calendarEventData,
        calendar_type:
          event.data.createBoardMarker.calendar_event.calendar_type,
      })
    );
  };

  return (
    <>
      <div className="font-bold mb-2">New Calendar Event</div>
      <CalendarEventForm
        cancelNewCalendarEvent={cancelNewCalendarEvent}
        loading={loading}
        onSubmit={handleFormSubmit}
      />
    </>
  );
}
