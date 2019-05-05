import React, { PureComponent } from 'react';
import { WithStyles, createStyles, withStyles, Theme } from '@material-ui/core/styles';

const styles = (theme: Theme) => createStyles({});

interface Props extends WithStyles<typeof styles> {}

class AircraftGroups extends PureComponent<Props> {
  render() {
    return <div>Master Data Aircraft Groups</div>;
  }
}

export default withStyles(styles)(AircraftGroups);
