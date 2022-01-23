import React from "react";

import cx from "lib/classnames";
import { gradients } from "lib/styles";

import Image from "components/Image/Image";

export default function BoardListItemImage({ item, selected, selectMode }) {
  return (
    <div className={cx("flex flex-col", "overflow-hidden", "cursor-pointer")}>
      <div className="overflow-hidden">
        <Image className="w-full" src={item.image.thumbnail} />
        <span
          className={cx(
            `gd_${item.id}`,
            "absolute right-0 bottom-0 left-0 top-0",
            "transform transition-all",
            "pointer-events-none",
            "cursor-pointer",
            "h-9",
            !selected && gradients.toBottom,
            selectMode && "hidden"
          )}
        />
      </div>
    </div>
  );
}
