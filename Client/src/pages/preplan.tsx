import React, { Component } from 'react';
import { WithStyles, createStyles, withStyles, Theme } from '@material-ui/core/styles';

import { RouteComponentProps, Switch, Redirect, Route } from 'react-router-dom';
import ResourceSchedulerPage from './preplan/resource-scheduler';
import FlightRequirementsPage from './preplan/flight-requirements';
import ReportsPage from './preplan/reports';

const styles = (theme: Theme) => createStyles({});

interface Props extends WithStyles<typeof styles>, RouteComponentProps<{ id?: string }> {}
interface State {}

class PreplanPage extends Component<Props, State> {
  componentDidMount() {
    this.checkUrlAcceptance(this.props);
  }
  shouldComponentUpdate(nextProps: Props) {
    if (!this.checkUrlAcceptance(nextProps)) return false;
    //TODO: load preplan to state
    return true;
  }

  private checkUrlAcceptance(props: Props): boolean {
    const id = this.getId(props);
    if (isNaN(id) || !Boolean(id) || id < 0) {
      props.history.push(props.match.url.slice(0, -(props.match.params.id || '').length));
      return false;
    }
    return true;
  }

  getId = (props?: Props): number => Number((props || this.props).match.params.id);

  render() {
    const { match } = this.props;

    return (
      <Switch>
        <Redirect exact from={match.url} to={match.url + '/resource-scheduler'} />
        <Route exact path={match.path + '/resource-scheduler'} component={ResourceSchedulerPage} />
        <Route exact path={match.path + '/flight-requirements'} component={FlightRequirementsPage} />
        <Route exact path={match.path + '/reports/:report?'} component={ReportsPage} />
        <Redirect to={match.url} />
      </Switch>
    );
  }
}

export default withStyles(styles)(PreplanPage);
