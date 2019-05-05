import React, { PureComponent } from 'react';

import { MuiThemeProvider } from '@material-ui/core/styles';
import theme from './theme';

import { HashRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import PreplanList from './pages/preplan-list';
import Preplan from './pages/preplan';
import PreplanReports from './pages/preplan/reports';
import PreplanReportsProposal from './pages/preplan/reports/proposal';
import PreplanReportsConnections from './pages/preplan/reports/connections';
import PreplanFlightRequirements from './pages/preplan/flight-requirements';
import MasterData from './pages/master-data';
import MasterDataAircraftGroups from './pages/master-data/aircraft-groups';
import MasterDataConstraints from './pages/master-data/constraints';

class App extends PureComponent {
  render() {
    return (
      <MuiThemeProvider theme={theme}>
        <Router>
          {/* <div>Some contents...</div> */}
          <Switch>
            <Redirect exact from="/" to="/preplan-list" />
            <Route exact path="/preplan-list" component={PreplanList} />
            <Route exact path="/preplan/:id" component={Preplan} />
            <Route exact path="/preplan/:id/reports" component={PreplanReports} />
            <Route exact path="/preplan/:id/reports/proposal" component={PreplanReportsProposal} />
            <Route exact path="/preplan/:id/reports/connections" component={PreplanReportsConnections} />
            <Route exact path="/preplan/:id/flight-requirements" component={PreplanFlightRequirements} />
            <Route exact path="/master-data" component={MasterData} />
            <Route exact path="/master-data/aircraft-groups" component={MasterDataAircraftGroups} />
            <Route exact path="/master-data/constraints" component={MasterDataConstraints} />
            <Redirect to="/" />
          </Switch>
        </Router>
      </MuiThemeProvider>
    );
  }
}

export default App;
