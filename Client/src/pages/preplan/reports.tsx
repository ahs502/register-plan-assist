import React, { PureComponent } from 'react';
import { Theme, createStyles, WithStyles, withStyles } from '@material-ui/core/styles';
import { RouteComponentProps, Switch, Route, Redirect } from 'react-router-dom';

const styles = (theme: Theme) => createStyles({});

interface Props extends WithStyles<typeof styles>, RouteComponentProps<{ id?: string }> {}

class Reports extends PureComponent<Props> {
  getId = (): number => Number(this.props.match.params.id);

  render() {
    const { match } = this.props;

    return (
      <React.Fragment>
        <div>Pre Plan {this.getId()} Reports</div>
        <Switch>
          <Route exact path={match.path} render={() => <div>Pre Plan {this.getId()} Reports [Selection]</div>} />
          <Route exact path={match.path + '/proposal'} render={() => <div>Pre Plan {this.getId()} Reports Proposal</div>} />
          <Route exact path={match.path + '/connections'} render={() => <div>Pre Plan {this.getId()} Reports Connections</div>} />
          <Redirect to={match.url} />
        </Switch>
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(Reports);
