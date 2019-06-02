import React, { PureComponent } from 'react';

import { MuiThemeProvider } from '@material-ui/core/styles';
import theme from './theme';

import { HashRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import PreplanListPage from './pages/preplan-list';
import PreplanPage from './pages/preplan';
import MasterDataPage from './pages/master-data';

import AppBar from './components/AppBar';

class App extends PureComponent {
  render() {
    return (
      <MuiThemeProvider theme={theme}>
        <Router>
          <AppBar user={{ displayName: 'Moradi' }} />
          <Switch>
            <Redirect exact from="/" to="/preplan-list" />
            <Route exact path="/preplan-list" component={PreplanListPage} />
            <Route path="/preplan/:id" component={PreplanPage} />
            <Route exact path="/master-data/:table?" component={MasterDataPage} />
            <Redirect to="/" />
          </Switch>
        </Router>
      </MuiThemeProvider>
    );
  }
}

export default App;
