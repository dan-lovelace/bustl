import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import { ProvidePrivate } from "context/private";
import * as routes from "lib/routes";

import PrivateRoute from "components/PrivateRoute/PrivateRoute";
import AccountPage from "pages/AccountPage/AccountPage";
import BoardsPage from "pages/BoardsPage/BoardsPage";
import HomePage from "pages/HomePage/HomePage";
import LoginPage from "pages/LoginPage/LoginPage";
import LogoutPage from "pages/LogoutPage/LogoutPage";
import NotFoundPage from "pages/NotFoundPage/NotFoundPage";
import ProjectsPage from "pages/ProjectsPage/ProjectsPage";
import SignupPage from "pages/SignupPage/SignupPage";
import TrashPage from "pages/TrashPage/TrashPage";

const Routes = () => {
  return (
    <Router>
      <ProvidePrivate>
        <Switch>
          <Route exact path={routes.HOME_PAGE}>
            <HomePage />
          </Route>
          <Route path={routes.LOGIN_PAGE}>
            <LoginPage />
          </Route>
          <Route path={routes.LOGOUT_PAGE}>
            <LogoutPage />
          </Route>
          <Route path={routes.SIGNUP_PAGE}>
            <SignupPage />
          </Route>

          <PrivateRoute exact path={routes.ACCOUNT_PAGE}>
            <AccountPage />
          </PrivateRoute>
          <PrivateRoute path={routes.BOARDS_PAGE}>
            <BoardsPage />
          </PrivateRoute>
          <PrivateRoute path={routes.PROJECTS_PAGE}>
            <ProjectsPage />
          </PrivateRoute>
          <PrivateRoute path={routes.TRASH_PAGE}>
            <TrashPage />
          </PrivateRoute>

          <Route path={routes.NOT_FOUND_PAGE}>
            <NotFoundPage />
          </Route>
        </Switch>
      </ProvidePrivate>
    </Router>
  );
};

export default Routes;
