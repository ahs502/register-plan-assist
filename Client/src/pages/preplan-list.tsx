import React, { PureComponent } from 'react';
import { WithStyles, createStyles, withStyles, Theme } from '@material-ui/core/styles';

const styles = (theme: Theme) => createStyles({});

interface Props extends WithStyles<typeof styles> {}

class PreplanList extends PureComponent<Props> {
  render() {
    return <div>Pre Plan List</div>;
  }
}

export default withStyles(styles)(PreplanList);
