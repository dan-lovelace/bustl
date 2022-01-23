import React from "react";

import LinkButton from "components/Button/LinkButton";

export const FEEDBACK_FORM_ID = "FEEDBACK";
export const HELP_FORM_ID = "HELP";

export const contactFormSubjects = {
  [HELP_FORM_ID]: {
    copy: (
      <div>
        Having trouble? Briefly describe your problem below or email{" "}
        {/* We take support messages very seriously. Use the form below or email{" "} */}
        <LinkButton>
          <a href="mailto:support@bus.tl" className="select-text">
            support@bus.tl
          </a>
        </LinkButton>{" "}
        directly.
      </div>
    ),
    label: "Get help",
  },
  [FEEDBACK_FORM_ID]: {
    copy: <div></div>,
    label: "Leave feedback",
  },
};
