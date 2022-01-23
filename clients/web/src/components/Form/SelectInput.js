import React from "react";

import { makeStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";

import cx from "lib/classnames";

import FieldError from "./FieldError";

const useStyles = makeStyles((theme) => ({
  formControl: {
    width: "100%",
  },
  selectEmpty: {
    // marginTop: theme.spacing(2),
  },
}));

export default function SelectInput({
  containerClassName,
  disabled = false,
  label,
  options,
  required = false,
  ...inputProps
}) {
  const classes = useStyles();
  const { errors, touched } = inputProps;
  const id = `select-input-${inputProps.name || ""}`;
  let error = false;

  if (errors && touched) {
    const { name } = inputProps;

    if (touched[name] && errors[name]) {
      error = errors[name];
    }
  }

  return (
    <div className={cx("w-full", containerClassName)}>
      <FormControl
        className={classes.formControl}
        disabled={disabled}
        required={required}
      >
        {label && <InputLabel htmlFor={id}>{label}</InputLabel>}
        <Select
          inputProps={{
            id,
          }}
          {...inputProps}
        >
          {options}
        </Select>
      </FormControl>
      {error && <FieldError>{error}</FieldError>}
    </div>
  );
}
