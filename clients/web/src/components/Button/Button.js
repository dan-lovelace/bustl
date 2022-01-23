import React from "react";

import cx from "lib/classnames";

function Button({
  children,
  className,
  noPadding = false,
  primary = false,
  short = false,
  text,
  justify = "center", // start, end
  ...rest
}) {
  return (
    <button
      className={cx(
        "rounded",
        "hover:bg-gray-100",
        "cursor-pointer",
        "uppercase text-sm whitespace-nowrap",
        ...(primary && !rest.disabled
          ? ["bg-blue-600 hover:bg-blue-700 text-white"]
          : []),
        ...(primary && rest.disabled
          ? ["bg-blue-200 hover:bg-blue-200 text-white"]
          : []),
        rest.disabled && "pointer-events-none",
        className
      )}
      type="button"
      {...rest}
    >
      <span
        className={cx(
          "flex items-center",
          `justify-${justify}`,
          !noPadding && "py-2.5 px-5",
          short && "h-9"
        )}
      >
        {children}
      </span>
    </button>
  );
}

export default Button;
