import React from "react";
import cx from "lib/classnames";

export default function SidebarItem({
  className,
  expandedText,
  IconComponent = false,
  collapsedLabel = false,
  onClick,
  selected,
  sidebarOpen,
}) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <div
      className={cx(
        "sidebar-item",
        "flex items-center",
        "h-10",
        "rounded-full",
        "text-sm",
        "select-none",
        "whitespace-nowrap",
        "cursor-pointer",
        "overflow-hidden",
        "mr-2",
        !sidebarOpen && "w-10 ml-3",
        sidebarOpen && "rounded-l-none pl-3",
        selected ? "hover:bg-blue-200" : "hover:bg-gray-100",
        selected && "bg-blue-100 text-blue-700",
        className
      )}
      onClick={handleClick}
    >
      {sidebarOpen ? (
        <div className="flex items-center ml-2">
          <IconComponent
            className={cx("mr-3")}
            color={selected ? "text-blue-700" : "text-gray-500"}
          />
          <div
            className={cx("flex items-center", "h-full", "inline", "truncate")}
          >
            {expandedText}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center w-full h-full">
          {collapsedLabel ? (
            <div className="text-base font-extrabold">{collapsedLabel}</div>
          ) : (
            <IconComponent
              color={selected ? "text-blue-700" : "text-gray-500"}
            />
          )}
        </div>
      )}
    </div>
  );
}
