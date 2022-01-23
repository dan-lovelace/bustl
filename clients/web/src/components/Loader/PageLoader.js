import React from "react";

import cx from "lib/classnames";

import Spinner from "components/Loader/Spinner";

function PageLoader() {
  return (
    <div
      className={cx(
        "absolute top-0 right-0 bottom-0 left-0",
        "flex justify-center items-center",
        "bg-gray-600 opacity-50"
      )}
    >
      <Spinner size="lg" />
    </div>
  );
}

export default PageLoader;
