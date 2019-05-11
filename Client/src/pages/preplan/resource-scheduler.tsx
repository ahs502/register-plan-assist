import React, { PureComponent, Fragment } from 'react';
import { Theme, createStyles, WithStyles, withStyles } from '@material-ui/core/styles';
import { RouteComponentProps } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import { Drawer } from '@material-ui/core';
import AutoArrangerChangeLogSideBar from '../../components/preplan/resource-scheduler/AutoArrangerChangeLogSideBar';
import SearchFlightsSideBar from '../../components/preplan/resource-scheduler/SearchFlightsSideBar';
import ErrorsAndWarningsSideBar from '../../components/preplan/resource-scheduler/ErrorsAndWarningsSideBar';
import SelectAircraftRegistersSideBar from '../../components/preplan/resource-scheduler/SelectAircraftRegistersSideBar';
import SettingsSideBar from '../../components/preplan/resource-scheduler/SettingsSideBar';
import ResourceSchedulerView from '../../components/preplan/resource-scheduler/ResourceSchedulerView';
import FlightRequirementDialog from '../../components/preplan/FlightRequirementDialog';
import FlightRequirement from '../../business/FlightRequirement';

const styles = (theme: Theme) =>
  createStyles({
    sideBarBackdrop: {
      backgroundColor: 'transparent'
    },
    sideBarPaper: {
      top: 104
    },
    statusBar: {
      height: 54,
      border: '1px solid orange',
      backgroundColor: theme.palette.extraColors.backupRegister,
      margin: 0,
      padding: theme.spacing.unit * 2
    }
  });

enum SideBarType {
  AutoArrangerChangeLog,
  SearchFlights,
  ErrorsAndWarnings,
  SelectAircraftRegisters,
  Settings
}

interface Props extends WithStyles<typeof styles>, RouteComponentProps<{ id?: string }> {}
interface State {
  isSideBarOpen: boolean;
  sideBarType?: SideBarType;
  initialSideBarSearch?: string;
  isFlightRequirementDialogOpen: boolean;
}

class ResourceScheduler extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isSideBarOpen: false,
      sideBarType: undefined,
      initialSideBarSearch: undefined,
      isFlightRequirementDialogOpen: false
    };
  }

  getId = (): number => Number(this.props.match.params.id);

  openAutoArrangerChangeLogSideBar = (initialSearch?: string) => {
    this.setState((previousState: State) => ({ ...previousState, isSideBarOpen: true, sideBarType: SideBarType.AutoArrangerChangeLog, initialSearch }));
  };
  openSearchFlightsSideBar = (initialSearch?: string) => {
    this.setState((previousState: State) => ({ ...previousState, isSideBarOpen: true, sideBarType: SideBarType.SearchFlights, initialSearch }));
  };
  openErrorsAndWarningsSideBar = (initialSearch?: string) => {
    this.setState((previousState: State) => ({ ...previousState, isSideBarOpen: true, sideBarType: SideBarType.ErrorsAndWarnings, initialSearch }));
  };
  openSelectAircraftRegistersSideBar = (initialSearch?: string) => {
    this.setState((previousState: State) => ({ ...previousState, isSideBarOpen: true, sideBarType: SideBarType.SelectAircraftRegisters, initialSearch }));
  };
  openSettingsSideBar = () => {
    this.setState((previousState: State) => ({ ...previousState, isSideBarOpen: true, sideBarType: SideBarType.Settings }));
  };
  sideBarCloseHandler = () => {
    this.setState((previousState: State) => ({ ...previousState, isSideBarOpen: false }));
  };

  openFlightRequirementDialog = () => {
    this.setState({ ...this.state, isFlightRequirementDialogOpen: true });
  };

  flightRequirementDialogSubmitHandler = (flightRequirement: FlightRequirement) => {
    this.setState({ ...this.state, isFlightRequirementDialogOpen: false });
  };
  flightRequirementDialogDismissHandler = () => {
    this.setState({ ...this.state, isFlightRequirementDialogOpen: false });
  };

  render() {
    const { classes } = this.props;
    const { isSideBarOpen, sideBarType, initialSideBarSearch, isFlightRequirementDialogOpen } = this.state;

    return (
      <Fragment>
        <NavBar
          navBarLinks={[
            {
              title: 'Pre Plan ' + this.getId(),
              link: '/preplan/' + this.getId()
            }
          ]}
        >
          Pre Plan {this.getId()} Resource Scheduler
          <button onClick={() => this.openAutoArrangerChangeLogSideBar('something')}>AACL</button>
          <button onClick={() => this.openSearchFlightsSideBar('something')}>SF</button>
          <button onClick={() => this.openErrorsAndWarningsSideBar('something')}>E&amp;W</button>
          <button onClick={() => this.openSelectAircraftRegistersSideBar('something')}>SAR</button>
          <button onClick={this.openSettingsSideBar}>S</button>
          <button onClick={this.openFlightRequirementDialog}>FRD</button>
        </NavBar>
        <Drawer
          anchor="right"
          open={isSideBarOpen}
          onClose={this.sideBarCloseHandler}
          ModalProps={{ BackdropProps: { classes: { root: classes.sideBarBackdrop } } }}
          classes={{ paper: classes.sideBarPaper }}
        >
          {sideBarType === SideBarType.AutoArrangerChangeLog && <AutoArrangerChangeLogSideBar initialSearch={initialSideBarSearch} />}
          {sideBarType === SideBarType.SearchFlights && <SearchFlightsSideBar initialSearch={initialSideBarSearch} />}
          {sideBarType === SideBarType.ErrorsAndWarnings && <ErrorsAndWarningsSideBar initialSearch={initialSideBarSearch} objections={[]} />}
          {sideBarType === SideBarType.SelectAircraftRegisters && <SelectAircraftRegistersSideBar initialSearch={initialSideBarSearch} />}
          {sideBarType === SideBarType.Settings && <SettingsSideBar />}
        </Drawer>
        <ResourceSchedulerView />
        <div className={classes.statusBar}>Status Bar</div>
        <FlightRequirementDialog
          flightRequirement={undefined}
          open={isFlightRequirementDialogOpen}
          onSubmit={this.flightRequirementDialogSubmitHandler}
          onDismiss={this.flightRequirementDialogDismissHandler}
        />
      </Fragment>
    );
  }
}

export default withStyles(styles)(ResourceScheduler);
