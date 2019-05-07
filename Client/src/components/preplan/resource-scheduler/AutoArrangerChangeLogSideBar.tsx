import React, { PureComponent } from 'react';
import { WithStyles, Theme, createStyles, withStyles } from '@material-ui/core/styles';
import SideBarContainer from './SideBarContainer';

const styles = (theme: Theme) => createStyles({});

interface Props extends WithStyles<typeof styles> {}
interface State {}

class AutoArrangerChangeLogSideBar extends PureComponent<Props, State> {
  render() {
    return <SideBarContainer label="Auto-Arranger Change Log">logs...</SideBarContainer>;
  }
}

export default withStyles(styles)(AutoArrangerChangeLogSideBar);
