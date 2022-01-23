import React from "react";

import { classnames as cx } from "../../utils/helpers";

export function Heading({ children, className }) {
  return (
    <div className={cx("text-2xl sm:text-3xl font-bold mb-4", className)}>
      {children}
    </div>
  );
}

export function Subheading({ children, className }) {
  return (
    <div className={cx("sm:text-lg text-opacity-70", className)}>
      {children}
    </div>
  );
}

export function Paragraph({ children, className }) {
  return (
    <div className={cx("text-opacity-70 mb-3", className)}>{children}</div>
  );
}
