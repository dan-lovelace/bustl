import React from "react";

import { classnames as cx } from "../../utils/helpers";

const sizes = {
  xs: { w: "16px", h: "16px" },
  sm: { w: "20px", h: "20px" },
  md: { w: "24px", h: "24px" },
  lg: { w: "32px", h: "32px" },
  xl: { w: "48px", h: "48px" },
};

export default function Icon({ children, className, color, size = "md" }) {
  return (
    <i
      className={cx("inline-block", className, color)}
      style={{ width: sizes[size].w, height: sizes[size].h }}
    >
      {children}
    </i>
  );
}
