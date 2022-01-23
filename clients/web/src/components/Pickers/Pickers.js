import React from "react";
import {
  DatePicker as MUIDatePicker,
  DateTimePicker as MUIDateTimePicker,
  TimePicker as MUITimePicker,
} from "@material-ui/pickers";

// import cx from "lib/classnames";

function _Container({ children, className }) {
  return <div className={className}>{children}</div>;
}

export default function Picker({
  children,
  containerClassName,
  type,
  ...rest
}) {
  let Component;
  const Container = (props) =>
    React.createElement(_Container, {
      className: containerClassName,
      ...props,
    });

  switch (type) {
    case "date":
      Component = (
        <Container>
          <MUIDatePicker {...rest} />
        </Container>
      );
      break;
    case "time":
      Component = (
        <Container>
          <MUITimePicker {...rest} />
        </Container>
      );
      break;
    case "date-time":
    default:
      Component = (
        <Container>
          <MUIDateTimePicker {...rest} />
        </Container>
      );
      break;
  }

  return Component;
}
