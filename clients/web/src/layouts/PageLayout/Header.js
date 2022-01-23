import React from "react";
import { Link } from "react-router-dom";

import { getLoginUrl, useAuth } from "context/auth";
import cx from "lib/classnames";
import { getPublicImage } from "lib/image";
import * as routes from "lib/routes";
import { sizes } from "lib/styles";

import MobileMenu from "./MobileMenu";
import Me from "components/Me/Me";
import CreateBoardButton from "components/CreateBoardButton/CreateBoardButton";

export const headerLogo = getPublicImage(
  "logo_primary_color_476x142_light.png"
);

export function Logo() {
  return (
    <span className={cx("flex items-center")}>
      <Link className="mr-4 pr-6 py-2" to={routes.HOME_PAGE}>
        <img className="h-5" src={headerLogo} alt="bustl" />
      </Link>
    </span>
  );
}

function Header() {
  const auth = useAuth();

  const login = () => {
    window.location.assign(getLoginUrl());
  };

  return (
    <header
      className={cx(
        "page-layout-header",
        "z-header",
        "flex items-center border-b bg-white",
        "shadow-sm",
        "fixed top-0 right-0 left-0",
        sizes.headerHeight
      )}
    >
      <nav className={cx("relative", "flex flex-1 items-center", "h-full")}>
        <MobileMenu />
        <div className="pl-2 md:pl-3">
          <Logo />
        </div>
      </nav>

      <CreateBoardButton />

      {auth.user ? (
        <span className="flex items-center justify-center mr-2 h-full">
          <Me />
        </span>
      ) : (
        <button onClick={login}>Login</button>
      )}
    </header>
  );
}

export default Header;
