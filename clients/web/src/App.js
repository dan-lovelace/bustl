import { useEffect, useState } from "react";
import { Auth } from "aws-amplify";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";

import "./App.css";
import { useAuth } from "context/auth";
import Routes from "Routes";
import MuiThemeProvider from "styles/mui-theme";

import ToastContainer from "components/Notification/NotificationContainer";

function App() {
  const [userFetched, setUserFetched] = useState(false);
  const auth = useAuth();

  useEffect(() => {
    async function getUser() {
      try {
        const user = await Auth.currentAuthenticatedUser();
        auth.signin(user);
      } catch (e) {
        console.log("User not authenticated");
      } finally {
        setUserFetched(true);
      }
    }

    getUser();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    userFetched && (
      <MuiThemeProvider>
        <MuiPickersUtilsProvider utils={MomentUtils}>
          <Routes />
          <ToastContainer />
        </MuiPickersUtilsProvider>
      </MuiThemeProvider>
    )
  );
}

export default App;
