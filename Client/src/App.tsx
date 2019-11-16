import React, { FC, useState, useEffect, useCallback, Fragment } from 'react';
import { CircularProgress, Theme } from '@material-ui/core';
import { ThemeProvider, makeStyles } from '@material-ui/styles';
import theme from './theme';
import RequestManager from './utils/RequestManager';
import MasterDataService from './services/MasterDataService';
import MasterData from '@core/master-data';
import { Switch, Route, Redirect } from 'react-router-dom';
import PreplanListPage from './pages/preplan-list';
import PreplanPage from './pages/preplan';
import AppBar from './components/AppBar';
import { SnackbarProvider } from 'notistack';
import MasterDataModel from '@core/models/master-data/MasterDataModel';
import ErrorPage, { useThrowApplicationError } from 'src/pages/error';

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

  const throwApplicationError = useThrowApplicationError();

  useEffect(() => {
    MasterDataService.get(...(Object.keys(MasterData.all) as (keyof MasterDataModel)[]))
      .then(MasterData.recieve, throwApplicationError.withTitle('Unable to fetch master data.'))
      .then(() => setInitializing(false));
  }, []);

  RequestManager.onProcessingChanged = useCallback(processing => setLoading(processing), []);

  const classes = useStyles();

  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider maxSnack={5}>
        {initializing && <CircularProgress size={48} className={classes.progress} />}
        {!initializing && (
          <Fragment>
            <AppBar loading={loading} />
            <Switch>
              <Redirect exact from="/" to="/preplan-list" />
              <Route exact path="/preplan-list" component={PreplanListPage} />
              <Route path="/preplan/:id" component={PreplanPage} />
              <Route exact path="/error" component={ErrorPage} />
              <Redirect to="/" />
            </Switch>
          </Fragment>
        )}
      </SnackbarProvider>
    </ThemeProvider>
  );
};

export default App;
