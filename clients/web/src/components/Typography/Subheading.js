import React from "react";

import cx from "lib/classnames";

export default function Subheading({ children, className }) {
  return <div className={cx("text-gray-700 mb-2", className)}>{children}</div>;
}
