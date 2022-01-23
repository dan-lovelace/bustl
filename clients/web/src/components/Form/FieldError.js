import React from "react";

import cx from "lib/classnames";

export default function FieldError({ children, className }) {
  return (
    <div
      className={cx(
        "bg-red-100 text-red-900",
        "rounded",
        "px-4 py-2 mt-2",
        "text-sm",
        className
      )}
    >
      {children}
    </div>
  );
}
