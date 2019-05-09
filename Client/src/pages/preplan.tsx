import React, { Component } from 'react';
import { WithStyles, createStyles, withStyles, Theme } from '@material-ui/core/styles';

import { RouteComponentProps, Switch, Redirect, Route } from 'react-router-dom';
import ResourceScheduler from './preplan/resource-scheduler';
import FlightRequirements from './preplan/flight-requirements';
import Reports from './preplan/reports';

const styles = (theme: Theme) => createStyles({});

interface Props extends WithStyles<typeof styles>, RouteComponentProps<{ id?: string }> {}
interface State {}

class Preplan extends Component<Props, State> {
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
        <Route exact path={match.path + '/resource-scheduler'} component={ResourceScheduler} />
        <Route exact path={match.path + '/flight-requirements'} component={FlightRequirements} />
        <Route exact path={match.path + '/reports/:report?'} component={Reports} />
        <Redirect to={match.url} />
      </Switch>
    );
  }
}

export default withStyles(styles)(Preplan);
