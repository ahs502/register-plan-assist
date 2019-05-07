import React, { PureComponent } from 'react';
import { WithStyles, Theme, createStyles, withStyles } from '@material-ui/core/styles';
import SideBarContainer from './SideBarContainer';

const styles = (theme: Theme) => createStyles({});

interface Props extends WithStyles<typeof styles> {}
interface State {}

class SelectAircraftRegistersSideBar extends PureComponent<Props, State> {
  render() {
    return <SideBarContainer label="Select Aircraft Registers">List of aircraft registers...</SideBarContainer>;
  }
}

export default withStyles(styles)(SelectAircraftRegistersSideBar);
