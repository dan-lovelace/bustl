import React, { createContext, useContext, useState } from "react";
import { Auth } from "aws-amplify";

const authContext = createContext();

function useProvideAuth() {
  const [user, setUser] = useState(null);

  const signin = (userData) => {
    setUser(userData);
  };

  const signout = () => {
    Auth.signOut();
    setUser(null);
  };

  return {
    user,
    signin,
    signout,
  };
}

export const awsExports = require("aws-exports");

export function ProvideAuth({ children }) {
  const auth = useProvideAuth();

  return <authContext.Provider value={auth}>{children}</authContext.Provider>;
}

export function useAuth() {
  return useContext(authContext);
}

function getAuthUrl(type = "login") {
  const {
    Auth: {
      userPoolWebClientId,
      oauth: { domain, redirectSignIn, responseType },
    },
  } = awsExports;

  return `https://${domain}/${type}?response_type=${responseType}&client_id=${userPoolWebClientId}&redirect_uri=${redirectSignIn}`;
}

export function getLoginUrl() {
  return getAuthUrl();
}

export function getSignupUrl() {
  return getAuthUrl("signup");
}
