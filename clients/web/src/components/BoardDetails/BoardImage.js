import React from "react";

import { BOARD_IMAGE_CLASS_NAME } from "./lib/utils";
import cx from "lib/classnames";

import Image from "components/Image/Image";

function BoardImage({ imageLoaded, onImageLoad, src }) {
  const handleImageLoad = () => {
    if (!imageLoaded) {
      setTimeout(() => {
        // manually trigger a browser resize event to update the board image
        // container's height (src/index.js)
        window.dispatchEvent(new Event("resize"));

        // FIX: wait a sec for the browser to paint the image so the markers will render
        // in the correct initial position. the markers layer is hidden until the image is
        // loaded and the below function triggers a re-render to reposition them.
        onImageLoad();
      }, 25); // this is a little touchy, 5ms causes issues
    }
  };

  return (
    <Image
      className={cx(BOARD_IMAGE_CLASS_NAME, "max-h-screen max-w-full")}
      onLoad={handleImageLoad}
      src={src}
    />
  );
}

export default BoardImage;
