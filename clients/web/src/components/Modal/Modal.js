import React, { useEffect } from "react";

import cx from "lib/classnames";

import IconButton from "components/Button/IconButton";
import CloseIcon from "components/Icons/CloseIcon";

const overlayBg = "bg-gray-900 bg-opacity-50";
const sizes = {
  xs: "max-w-xs",
  sm: "sm:max-w-lg",
  md: "md:max-w-xl",
  lg: "lg:max-w-2xl",
  xl: "w-full md:max-w-3xl",
};

function DefaultModal({ children, onClose }) {
  return (
    <div
      className={cx(
        "default-modal",
        "z-modal",
        "fixed top-0 right-0 bottom-0 left-0",
        "overflow-auto"
      )}
    >
      <div className={cx("fixed w-full h-full", overlayBg)} onClick={onClose} />
      <div className="relative">{children}</div>
    </div>
  );
}

function DialogModal({
  centerVertical = false,
  children,
  className,
  hideClose = false,
  onClose,
  size = "md",
  title = false,
}) {
  const handleOverlayClick = (event) => {
    const { target } = event;

    if (
      typeof target.getAttribute === "function" &&
      target.getAttribute("data-overlay-click-trigger") &&
      typeof onClose === "function"
    ) {
      onClose();
    }
  };

  return (
    <div
      className={cx(
        "dialog-modal",
        "fixed top-0 right-0 bottom-0 left-0",
        "flex flex-col items-center",
        "overflow-y-auto",
        "z-modal",
        overlayBg,
        centerVertical && "justify-center"
      )}
      data-overlay-click-trigger
      onClick={handleOverlayClick}
    >
      <div className={cx("w-full", "my-16 px-2")} data-overlay-click-trigger>
        <div
          className={cx(
            "bg-gray-100",
            "rounded",
            "w-full",
            "mx-auto",
            "p-4",
            className,
            sizes[size]
          )}
        >
          {(title || !hideClose) && (
            <div className={cx("flex items-center", "mb-2")}>
              {title && <div className="flex-1">{title}</div>}
              {!hideClose && (
                <IconButton className="hover:bg-gray-200" onClick={onClose}>
                  <CloseIcon />
                </IconButton>
              )}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}

export default function Modal({ type = "default", ...rest }) {
  useEffect(() => {
    // add and remove body scroll on mount/unmount
    document.body.classList.add("overflow-hidden");
    return () => document.body.classList.remove("overflow-hidden");
  });

  switch (type) {
    case "dialog":
      return <DialogModal {...rest} />;
    default:
      return <DefaultModal {...rest} />;
  }
}
