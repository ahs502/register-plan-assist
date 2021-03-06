import { createMuiTheme } from '@material-ui/core';
import { purple } from '@material-ui/core/colors';

let theme = createMuiTheme({
  palette: {
    primary: { main: '#596BEC' },
    secondary: { main: '#00BCD4' }
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
      ignoredRegister: string;
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
  ignoredRegister: '#CCCCCC'
};

export default theme;
