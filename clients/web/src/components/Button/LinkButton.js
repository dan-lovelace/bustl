import React from "react";

import cx from "lib/classnames";

export default function LinkButton({
  children,
  className,
  Component: PropsComponent,
  ...rest
}) {
  const Component = PropsComponent || (rest.href ? "a" : "button");

  return (
    <Component
      className={cx(
        "cursor-pointer underline text-blue-600 hover:text-blue-700",
        className
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}
