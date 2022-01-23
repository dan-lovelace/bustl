import React from "react";

import cx from "lib/classnames";

export default function FormLabel({ children, className }) {
  return (
    <div className={cx("text-xs text-gray-500 select-none", className)}>
      {children}
    </div>
  );
}
