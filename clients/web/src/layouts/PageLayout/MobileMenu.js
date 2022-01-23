import React, { useState } from "react";

import cx from "lib/classnames";
import { sizes } from "lib/styles";

import { Logo } from "./Header";
import { SidebarContent } from "./Sidebar";
import IconButton from "components/Button/IconButton";
import CloseIcon from "components/Icons/CloseIcon";
import DotsVerticalIcon from "components/Icons/DotsVerticalIcon";

export default function MobileMenu() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className={cx("md:hidden", "ml-3")}>
      <IconButton onClick={handleSidebarToggle}>
        <DotsVerticalIcon />
      </IconButton>

      {sidebarOpen && (
        <div
          className={cx(
            "fixed left-0 top-0 right-0 bottom-0",
            "bg-gray-600",
            "opacity-60"
          )}
          onClick={handleSidebarToggle}
        />
      )}

      <div
        className={cx(
          "absolute left-0 top-0",
          "bg-white",
          "flex flex-col",
          "h-screen",
          "transition-all",
          "overflow-hidden",
          "shadow-md",
          sidebarOpen ? sizes.sidebar.open : "w-0"
        )}
      >
        <div className="flex items-center pl-3 pr-2 py-2">
          <div className="flex-1">
            <Logo />
          </div>
          <IconButton onClick={handleSidebarToggle}>
            <CloseIcon />
          </IconButton>
        </div>
        <div
          className={cx(
            "overflow-x-hidden overflow-y-auto",
            "pb-28 lg:pb-0" // bottom padding on mobile to resolve iOS issue
          )}
        >
          <SidebarContent
            closeOnRedirect
            sidebarOpen
            setSidebarOpen={setSidebarOpen}
          />
        </div>
      </div>
    </div>
  );
}
