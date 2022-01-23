import React, { useEffect } from "react";
import { Route, useLocation } from "react-router-dom";

import { getLoginUrl, useAuth } from "context/auth";
import { usePrivateContext } from "context/private";

import MeProvider from "components/Me/MeProvider";
import TermsOfService from "components/TermsOfService/TermsOfService";

function PrivateRoute({ children, ...rest }) {
  const auth = useAuth();
  const location = useLocation();
  const privateCtx = usePrivateContext();

  useEffect(() => {
    privateCtx.resetAllSelectedItems();
  }, [location]); // eslint-disable-line

  if (!auth.user) {
    // TODO: redirect to marketing page once it exists
    window.location.assign(getLoginUrl());
    return false;
  }

  return (
    <MeProvider>
      {({ me }) =>
        me.must_accept_terms ? (
          <TermsOfService />
        ) : (
          <Route {...rest} render={() => children} />
        )
      }
    </MeProvider>
  );
}

export default PrivateRoute;
