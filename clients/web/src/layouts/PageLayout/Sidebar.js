import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

import SidebarProjectList from "./SidebarProjectList";
import cx from "lib/classnames";
import * as storage from "lib/local-storage";
import * as routes from "lib/routes";
import { sizes } from "lib/styles";

import SidebarItem from "./SidebarItem";
import BoardIcon from "components/Icons/BoardIcon";
import ChevronDoubleLeftIcon from "components/Icons/ChevronDoubleLeftIcon";
import ChevronDoubleRightIcon from "components/Icons/ChevronDoubleRightIcon";
import TrashIcon from "components/Icons/TrashIcon";
import IconButton from "components/Button/IconButton";

function SidebarItemDivider() {
  return <hr className="mx-4 my-2" />;
}

export function SidebarContent({
  closeOnRedirect = false,
  sidebarOpen,
  setSidebarOpen,
}) {
  const location = useLocation();
  const { pathname } = location;

  const handleLinkClick = () => {
    if (
      closeOnRedirect &&
      setSidebarOpen &&
      typeof setSidebarOpen === "function"
    ) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="page-sidebar__content flex-1">
      <div className="my-2">
        <Link
          className="mb-2 block"
          to={routes.BOARDS_PAGE}
          onClick={handleLinkClick}
        >
          <SidebarItem
            expandedText="Photos"
            IconComponent={BoardIcon}
            selected={pathname.startsWith(routes.BOARDS_PAGE)}
            sidebarOpen={sidebarOpen}
          />
        </Link>
        <SidebarProjectList
          handleLinkClick={handleLinkClick}
          sidebarOpen={sidebarOpen}
        />
        <SidebarItemDivider />
        <Link to={routes.TRASH_PAGE} onClick={handleLinkClick}>
          <SidebarItem
            expandedText="Trash"
            IconComponent={TrashIcon}
            selected={pathname.startsWith(routes.TRASH_PAGE)}
            sidebarOpen={sidebarOpen}
          />
        </Link>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const storageSidebarSetting = storage.getPageLayoutSidebarOpen();
  const [sidebarOpen, setSidebarOpen] = useState(storageSidebarSetting);

  const handleSidebarToggle = () => {
    const newOpen = !sidebarOpen;

    storage.setPageLayoutSidebarOpen(newOpen.toString());
    setSidebarOpen(newOpen);
  };

  return (
    <div
      className={cx(
        "page-sidebar",
        "flex flex-col",
        "h-full transition-all",
        "overflow-x-hidden overflow-y-auto",
        sidebarOpen ? sizes.sidebar.open : sizes.sidebar.closed
      )}
    >
      <SidebarContent sidebarOpen={sidebarOpen} />
      <div className={cx("page-sidebar__footer", "flex", "p-2")}>
        <IconButton onClick={handleSidebarToggle}>
          {sidebarOpen ? (
            <ChevronDoubleLeftIcon size="xs" />
          ) : (
            <ChevronDoubleRightIcon size="xs" />
          )}
        </IconButton>
      </div>
    </div>
  );
}
