import React from "react";
import { Link } from "react-router-dom";

import * as routes from "lib/routes";

const NotFoundPage = () => {
  return (
    <div>
      <h1>Page Not Found</h1>
      <Link to={routes.HOME_PAGE}>Go Home</Link>
    </div>
  );
};

export default NotFoundPage;
