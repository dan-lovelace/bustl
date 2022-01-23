import React from "react";

import cx from "lib/classnames";
import { sizes } from "lib/styles";

import Header from "layouts/PageLayout/Header";
import Sidebar from "layouts/PageLayout/Sidebar";

function BodyContent({ children, className }) {
  return (
    <div
      className={cx(
        "page-content",
        "flex-1 relative overflow-y-auto",
        className
      )}
    >
      {children}
    </div>
  );
}

function Main({ children }) {
  return (
    <main className={cx("page-layout-main", "h-full", "flex")}>
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <BodyContent>{children}</BodyContent>
    </main>
  );
}

function PageLayout({ children }) {
  return (
    <div className={cx("page-layout", "h-full", sizes.headerHeightTopPadding)}>
      <Header />
      <Main>{children}</Main>
    </div>
  );
}

export default PageLayout;
