import React from "react";

import { classnames as cx } from "../utils/helpers";

export default function Link({ className, ...props }) {
  return <a {...props} className={cx("text-blue-600 underline", className)} />; // eslint-disable-line
}
