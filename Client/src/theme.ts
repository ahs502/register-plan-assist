import { createMuiTheme } from '@material-ui/styles';
import { purple } from '@material-ui/core/colors';

let theme = createMuiTheme({
  palette: {
    primary: { main: '#596BEC' },
    secondary: purple
  },
  typography: {
    useNextVariants: true
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

export default theme;
