import { createTheme, MuiThemeProvider } from "@material-ui/core/styles";

import { PRIMARY_COLOR } from "./colors";

const theme = createTheme({
  palette: {
    primary: {
      main: PRIMARY_COLOR,
    },
  },
  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Oxygen",
      "Cantarell",
      "Fira Sans",
      "Droid Sans",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
    ].join(","),
  },
});

export default function ThemeProvider({ children }) {
  return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>;
}
