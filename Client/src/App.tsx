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
import persistant from 'src/utils/persistant';
import config from 'src/config';
import AuthenticationResultModel from '@core/models/authentication/AuthenticationResultModel';

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
    Promise.resolve()
      .then(removeQueryStringFromUrl)
      .then(processUserAuthentication)
      .then(fetchMasterData)
      .then(() => setInitializing(false));

    function removeQueryStringFromUrl(): URL {
      const url = new URL(window.location.href);
      const uri = window.location.toString();
      if (uri.includes('?')) {
        const clean_uri = uri.substring(0, uri.indexOf('?'));
        window.history.replaceState({}, document.title, clean_uri);
      }
      return url;
    }

    async function processUserAuthentication(url: URL): Promise<void> {
      if (isUserAuthenticated()) return;

      try {
        const error = url.searchParams.get('error');
        if (error) throw error;

        const code = url.searchParams.get('code');
        if (!code) {
          const loginUrl = `${config.oauth.serverIssuer}?client_id=${config.oauth.clientId}&redirect_uri=${config.oauth.clientUrl}&response_type=code&lang=${config.oauth.lang}&resource=${config.oauth.resourceName}`;
          window.location.href = loginUrl;
          return;
        }

        const response = await fetch('/api/oauth/get-authentication', {
          method: 'POST',
          cache: 'no-cache',
          headers: {
            'Content-Type': 'application/json'
          },
          redirect: 'follow',
          body: JSON.stringify({ oauthCode: code })
        });

        if (!response.ok) throw 'Unable to fetch result from "/api/oauth/get-authentication".';

        const authenticationResult: AuthenticationResultModel = await response.json();
        if (authenticationResult.error) throw authenticationResult.error;

        const { authentication, encodedAuthenticationHeader } = authenticationResult;
        persistant.oauthCode = code;
        persistant.refreshToken = authentication!.refreshToken;
        persistant.user = authentication!.user;
        persistant.userSettings = authentication!.userSettings;
        persistant.encodedAuthenticationHeader = encodedAuthenticationHeader;
      } catch (error) {
        throwApplicationError.withTitle('User authentication failed.')(error);
      }
    }

    async function fetchMasterData(): Promise<void> {
      if (!isUserAuthenticated()) return;

      try {
        const masterDataModel = await MasterDataService.get(...(Object.keys(MasterData.all) as (keyof MasterDataModel)[]));
        MasterData.recieve(masterDataModel);
      } catch (error) {
        throwApplicationError.withTitle('Unable to fetch master data.')(error);
      }
    }

    function isUserAuthenticated(): boolean {
      return !!persistant.oauthCode && !!persistant.refreshToken && !!persistant.user && !!persistant.userSettings && !!persistant.encodedAuthenticationHeader;
    }
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
