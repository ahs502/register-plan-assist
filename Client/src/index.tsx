import React from 'react';
import ReactDOM from 'react-dom';
import 'typeface-roboto';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import purple from '@material-ui/core/colors/purple';
import CssBaseline from '@material-ui/core/CssBaseline';
import * as serviceWorker from './serviceWorker';

import App from './App';

const theme = createMuiTheme({
  palette: {
    primary: { main: '#596BEC' },
    secondary: purple
  }
});

ReactDOM.render(
  <MuiThemeProvider theme={theme}>
    <React.Fragment>
      <CssBaseline />
      <App />
    </React.Fragment>
  </MuiThemeProvider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
