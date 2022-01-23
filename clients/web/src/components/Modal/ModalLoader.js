import Spinner from "components/Loader/Spinner";
import React from "react";

import cx from "lib/classnames";

export default function ModalLoader() {
  return (
    <div
      className={cx(
        "flex items-center justify-center",
        "h-64",
        "bg-gray-200",
        "rounded"
      )}
    >
      <Spinner color="currentColor" size="lg" />
    </div>
  );
}
