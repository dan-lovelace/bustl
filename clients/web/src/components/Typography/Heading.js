import React from "react";

import cx from "lib/classnames";
import { sizes } from "lib/styles";

export default function Heading({ children, className, size = "md" }) {
  return (
    <div
      className={cx(sizes.tailwindTextSizes[size], "font-bold mb-2", className)}
    >
      {children}
    </div>
  );
}
