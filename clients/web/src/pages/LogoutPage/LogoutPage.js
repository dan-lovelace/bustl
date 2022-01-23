import React from "react";
import { Redirect } from "react-router-dom";

import * as routes from "lib/routes";

function LogoutPage() {
  return <Redirect to={routes.HOME_PAGE} />;
}

export default LogoutPage;
