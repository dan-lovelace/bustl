import React from "react";

import cx from "lib/classnames";

import CheckedIcon from "components/Icons/CheckedIcon";
import CircleIcon from "components/Icons/CircleIcon";

function Checkbox({
  checked,
  checkedColor = "text-blue-500",
  classId,
  className,
  disabled = false,
  label,
  onChange,
  uncheckedColor = "text-gray-500",
}) {
  const handleChange = (event) => {
    const {
      target: { checked: newCheck },
    } = event;

    if (onChange && typeof onChange === "function") {
      onChange({ id: classId, value: newCheck });
    }
  };

  return (
    <label
      id={classId}
      className={cx(
        "flex items-center",
        "relative",
        "transform transition-all",
        "text-sm font-bold",
        "cursor-pointer",
        disabled && "pointer-events-none",
        className
      )}
    >
      <input
        className="hidden"
        type="checkbox"
        checked={checked}
        onChange={handleChange}
      />
      <span
        className={cx(
          "cb_icon",
          `cb_${classId}`,
          "flex items-center",
          "cursor-pointer",
          "transform transition-all delay-600",
          "p-1"
        )}
        as="button"
      >
        {checked ? (
          <CheckedIcon
            color={checked ? checkedColor : uncheckedColor}
            size="sm"
          />
        ) : (
          <CircleIcon
            color={checked ? checkedColor : uncheckedColor}
            size="sm"
          />
        )}
      </span>
      {label && label.length > 0 && (
        <span
          className={cx(
            "cb_label",
            "transform transition-all",
            "pl-2",
            "left-0",
            "whitespace-nowrap",
            "select-none"
          )}
        >
          {label}
        </span>
      )}
    </label>
  );
}

export default Checkbox;
