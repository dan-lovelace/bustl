import React from "react";

import cx from "lib/classnames";

import Button from "./Button";

const widths = {
  xs: "w-8",
  sm: "w-10",
  md: "w-12",
  lg: "w-14",
  xl: "w-16",
};

const heights = {
  xs: "h-8",
  sm: "h-10",
  md: "h-12",
  lg: "h-14",
  xl: "h-16",
};

function IconButton({ children, className, size = "md", ...rest }) {
  return (
    <Button
      className={cx(widths[size], heights[size], "rounded-full", className)}
      noPadding
      {...rest}
    >
      {children}
    </Button>
  );
}

export default IconButton;
