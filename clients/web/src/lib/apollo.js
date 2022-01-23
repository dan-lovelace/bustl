import { createAuthLink } from "aws-appsync-auth-link";
import Amplify, { Auth, Hub } from "aws-amplify";
import {
  ApolloProvider,
  ApolloClient,
  ApolloLink,
  createHttpLink,
  InMemoryCache,
} from "@apollo/client";

import { awsExports } from "context/auth";

// initialize auth layer using aws exports
// amplify takes care of exchanging authorization code for jwt tokens
Amplify.configure(awsExports);
Auth.configure();

// configure listeners for amplify auth events
const authListeners = {
  signIn: (data) => {
    // console.log("signIn data", data);
  },
  signIn_failure: (data) => {
    // console.log("signIn_failure data", data);
  },
};

Hub.listen("auth", (data) => {
  const {
    payload: { event: authEvent },
  } = data;

  if (Object.prototype.hasOwnProperty.call(authListeners, authEvent)) {
    authListeners[authEvent](data);
  }
});

// create a link between amplify auth and graphql requests
const userPoolsAuth = createAuthLink({
  url: awsExports.aws_appsync_graphqlEndpoint,
  region: awsExports.aws_appsync_region,
  auth: {
    type: awsExports.aws_appsync_authenticationType,
    jwtToken: async () => (await Auth.currentSession()).accessToken.jwtToken,
  },
});

// const iamAuth = createAuthLink({
//   url: awsExports.aws_appsync_graphqlEndpoint,
//   region: awsExports.aws_appsync_region,
//   auth: {
//     type: "AWS_IAM",
//     credentials: () => Auth.currentCredentials(),
//   },
//   complexObjectsCredentials: () => Auth.currentCredentials(),
// });

// const authSplit = ApolloLink.split(
//   (operation) => {
//     console.log("operation", operation);

//     return operation.operationName === "CreateImage";
//   },
//   iamAuth,
//   userPoolsAuth
// );

const link = ApolloLink.from([
  userPoolsAuth,
  createHttpLink({ uri: awsExports.aws_appsync_graphqlEndpoint }),
]);

// create the apollo client using the link
export const client = new ApolloClient({
  link,
  cache: new InMemoryCache({
    typePolicies: {
      NoteType: {
        fields: {
          notes: {
            merge(existing, incoming) {
              return incoming;
            },
          },
        },
      },
    },
  }),
});

// Auth.currentAuthenticatedUser().then((user) => {
//   console.log("User", user);
// });

export default function MyApolloProvider({ children }) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
