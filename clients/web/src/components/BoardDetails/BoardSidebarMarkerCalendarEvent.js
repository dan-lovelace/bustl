import React, { useState } from "react";

import { calendarTypes, getCalendarLink } from "lib/calendar-event";
import cx from "lib/classnames";
import { useUpdateCalendarEventMutation } from "lib/gql/mutations/calendarEvent";
import { dateToString } from "lib/time";

import CalendarEventForm from "components/CalendarEventForm/CalendarEventForm";
import Button from "components/Button/Button";
import CalendarIcon from "components/Icons/CalendarIcon";
import FormLabel from "components/Form/FormLabel";
import toast from "components/Notification/toastMessage";
import Markdown from "components/Markdown/Markdown";
import Alert from "components/Typography/Alert";

function CollapsedComponent({ item }) {
  const {
    calendar_event: { title },
  } = item;

  return (
    <div className={cx("flex items-center")}>
      <Title text={title} />
    </div>
  );
}

function ExpandedComponent({ item, toggleMarkerExpanded }) {
  const [editing, setEditing] = useState(false);
  const [updateCalendarEvent, { loading }] = useUpdateCalendarEventMutation();
  // TODO: put archive button in edit form somewhere
  const { calendar_event } = item;
  if (!calendar_event) {
    return <Alert>No calendar event</Alert>;
  }

  const {
    calendar_event: {
      all_day,
      calendar_type,
      description,
      end_time,
      id,
      start_time,
      title,
    },
  } = item;
  const calendarLink = getCalendarLink(calendar_event);

  const handleEditClick = () => {
    setEditing(true);
  };

  const handleEditSubmit = async (values) => {
    const requestParams = {
      variables: {
        id: calendar_event.id,
        input: values,
      },
    };

    // call mutation
    await updateCalendarEvent(requestParams).catch(handleNetworkError);

    // reset ui states
    stopEditing();
  };

  const handleNetworkError = (error) => {
    toast.error(error.toString());
  };

  const handleTitleClick = () => {
    toggleMarkerExpanded(item.id);
  };

  const stopEditing = () => {
    setEditing(false);
  };

  return (
    <div className={cx(`calendar-event-data-${id}`, "")}>
      <div className="flex">
        <div className="flex-1 mb-2 cursor-pointer" onClick={handleTitleClick}>
          <Title text={title} />
        </div>
        {!editing && <Button onClick={handleEditClick}>Edit</Button>}
      </div>
      {editing ? (
        <CalendarEventForm
          cancelNewCalendarEvent={stopEditing}
          initialData={calendar_event}
          loading={loading}
          onSubmit={handleEditSubmit}
          showArchiveButton
        />
      ) : (
        <div>
          <div className="grid grid-cols-2 gap-1 mb-2">
            <div>
              <FormLabel>Start</FormLabel>
              {dateToString(start_time, all_day ? "LL" : undefined)}
            </div>
            <div>
              <FormLabel>End</FormLabel>
              {dateToString(end_time, all_day ? "LL" : undefined)}
            </div>
          </div>
          {description && description.length > 0 && (
            <div className="mb-2">
              <FormLabel className="mb-1">Description</FormLabel>
              <Markdown source={description} />
            </div>
          )}
          <div className="grid grid-cols-2 gap-1">
            <div>
              <FormLabel>Calendar Type</FormLabel>
              {calendarTypes[calendar_type].label}
            </div>
            <div className="truncate text-blue-600">
              <FormLabel>Calendar Link</FormLabel>
              <a href={calendarLink} target="_blank" rel="noreferrer">
                {calendarLink}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Title({ text }) {
  return (
    <div className="flex-1 text-sm flex items-center">
      <CalendarIcon className="mr-2" size="sm" /> {text}
    </div>
  );
}

export default function BoardSidebarMarkerCalendarEvent({
  expandedMarkers,
  ...props
}) {
  const expanded = expandedMarkers.includes(props.item.id);

  return expanded ? (
    <ExpandedComponent {...props} />
  ) : (
    <CollapsedComponent {...props} />
  );
}
