import React, { useEffect } from "react";
import { MuiThemeProvider } from "@material-ui/core";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store";

import { theme } from "./themes/theme";
import Routes from "./routes";
import axios from "axios";

function App() {
  useEffect(() => {
    const getCsrfToken = async () => {
      // get csrf token
      await axios.get("/auth/csrf-token");
    };
    getCsrfToken();
  }, []);

  return (
    <Provider store={store}>
      <MuiThemeProvider theme={theme}>
        <BrowserRouter>
          <Routes />
        </BrowserRouter>
      </MuiThemeProvider>
    </Provider>
  );
}

export default App;
