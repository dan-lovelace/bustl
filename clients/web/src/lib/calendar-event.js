import * as calendarLinks from "calendar-link";

export const GOOGLE_CALENDAR_TYPE = "google";
export const OUTLOOK_CALENDAR_TYPE = "outlook";
export const OFFICE_365_CALENDAR_TYPE = "office365";
export const YAHOO_CALENDAR_TYPE = "yahoo";
export const ICS_CALENDAR_TYPE = "ics";

export const calendarTypes = {
  [GOOGLE_CALENDAR_TYPE]: { label: "Google" },
  [OUTLOOK_CALENDAR_TYPE]: { label: "Outlook" },
  [OFFICE_365_CALENDAR_TYPE]: { label: "Office 365" },
  [YAHOO_CALENDAR_TYPE]: { label: "Yahoo" },
  [ICS_CALENDAR_TYPE]: { label: "ICS" },
};

export function getCalendarLink(calendarEvent) {
  const { calendar_type } = calendarEvent;

  if (Object.prototype.hasOwnProperty.call(calendarLinks, calendar_type)) {
    const eventData = {
      title: calendarEvent.title,
      description: calendarEvent.description,
      start: calendarEvent.start_time,
      end: calendarEvent.end_time,
      allDay: calendarEvent.all_day,
    };

    return calendarLinks[calendar_type](eventData);
  }

  throw new Error("Invalid calendar link type");
}
