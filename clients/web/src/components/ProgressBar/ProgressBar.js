import React from "react";

function ProgressBar({ current, steps }) {
  const getWidth = (current, allowed) => Math.round((current / allowed) * 100);

  return (
    <div className="border overflow-hidden rounded">
      <div
        className="bg-blue-500 h-4"
        style={{ width: `${getWidth(current, steps)}%` }}
      />
    </div>
  );
}

export default ProgressBar;
