import React from "react";

import { classnames as cx } from "../utils/helpers";

export default function Button({
  children,
  className,
  compact = false,
  primary = false,
  secondary = false,
  ...rest
}) {
  return (
    <button
      className={cx(
        primary && "bg-blue-500 hover:bg-blue-600",
        secondary && "bg-yellow-500 hover:bg-yellow-600",
        "transition-colors",
        "text-white uppercase",
        "font-bold",
        "rounded-lg",
        "shadow-lg",
        className
      )}
      {...rest}
    >
      <span
        className={cx(
          "flex items-center justify-center",
          "round-lg",
          compact ? "px-4 py-2" : "lg:text-xl px-12 py-4"
        )}
      >
        {children}
      </span>
    </button>
  );
}
