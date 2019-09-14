import React, { FC, useState, useEffect } from 'react';

import { CircularProgress, Theme } from '@material-ui/core';
import { ThemeProvider, makeStyles } from '@material-ui/styles';
import theme from './theme';
import RequestManager from './utils/RequestManager';
import MasterDataService from './services/MasterDataService';
import MasterData from '@core/master-data';
import { HashRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import PreplanListPage from './pages/preplan-list';
import PreplanPage from './pages/preplan';
import AppBar from './components/AppBar';
import { SnackbarProvider } from 'notistack';

const useStyles = makeStyles((theme: Theme) => ({
  progress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -24,
    marginLeft: -24
  }
}));

const App: FC = () => {
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    MasterDataService.get('aircraftTypes', 'aircraftRegisters', 'airports', 'seasonTypes', 'seasons', 'stcs', 'aircraftGroups', 'constraints').then(result => {
      if (result.message) throw result.message;
      MasterData.recieve(result.value!);
      setInitializing(false);
    });
  }, []);

  RequestManager.onProcessingChanged = processing => setLoading(processing);

  const classes = useStyles();

  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider maxSnack={5}>
        {initializing && <CircularProgress size={48} className={classes.progress} />}
        {!initializing && (
          <Router>
            <AppBar loading={loading} />
            <Switch>
              <Redirect exact from="/" to="/preplan-list" />
              <Route exact path="/preplan-list" component={PreplanListPage} />
              <Route path="/preplan/:id" component={PreplanPage} />
              <Redirect to="/" />
            </Switch>
          </Router>
        )}
      </SnackbarProvider>
    </ThemeProvider>
  );
};

export default App;
