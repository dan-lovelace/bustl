import React from "react";
import { Redirect } from "react-router-dom";

import * as routes from "lib/routes";

const HomePage = () => {
  return <Redirect to={routes.BOARDS_PAGE} />;
};

export default HomePage;
