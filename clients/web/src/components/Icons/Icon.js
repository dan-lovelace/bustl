import React from "react";

import cx from "lib/classnames";

const sizes = {
  xs: { w: "16px", h: "16px" },
  sm: { w: "20px", h: "20px" },
  md: { w: "24px", h: "24px" },
  lg: { w: "32px", h: "32px" },
  xl: { w: "48px", h: "48px" },
};

function Icon({
  children,
  className,
  color = "text-gray-500",
  size = "md",
  style,
  ...rest
}) {
  return (
    <i
      className={cx("inline-block", className, color)}
      style={{ width: sizes[size].w, height: sizes[size].h, ...style }}
      {...rest}
    >
      {children}
    </i>
  );
}

export default Icon;
