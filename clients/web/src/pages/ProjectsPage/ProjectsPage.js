import React from "react";

import * as routes from "lib/routes";

import ProjectDetails from "./ProjectDetails";
import ProjectNoteDetails from "./ProjectNoteDetails";
import PageLayout from "layouts/PageLayout/PageLayout";
import PrivateRoute from "components/PrivateRoute/PrivateRoute";
import NotFoundPage from "pages/NotFoundPage/NotFoundPage";

function ProjectsPage() {
  return (
    <PageLayout>
      <PrivateRoute exact path={routes.PROJECTS_PAGE}>
        <NotFoundPage />
      </PrivateRoute>
      <PrivateRoute path={routes.PROJECT_DETAILS_PAGE}>
        <ProjectDetails />
      </PrivateRoute>
      <PrivateRoute path={routes.PROJECT_NOTE_DETAILS_PAGE}>
        <ProjectNoteDetails />
      </PrivateRoute>
    </PageLayout>
  );
}

export default ProjectsPage;
