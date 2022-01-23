import React, { useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";

import { HOME_PAGE } from "lib/routes";
import Modal from "./Modal";
import ModalLoader from "./ModalLoader";

function RouterModal({
  children,
  statelessFallbackRoute = HOME_PAGE,
  ...rest
}) {
  const history = useHistory();
  const { state: locationState } = useLocation();

  useEffect(() => {
    document.body.classList.add("overflow-hidden");

    return () => document.body.classList.remove("overflow-hidden");
  });

  const back = (event) => {
    if (locationState && locationState.overlay) {
      if (event) {
        event.stopPropagation();
      }

      history.goBack();
    } else {
      history.push(statelessFallbackRoute);
    }
  };

  const withStates = ({ component, error, loading }) => {
    if (loading) return <ModalLoader />;
    if (error) return `Error ${error}`;

    return component;
  };

  const renderChildren =
    typeof children === "function" ? children({ back, withStates }) : children;

  return (
    <Modal {...rest} onClose={back}>
      {renderChildren}
    </Modal>
  );
}

export default RouterModal;
