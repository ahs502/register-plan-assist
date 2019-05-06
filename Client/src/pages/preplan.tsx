import React, { PureComponent } from 'react';
import { WithStyles, createStyles, withStyles, Theme } from '@material-ui/core/styles';

import { RouteComponentProps, Switch, Redirect, Route } from 'react-router-dom';
import Timeline from './preplan/timeline';
import FlightRequirements from './preplan/flight-requirements';
import Reports from './preplan/reports';

const styles = (theme: Theme) => createStyles({});

interface Props extends WithStyles<typeof styles>, RouteComponentProps<{ id?: string }> {}

class Preplan extends PureComponent<Props> {
  getId = (): number => Number(this.props.match.params.id);

  render() {
    const { match } = this.props;

    return (
      <React.Fragment>
        <div>Pre Plan {this.getId()}</div>
        <Switch>
          <Redirect exact from={match.url} to={match.url + '/timeline'} />
          <Route exact path={match.path + '/timeline'} component={Timeline} />
          <Route exact path={match.path + '/flight-requirements'} component={FlightRequirements} />
          <Route path={match.path + '/reports'} component={Reports} />
          <Redirect to={match.url} />
        </Switch>
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(Preplan);
