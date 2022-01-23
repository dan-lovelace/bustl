import React from "react";

import * as routes from "lib/routes";

import BoardsListData from "./BoardsListData";
import BoardNoteDetails from "./BoardNoteDetails";
import BoardDetails from "components/BoardDetails/BoardDetails";
import RouterModal from "components/Modal/RouterModal";
import PrivateRoute from "components/PrivateRoute/PrivateRoute";
import PageLayout from "layouts/PageLayout/PageLayout";

function BoardsPage() {
  return (
    <PageLayout>
      <PrivateRoute path={routes.BOARDS_PAGE}>
        <BoardsListData />
      </PrivateRoute>
      <PrivateRoute path={routes.BOARD_DETAILS_PAGE}>
        <RouterModal statelessFallbackRoute={routes.BOARDS_PAGE} hideClose>
          {({ back }) => <BoardDetails goBack={back} />}
        </RouterModal>
      </PrivateRoute>
      <PrivateRoute path={routes.BOARD_NOTE_DETAILS_PAGE}>
        <BoardNoteDetails />
      </PrivateRoute>
    </PageLayout>
  );
}

export default BoardsPage;
