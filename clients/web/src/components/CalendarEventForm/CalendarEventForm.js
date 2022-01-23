import React, { useState } from "react";
import { Formik, Form } from "formik";
import * as yup from "yup";
import moment from "moment-timezone";
import Popover from "@material-ui/core/Popover";
import MenuList from "@material-ui/core/MenuList";
import MenuItem from "@material-ui/core/MenuItem";

import {
  calendarTypes,
  GOOGLE_CALENDAR_TYPE,
  ICS_CALENDAR_TYPE,
  OFFICE_365_CALENDAR_TYPE,
  OUTLOOK_CALENDAR_TYPE,
  YAHOO_CALENDAR_TYPE,
} from "lib/calendar-event";
import cx from "lib/classnames";
import { useArchiveCalendarEventMutation } from "lib/gql/mutations/calendarEvent";
import { titleValidator } from "lib/validations";

import Button from "components/Button/Button";
import IconButton from "components/Button/IconButton";
import Checkbox from "components/Checkbox/Checkbox";
import FieldError from "components/Form/FieldError";
import FormLabel from "components/Form/FormLabel";
import TextAreaInput from "components/Form/TextAreaInput";
import TextInput from "components/Form/TextInput";
import TrashIcon from "components/Icons/TrashIcon";
import toast from "components/Notification/toastMessage";
import Picker from "components/Pickers/Pickers";

const formSchema = yup.object().shape({
  title: titleValidator,
  start_time: yup.date().required("Needs a start time"),
  all_day: yup.boolean(),
  end_time: yup.date().required("Needs an end time"),
  calendar_type: yup
    .string()
    .required("Your event needs a calendar type")
    .oneOf(Object.keys(calendarTypes)),
});

const archivePopoverId = "archive-popover";
const calendarEventFormClassName = "create-calendar-event-form";

const defaultFormValues = (initial = {}) => {
  const defaultStartTime = initial.start_time
    ? moment(initial.start_time)
    : moment().startOf("day");
  const defaultEndTime = initial.end_time
    ? moment(initial.end_time)
    : defaultStartTime.add(30, "minutes");

  return {
    title: initial.title || "",
    start_time: defaultStartTime.format(),
    end_time: defaultEndTime.format(),
    all_day: initial.all_day !== undefined ? initial.all_day : true,
    description: initial.description || "",
    calendar_type: initial.calendar_type || "",
  };
};

export default function CalendarEventForm({
  cancelNewCalendarEvent,
  initialData,
  loading,
  onSubmit,
  showArchiveButton = false,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [formData, setFormData] = useState(defaultFormValues(initialData));
  const [archiveCalendarEvent, { loading: archiving }] =
    useArchiveCalendarEventMutation();

  const closeArchiveMenu = () => {
    setAnchorEl(null);
  };

  const handleArchiveClick = async () => {
    const requestParams = {
      variables: {
        id: initialData.id,
      },
    };
    await archiveCalendarEvent(requestParams).catch(handleNetworkError);
  };

  const handleArchiveMenuToggle = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCancelClick = () => {
    cancelNewCalendarEvent();
  };

  const handleFormSubmit = (values) => {
    onSubmit(values);
  };

  const handleFormChange = (event, formikHandleChange) => {
    const {
      target: { name, value },
    } = event;
    const overrides = {};

    if (name === "start_time" && moment(value) > moment(formData.end_time)) {
      // adjust end_time if start_time is after it
      const newEndTime = moment(value).add(30, "minutes").format();
      overrides.end_time = newEndTime;
      formikHandleChange({ target: { name: "end_time", value: newEndTime } });
    }

    if (name === "all_day" && value === true) {
      // adjust start and end times so the event is inclusive of them. without this,
      // apple calendar will not include them.
      // turning all_day ON
      const newStartTime = moment(formData.start_time).startOf("day").format();
      const newEndTime = moment(formData.end_time).endOf("day").format();
      overrides.start_time = newStartTime;
      overrides.end_time = newEndTime;

      formikHandleChange({
        target: { name: "start_time", value: newStartTime },
      });
      formikHandleChange({ target: { name: "end_time", value: newEndTime } });
    }

    setFormData({
      ...formData,
      [name]: value,
      ...overrides,
    });
    formikHandleChange(event);
  };

  const handleDateChange = (name, formikHandleChange) => (event) => {
    let value = event;

    if (formData.all_day) {
      // adjust date to start or end depending on which one is changing
      if (name === "start_time") {
        value = value.startOf("day");
      } else if (name === "end_time") {
        value = value.endOf("day");
      }
    }

    handleFormChange(
      {
        target: { name, value: value.format() },
      },
      formikHandleChange
    );
  };

  const handleNetworkError = (error) => {
    toast.error(error.toString());
  };

  const CalendarButton = ({ formikHandleChange, type }) => {
    return (
      <Button
        name="calendar_type"
        value={type}
        short
        className={cx(
          "w-100 block",
          formData.calendar_type === type &&
            "border-blue-900 text-blue-900 bg-blue-100 hover:bg-blue-200",
          formData.calendar_type !== "" && "text-gray-600",
          formData.calendar_type !== type && "shadow"
        )}
        justify="start"
        // primary={formData.calendar_type === type}
        onClick={(event) =>
          handleFormChange({ target: event.currentTarget }, formikHandleChange)
        }
      >
        {calendarTypes[type].label}
      </Button>
    );
  };

  return (
    <div className={cx(calendarEventFormClassName)}>
      <Formik
        initialValues={formData}
        validationSchema={formSchema}
        onSubmit={handleFormSubmit}
      >
        {({ errors, handleChange, touched }) => (
          <Form>
            <TextInput
              containerClassName="mb-2"
              errors={errors}
              name="title"
              label="Title"
              value={formData.title}
              onChange={(event) => handleFormChange(event, handleChange)}
              required
              touched={touched}
            />
            <div className="grid grid-cols-2 gap-1 mb-2">
              <Picker
                type={formData.all_day ? "date" : "date-time"}
                name="start_time"
                value={formData.start_time}
                onChange={handleDateChange("start_time", handleChange)}
                label="Start"
                showTodayButton
              />
              <Picker
                containerClassName="ml-2"
                type={formData.all_day ? "date" : "date-time"}
                name="end_time"
                value={formData.end_time}
                onChange={handleDateChange("end_time", handleChange)}
                label="End"
                showTodayButton
                disableDay
                shouldDisableDate={(date) =>
                  moment(date) < moment(formData.start_time)
                }
              />
            </div>
            <div className="mb-4">
              <Checkbox
                label="All day"
                name="all_day"
                checked={formData.all_day}
                onChange={({ value }) =>
                  handleFormChange(
                    {
                      target: { name: "all_day", value },
                    },
                    handleChange
                  )
                }
              />
            </div>
            <TextAreaInput
              containerClassName="mb-2"
              errors={errors}
              name="description"
              label="Description"
              variant="outlined"
              value={formData.description}
              onChange={(event) => handleFormChange(event, handleChange)}
              touched={touched}
            />
            <FormLabel className="mb-1">Calendar Type *</FormLabel>
            <div className="grid grid-cols-2 gap-1 mb-2">
              <CalendarButton
                type={GOOGLE_CALENDAR_TYPE}
                formikHandleChange={handleChange}
              />
              <CalendarButton
                type={OUTLOOK_CALENDAR_TYPE}
                formikHandleChange={handleChange}
              />
              <CalendarButton
                type={OFFICE_365_CALENDAR_TYPE}
                formikHandleChange={handleChange}
              />
              <CalendarButton
                type={YAHOO_CALENDAR_TYPE}
                formikHandleChange={handleChange}
              />
              <CalendarButton
                type={ICS_CALENDAR_TYPE}
                formikHandleChange={handleChange}
              />
            </div>
            {errors.calendar_type && touched.calendar_type && (
              <FieldError className="mb-2">{errors.calendar_type}</FieldError>
            )}
            <div className="flex items-end">
              <div className="flex-1">
                <Button
                  className="mr-2"
                  disabled={loading}
                  primary
                  type="submit"
                >
                  Save Event
                </Button>
                <Button onClick={handleCancelClick}>Cancel</Button>
              </div>
              {showArchiveButton && (
                <IconButton
                  className="ml-2"
                  disabled={archiving}
                  onClick={handleArchiveMenuToggle}
                >
                  <TrashIcon />
                </IconButton>
              )}
            </div>
          </Form>
        )}
      </Formik>

      <Popover
        id={archivePopoverId}
        open={anchorEl}
        anchorEl={anchorEl}
        onClose={closeArchiveMenu}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuList>
          <MenuItem onClick={handleArchiveClick} disabled={loading}>
            Delete this event
          </MenuItem>
        </MenuList>
      </Popover>
    </div>
  );
}
