import React from "react";

import { getSignupUrl } from "../utils/helpers";

import Button from "./button";

export default function SignupButton({ text = "Sign up", ...props }) {
  return (
    <a href={getSignupUrl()}>
      <Button secondary {...props}>
        {text}
      </Button>
    </a>
  );
}
