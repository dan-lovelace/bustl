import React from "react";
import { Link } from "gatsby";
import { Helmet } from "react-helmet";

import logoMask from "../images/logo-mask.png";
import {
  classnames as cx,
  getLoginUrl,
  handleMobileMenuClick,
} from "../utils/helpers";
import { CONTACT_PAGE_ROUTE, HOME_PAGE_ROUTE } from "../utils/routes";

import ChevronRightIcon from "./icons/ChevronRight";
import MenuIcon from "./icons/Menu";
import Button from "./button";

const headerButtonClass =
  "flex items-center bg-white bg-opacity-10 hover:bg-opacity-20 shadow-none";

function NavLink({ children, className, to, ...rest }) {
  return (
    <a
      href={to}
      className={cx(
        "transition-colors",
        "rounded-lg",
        "hover:bg-opacity-10 hover:bg-white",
        "px-4 py-2",
        "text-center",
        className
      )}
      {...rest}
    >
      {children}
    </a>
  );
}

function Logo() {
  return (
    <Link to="/" className="py-4">
      <img src={logoMask} alt="logo" className="h-6 inline-block" />
    </Link>
  );
}

function MobileMenu() {
  const onLinkClick = () => {
    handleMobileMenuClick();
  };

  return (
    <div
      className={cx(
        "mobile-menu",
        "hidden sm:invisible",
        "fixed top-0 left-2",
        "bg-blue-600 text-white",
        "p-2 mt-20",
        "z-10",
        "rounded-b-lg border-t-8 border-yellow-500",
        "shadow-lg"
      )}
    >
      <div className="mb-2">
        <NavLink
          className="w-full block px-20"
          onClick={onLinkClick}
          to={HOME_PAGE_ROUTE}
        >
          Home
        </NavLink>
      </div>
      <div className="mb-2">
        <NavLink
          className="w-full block px-20"
          onClick={onLinkClick}
          to={`${HOME_PAGE_ROUTE}#about`}
        >
          About
        </NavLink>
      </div>
      <div className="">
        <NavLink
          className="w-full block px-20"
          onClick={onLinkClick}
          to={CONTACT_PAGE_ROUTE}
        >
          Contact
        </NavLink>
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="fixed left-0 top-0 right-0 h-20 bg-blue-600 z-10 shadow-lg">
      <div className="flex items-center h-full container mx-auto px-5 sm:px-10 text-white">
        {/* mobile layout */}
        <div className="flex flex-1 sm:hidden">
          <Button
            className={headerButtonClass}
            compact
            onClick={handleMobileMenuClick}
          >
            <MenuIcon />
          </Button>
        </div>
        {/* desktop layout */}
        <nav className="flex-1 items-center hidden sm:flex">
          <div className="sm:mr-10">
            <Logo />
          </div>
          <NavLink to={`${HOME_PAGE_ROUTE}#about`} className="mr-2">
            About
          </NavLink>
          <NavLink to={CONTACT_PAGE_ROUTE} className="mr-2">
            Contact
          </NavLink>
        </nav>
        <NavLink className={headerButtonClass} href={getLoginUrl()}>
          {/* <Button  compact> */}
          Log in <ChevronRightIcon className="ml-2" size="sm" />
          {/* </Button> */}
        </NavLink>
        {/* <NavLink
          className="bg-white bg-opacity-10 hover:bg-opacity-20 mr-0"
          to={getLoginUrl()}
        >
          <span className="flex items-center">
            Log in <ChevronRightIcon className="ml-2" size="sm" />
          </span>
        </NavLink> */}
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className={cx("py-6")}>
      <div className="container mx-auto px-5 sm:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 text-center md:text-left">
          <div className="mb-4">
            <span className="">Copyright &copy; 2021 LogicNow LLC</span>
          </div>
          <div className="mb-4 md:text-right">
            <Link to="/terms" className="mr-8">
              Terms and Conditions
            </Link>
            <Link to="/privacy">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function LayoutContainer({ children, className, noPadding = false }) {
  return (
    <div
      className={cx(
        !noPadding && "container mx-auto mt-20 py-20 px-10",
        className
      )}
    >
      {children}
    </div>
  );
}

export default function Layout({ children, className }) {
  return (
    <div className={cx("layout flex flex-col", className)}>
      <Helmet>
        <meta charSet="utf-8" />
        <meta
          name="description"
          content="Use uploaded photos of your whiteboarding sessions to organize brainstorms, manage projects and boost efficiency."
        />
        <title>bus.tl - Organized whiteboard notes</title>
        <link rel="canonical" href="https://bus.tl" />
      </Helmet>
      <Header />
      <MobileMenu />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
