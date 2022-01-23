import React from "react";
import ReactDOM from "react-dom";

import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { ProvideAuth } from "context/auth";
import ApolloProvider from "lib/apollo";

import { BOARD_IMAGE_CONTAINER_CLASS_NAME } from "components/BoardDetails/lib/utils";

// add a resize event listener to the window to readjust the board
// image container component's height. this was added to resolve
// a terrible bug on iOS. it is manually invoked in the container
// component itself when the image is done loading.
window.addEventListener("resize", () => {
  const ele = document.getElementsByClassName(BOARD_IMAGE_CONTAINER_CLASS_NAME);

  if (ele && ele.length) {
    ele[0].style.height = `${window.innerHeight}px`;
  }
});

ReactDOM.render(
  <React.StrictMode>
    <ApolloProvider>
      <ProvideAuth>
        <App />
      </ProvideAuth>
    </ApolloProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
