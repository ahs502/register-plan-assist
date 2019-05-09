import React, { PureComponent } from 'react';
import { WithStyles, Theme, createStyles, withStyles } from '@material-ui/core/styles';
import SideBarContainer from './SideBarContainer';

const styles = (theme: Theme) => createStyles({});

interface Props extends WithStyles<typeof styles> {}
interface State {}

class SettingsSideBar extends PureComponent<Props, State> {
  render() {
    return <SideBarContainer label="Auto-Arranger Options">options...</SideBarContainer>;
  }
}

export default withStyles(styles)(SettingsSideBar);
