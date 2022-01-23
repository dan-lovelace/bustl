import React, { useEffect, useRef } from "react";

import { makeStyles } from "@material-ui/core/styles";
import InputBase from "@material-ui/core/InputBase";
import FormControl from "@material-ui/core/FormControl";
import TextField from "@material-ui/core/TextField";

import cx from "lib/classnames";
import { isTabKey } from "lib/keyboard";
import { sizes } from "lib/styles";

import FieldError from "components/Form/FieldError";

const useStyles = makeStyles({
  textField: {
    fontSize: (props) => sizes.textSizes[props.textSize],
    fontWeight: (props) => (props.boldFont ? "bold" : "normal"),
    lineHeight: (props) => sizes.lineHeights[props.textSize],
  },
});

export default function TextInput({
  allowTabs = false,
  containerClassName,
  boldFont = false,
  naked,
  textSize = "md",
  ...inputProps
}) {
  const classes = useStyles({ boldFont, textSize });
  const { errors, touched } = inputProps;
  const inputRef = useRef();
  let error = false;
  const Component = naked ? InputBase : TextField;

  useEffect(() => {
    function init() {
      if (allowTabs) {
        // insert tab characters when pressing tab inside text areas
        const textArea =
          inputRef &&
          inputRef.current &&
          inputRef.current.querySelector("textarea");

        if (textArea) {
          textArea.addEventListener("keydown", function (event) {
            if (isTabKey(event)) {
              event.preventDefault();
              const { selectionEnd, selectionStart } = this;

              // set textarea value to: text before caret + tab + text after caret
              this.value =
                this.value.substring(0, selectionStart) +
                "\t" +
                this.value.substring(selectionEnd);

              // put caret at right position again
              this.selectionStart = this.selectionEnd = selectionStart + 1;
            }
          });
        }
      }
    }

    init();
  }, [allowTabs]);

  if (errors && touched) {
    const { name } = inputProps;

    if (touched[name] && errors[name]) {
      error = errors[name];
    }
  }

  return (
    <div ref={inputRef} className={cx("w-full", containerClassName)}>
      <FormControl fullWidth>
        <Component
          className={classes.textField}
          error={!!error}
          {...inputProps}
        />
      </FormControl>
      {error && <FieldError>{error}</FieldError>}
    </div>
  );
}
