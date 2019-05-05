import React, { Component } from 'react';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import purple from '@material-ui/core/colors/purple';

import SampleComponent from './SampleComponent';

let theme = createMuiTheme({
  palette: {
    primary: { main: '#596BEC' },
    secondary: purple
  }
});
declare module '@material-ui/core/styles/createPalette' {
  interface Palette {
    extraColors: {
      normalFlight: string;
      canceledFlight: string;
      erroredFlight: string;
      warnedFlight: string;
      includedRegister: string;
      backupRegister: string;
      excludedRegister: string;
    };
  }
}
theme.palette.extraColors = {
  normalFlight: '#0099FF',
  canceledFlight: '#BB8C59',
  erroredFlight: '#FF3300',
  warnedFlight: '#FF9933',
  includedRegister: '#FFFFFF',
  backupRegister: '#FFFFCC',
  excludedRegister: '#CCCCCC'
};

class App extends Component {
  render() {
    return (
      <MuiThemeProvider theme={theme}>
        <div>Application!</div>
        <SampleComponent />
        <SampleComponent />
        <SampleComponent />
      </MuiThemeProvider>
    );
  }
}

export default App;
