import React, { PureComponent } from 'react';

import { MuiThemeProvider } from '@material-ui/core/styles';
import theme from './theme';

import { HashRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import PreplanList from './pages/preplan-list';
import Preplan from './pages/preplan';
import MasterData from './pages/master-data';

import AppBar from './components/AppBar';

class App extends PureComponent {
  render() {
    return (
      <MuiThemeProvider theme={theme}>
        <Router>
          <AppBar />
          <Switch>
            <Redirect exact from="/" to="/preplan-list" />
            <Route exact path="/preplan-list" component={PreplanList} />
            <Route path="/preplan/:id" component={Preplan} />
            <Route exact path="/master-data/:table?" component={MasterData} />
            <Redirect to="/" />
          </Switch>
        </Router>
      </MuiThemeProvider>
    );
  }
}

export default App;
