import React, { PureComponent } from 'react';
import { WithStyles, createStyles, withStyles, Theme } from '@material-ui/core/styles';
import NavBar from '../components/NavBar';

const styles = (theme: Theme) => createStyles({});

interface Props extends WithStyles<typeof styles> {}

class PreplanList extends PureComponent<Props> {
  render() {
    return <NavBar>Pre Plan List</NavBar>;
  }
}

export default withStyles(styles)(PreplanList);
