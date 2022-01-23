import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { withStyles } from "@material-ui/styles";
import MenuList from "@material-ui/core/MenuList";
import MenuItem from "@material-ui/core/MenuItem";
import Popover from "@material-ui/core/Popover";

import { useAuth } from "context/auth";
import cx from "lib/classnames";
import { contactFormSubjects } from "lib/contact-message";
import { useMeQuery } from "lib/gql/queries/appUser";
import * as routes from "lib/routes";

import Button from "components/Button/Button";
import IconButton from "components/Button/IconButton";
import ContactModal from "components/ContactModal/ContactModal";
import UserIcon from "components/Icons/UserIcon";
import Spinner from "components/Loader/Spinner";

const popoverId = "me-menu-popover";

const StyledMenuItem = withStyles({
  root: {
    justifyContent: "end",
  },
})(MenuItem);

const StyledPopover = withStyles({
  paper: {
    maxWidth: "20rem",
  },
})(Popover);

export default function Me() {
  const auth = useAuth();
  const { pathname } = useLocation();
  const [anchorEl, setAnchorEl] = useState(false);
  const [contactFormOpen, setContactFormOpen] = useState(false);
  const { loading, error, data } = useMeQuery();

  const handleContactClick = (subject) => () => {
    handleMenuClose();
    setContactFormOpen(subject);
  };

  const handleContactClose = () => {
    setContactFormOpen(false);
  };

  const handleMenuToggleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center w-12 pl-3">
        <Spinner />
      </div>
    );
  }

  if (error) return `Error! ${error.message}`;
  if (!data || !data.me) return "No data";

  const { me } = data;

  const showMenu = !!anchorEl;
  const currentPath = pathname.startsWith(routes.ACCOUNT_PAGE);

  return (
    <div className={cx("")}>
      <IconButton
        aria-describedby={popoverId}
        className={cx(
          "rounded-full",
          currentPath && "bg-blue-100 hover:bg-blue-200"
        )}
        onClick={handleMenuToggleClick}
      >
        <UserIcon
          size="sm"
          color={currentPath ? "text-blue-700" : "text-gray-500"}
        />
      </IconButton>
      <StyledPopover
        id={popoverId}
        open={showMenu}
        anchorEl={anchorEl}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <MenuList>
          <div className="px-4 pb-2">
            <div className="text-sm">You are signed in as:</div>
            <div className="font-bold mb-2 break-words">{me.email}</div>
            <Link className="inline-block" to={routes.ACCOUNT_PAGE}>
              <Button primary onClick={handleMenuClose}>
                Manage account
              </Button>
            </Link>
          </div>
          {Object.keys(contactFormSubjects).map((key, idx) => (
            <StyledMenuItem key={idx} onClick={handleContactClick(key)}>
              {contactFormSubjects[key].label}
            </StyledMenuItem>
          ))}
          <hr className="my-2" />
          <StyledMenuItem onClick={auth.signout}>Log out</StyledMenuItem>
        </MenuList>
      </StyledPopover>

      {contactFormOpen && (
        <ContactModal onClose={handleContactClose} variant={contactFormOpen} />
      )}
    </div>
  );
}
