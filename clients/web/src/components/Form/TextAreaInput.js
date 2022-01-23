import React from "react";

import TextInput from "./TextInput";

export default function TextAreaInput({ startingRows = 5, ...props }) {
  return (
    <TextInput {...props} multiline minRows={startingRows} maxRows={100} />
  );
}
