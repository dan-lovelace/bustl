import React from "react";

import cx from "lib/classnames";

export const ALERT_DANGER_CLASS_NAME =
  "border border-red-900 text-red-900 bg-red-100 p-4 rounded";

export default function Alert({ children, className }) {
  return (
    <div className={cx(ALERT_DANGER_CLASS_NAME, className)}>{children}</div>
  );
}
