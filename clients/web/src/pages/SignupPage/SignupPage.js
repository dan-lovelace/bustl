import { getSignupUrl } from "context/auth";

const SignupPage = () => {
  window.location.replace(getSignupUrl());

  return false;
};

export default SignupPage;
