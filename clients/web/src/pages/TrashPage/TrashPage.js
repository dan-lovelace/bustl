import React from "react";

import * as routes from "lib/routes";

import TrashNoteDetails from "./TrashPageNoteDetails";
import TrashList from "./TrashList";
import BoardDetails from "components/BoardDetails/BoardDetails";
import PrivateRoute from "components/PrivateRoute/PrivateRoute";
import PageLayout from "layouts/PageLayout/PageLayout";
import RouterModal from "components/Modal/RouterModal";

const TrashPage = () => {
  return (
    <PageLayout>
      <PrivateRoute path={routes.TRASH_PAGE}>
        <TrashList />
      </PrivateRoute>
      <PrivateRoute path={routes.TRASH_BOARD_DETAILS_PAGE}>
        <RouterModal hideClose statelessFallbackRoute={routes.TRASH_PAGE}>
          {({ back }) => <BoardDetails goBack={back} />}
        </RouterModal>
      </PrivateRoute>
      <PrivateRoute path={routes.TRASH_NOTE_DETAILS_PAGE}>
        <TrashNoteDetails />
      </PrivateRoute>
    </PageLayout>
  );
};

export default TrashPage;
