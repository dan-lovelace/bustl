import React from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

import { BOARD_IMAGE_CONTAINER_CLASS_NAME } from "./lib/utils";
import cx from "lib/classnames";

import BoardImage from "./BoardImage";
import BoardImageToolbar from "./BoardImageToolbar";

const staticWrapperProps = {
  defaultScale: 1,
  options: {
    limitToBounds: false,
    minScale: 0.5,
  },
  reset: {
    animation: false,
    animationTime: 0,
  },
  zoomIn: {
    animation: false,
    animationTime: 0,
    step: 10,
  },
  zoomOut: {
    animation: false,
    animationTime: 0,
    step: 10,
  },
};

function BoardImageContainer({
  goBack,
  imageLoaded,
  imageTransform,
  onImageLoad,
  handlePanChange,
  handleZoomChange,
  src,
}) {
  const wrapperListeners = {
    onPanning: (event) => {
      const { positionX, positionY } = event;

      if (
        positionX !== imageTransform.positionX ||
        positionY !== imageTransform.positionY
      ) {
        handlePanChange(event);
      }
    },
    onZoomChange: (event) => {
      const { positionX, positionY, scale } = event;

      if (
        positionX !== imageTransform.positionX ||
        positionY !== imageTransform.positionY ||
        scale !== imageTransform.scale
      ) {
        handleZoomChange(event);
      }
    },
  };

  const wrapperProps = {
    ...staticWrapperProps,
    ...wrapperListeners,
    scale: imageTransform.scale,
    positionX: imageTransform.positionX,
    positionY: imageTransform.positionY,
    wheel: {
      step: 150, // 6.5 if including sidebar width
    },
  };

  return (
    <div
      className={cx(
        "board-image-container",
        "relative",
        "flex-1",
        "flex flex-col items-center justify-center",
        "w-full h-full"
      )}
    >
      <TransformWrapper {...wrapperProps}>
        {(actions) => (
          <>
            <TransformComponent>
              <div
                className={cx(
                  BOARD_IMAGE_CONTAINER_CLASS_NAME,
                  "flex items-center justify-center",
                  "w-screen h-full" // height is overridden by a resize listener
                )}
                data-menu-trigger
              >
                <BoardImage
                  imageLoaded={imageLoaded}
                  onImageLoad={onImageLoad}
                  src={src}
                />
              </div>
            </TransformComponent>
            <BoardImageToolbar actions={actions} goBack={goBack} />
          </>
        )}
      </TransformWrapper>
    </div>
  );
}

export default BoardImageContainer;
