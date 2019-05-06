import React, { PureComponent } from 'react';
import { WithStyles, createStyles, withStyles, Theme } from '@material-ui/core/styles';
import { RouteComponentProps, Switch, Route, Redirect } from 'react-router-dom';

const styles = (theme: Theme) => createStyles({});

interface Props extends WithStyles<typeof styles>, RouteComponentProps {}

class MasterData extends PureComponent<Props> {
  render() {
    const { match } = this.props;

    return (
      <React.Fragment>
        <div>Master Data</div>
        <Switch>
          <Route exact path={match.path} render={() => <div>Master Data [Selection]</div>} />
          <Route exact path={match.path + '/aircraft-groups'} render={() => <div>Master Data Aircraft Groups</div>} />
          <Route exact path={match.path + '/constraints'} render={() => <div>Master Data Constraints</div>} />
          <Redirect to={match.url} />
        </Switch>
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(MasterData);
