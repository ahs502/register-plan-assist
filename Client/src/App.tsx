import React, { FC } from 'react';

import { ThemeProvider } from '@material-ui/styles';
import theme from './theme';

import { HashRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import PreplanListPage from './pages/preplan-list';
import PreplanPage from './pages/preplan';
import AppBar from './components/AppBar';

const App: FC = () => (
  <ThemeProvider theme={theme}>
    <Router>
      <AppBar user={{ displayName: 'Moradi' }} />
      <Switch>
        <Redirect exact from="/" to="/preplan-list" />
        <Route exact path="/preplan-list" component={PreplanListPage} />
        <Route path="/preplan/:id" component={PreplanPage} />
        <Redirect to="/" />
      </Switch>
    </Router>
  </ThemeProvider>
);

export default App;
