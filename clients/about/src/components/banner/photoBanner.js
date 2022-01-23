import React from "react";

import { classnames as cx } from "../../utils/helpers";
import { photoBanner } from "./photoBanner.module.css";

export default function PhotoBanner({ children, className }) {
  return (
    <div
      className={cx("photo-banner bg-cover bg-center", photoBanner, className)}
    >
      {children}
    </div>
  );
}
