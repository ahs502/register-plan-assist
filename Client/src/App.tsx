import React, { FC, useState } from 'react';

import { ThemeProvider } from '@material-ui/styles';
import theme from './theme';

import { HashRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import PreplanListPage from './pages/preplan-list';
import PreplanPage from './pages/preplan';
import AppBar from './components/AppBar';
import RequestManager from './utils/RequestManager';
import MasterDataService from './services/MasterDataService';
import MasterData from '@core/master-data';

const App: FC = () => {
  const [loading, setLoading] = useState(false);
  const [fullScreen, setFullScreen] = useState(false); //TODO: Initialize from browser status.

  RequestManager.onProcessingChanged = processing => setLoading(processing);

  MasterDataService.get('aircraftTypes', 'aircraftRegisters', 'airports', 'seasonTypes', 'seasons', 'stcs', 'aircraftGroups', 'constraints').then(result => {
    if (result.message) throw result.message;
    MasterData.recieve(result.value!);
  });

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <AppBar loading={loading} fullScreen={fullScreen} />
        <Switch>
          <Redirect exact from="/" to="/preplan-list" />
          <Route exact path="/preplan-list" component={PreplanListPage} />
          <Route path="/preplan/:id" component={PreplanPage} />
          <Redirect to="/" />
        </Switch>
      </Router>
    </ThemeProvider>
  );
};

export default App;
