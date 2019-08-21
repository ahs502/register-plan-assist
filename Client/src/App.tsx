import React, { FC, useState, useEffect } from 'react';

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

  return (
    <ThemeProvider theme={theme}>
      {initializing && <div>Loading, please wait...</div>}
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
    </ThemeProvider>
  );
};

export default App;
