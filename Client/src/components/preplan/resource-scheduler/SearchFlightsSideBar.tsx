import React, { PureComponent } from 'react';
import { WithStyles, Theme, createStyles, withStyles } from '@material-ui/core/styles';
import SideBarContainer from './SideBarContainer';

const styles = (theme: Theme) => createStyles({});

interface Props extends WithStyles<typeof styles> {
  initialSearch?: string;
}
interface State {}

class SearchFlightsSideBar extends PureComponent<Props, State> {
  render() {
    return <SideBarContainer label="Search Flights">flights...</SideBarContainer>;
  }
}

export default withStyles(styles)(SearchFlightsSideBar);
