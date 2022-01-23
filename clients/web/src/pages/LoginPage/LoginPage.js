import { getLoginUrl } from "context/auth";

const LoginPage = () => {
  window.location.replace(getLoginUrl());

  return false;
};

export default LoginPage;
