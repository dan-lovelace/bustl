import React from "react";

import { classnames as cx } from "../utils/helpers";

export default function Section({
  children,
  className,
  compact = false,
  ...rest
}) {
  return (
    <section className={cx(className)} {...rest}>
      <div
        className={cx(
          "container mx-auto px-10 lg:px-40",
          compact ? "py-12" : "py-52"
        )}
      >
        {children}
      </div>
    </section>
  );
}
