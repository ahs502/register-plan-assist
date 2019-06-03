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
import FlightRequirementModal from '../../components/preplan/FlightRequirementModal';
import FlightRequirement from '../../business/FlightRequirement';
import LinkIconButton from '../../components/LinkIconButton';
import { IconButton, Select, OutlinedInput, Badge } from '@material-ui/core';
import { DoneAll as FinilizedIcon, LockOutlined as LockIcon, LockOpenOutlined as LockOpenIcon, Search as SearchIcon, SettingsOutlined as SettingsIcon } from '@material-ui/icons';
import MahanIcon, { MahanIconType } from '../../components/MahanIcon';

const styles = (theme: Theme) =>
  createStyles({
    sideBarBackdrop: {
      backgroundColor: 'transparent'
    },
    sideBarPaper: {
      top: 106
    },
    statusBar: {
      height: 54,
      border: '1px solid orange',
      backgroundColor: theme.palette.extraColors.backupRegister,
      margin: 0,
      padding: theme.spacing.unit * 2
    },
    errorBadge: {
      margin: theme.spacing.unit * 2
    },
    formDaysSelect: {
      padding: `${theme.spacing.unit}px ${theme.spacing.unit * 3}px`
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
  isRunAutoArrange: boolean;
  isFreezAll: boolean;
  numberOfDays: string;
  numberOfErrorWarning: number;
  timer: number;
}

class ResourceSchedulerPage extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isSideBarOpen: false,
      sideBarType: undefined,
      initialSideBarSearch: undefined,
      isFlightRequirementDialogOpen: false,
      isRunAutoArrange: false,
      isFreezAll: false,
      numberOfDays: '7',
      numberOfErrorWarning: 5,
      timer: 0
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

  stopStartAutoArrange = () => {
    this.setState({ ...this.state, isRunAutoArrange: !this.state.isRunAutoArrange }, this.showTimer);
  };

  showTimer = () => {
    if (this.state.isRunAutoArrange) {
      this.setState((previousState: State) => ({ ...previousState, timer: this.state.timer + 1 }));
      setTimeout(this.showTimer, 1000);
    } else {
      this.setState((previousState: State) => ({ ...previousState, timer: 0 }));
    }
  };

  formatTimer = (timer: number) => {
    const hours = Math.floor(timer / 3600);
    const totalSecound = timer % 3600;
    const min = Math.floor(totalSecound / 60);
    const sec = totalSecound % 60;
    return <Fragment>{hours.toString().padStart(2, '0') + ':' + min.toString().padStart(2, '0') + ':' + sec.toString().padStart(2, '0')}</Fragment>;
  };

  freezReleaseAllFlights = () => {
    this.setState({ ...this.state, isFreezAll: !this.state.isFreezAll });
  };

  handleChangeDays = (event: React.ChangeEvent<HTMLSelectElement>) => {
    event.preventDefault();
    this.setState({ ...this.state, numberOfDays: event.target.value });
  };

  render() {
    const { classes } = this.props;
    const { timer, isSideBarOpen, sideBarType, initialSideBarSearch, isFlightRequirementDialogOpen, isFreezAll, isRunAutoArrange, numberOfErrorWarning } = this.state;

    return (
      <Fragment>
        <NavBar
          backLink="/preplan-list"
          backTitle="Preplan List"
          navBarLinks={[
            {
              title: 'Pre Plans',
              link: '/preplan-list'
            },
            {
              title: 'Pre Plan ' + this.getId(),
              link: '/preplan/' + this.getId()
            }
          ]}
        >
          <span>{this.formatTimer(timer)}</span>
          <IconButton color="inherit" onClick={() => this.stopStartAutoArrange()}>
            {isRunAutoArrange ? (
              <MahanIcon type={MahanIconType.CheckBoxEmpty} title="Stop Auto Arrange" />
            ) : (
              <MahanIcon type={MahanIconType.UsingChlorine} title="Start Auto Arrange" />
            )}
          </IconButton>
          <IconButton color="inherit" title="Finilize Preplan">
            <FinilizedIcon />
          </IconButton>
          <IconButton color="inherit" onClick={() => this.freezReleaseAllFlights()} title={isFreezAll ? 'Unfreez All Flights' : 'Freez All Flights'}>
            {isFreezAll ? <LockOpenIcon /> : <LockIcon />}
          </IconButton>
          <IconButton color="inherit" onClick={this.openFlightRequirementDialog} title="Flight Requirments">
            <MahanIcon type={MahanIconType.FlightIcon} />
          </IconButton>
          <IconButton color="inherit" title="Reports">
            <MahanIcon type={MahanIconType.Chart} />
          </IconButton>
          <LinkIconButton to="/master-data" color="inherit" title="Master Data">
            <MahanIcon type={MahanIconType.TextFile} />
          </LinkIconButton>
          <Select
            classes={{ select: classes.formDaysSelect }}
            native
            value={this.state.numberOfDays}
            onChange={this.handleChangeDays}
            id="outlined-age-native-simple"
            input={<OutlinedInput labelWidth={0} />}
            title="Zoom Level"
          >
            <option value={1}>One Day</option>
            <option value={2}>Two Days</option>
            <option value={3}>Three Days</option>
            <option value={7}>Seven Days</option>
            <option value={8}>Eight Days</option>
          </Select>
          <IconButton color="inherit" onClick={() => this.openAutoArrangerChangeLogSideBar('something')} title="Auto Arrange Change Log">
            <MahanIcon type={MahanIconType.Change} />
          </IconButton>
          <IconButton color="inherit" onClick={() => this.openSearchFlightsSideBar('something')} title="Search Flights">
            <SearchIcon />
          </IconButton>

          <IconButton color="inherit" onClick={() => this.openErrorsAndWarningsSideBar('something')} title="Errors and Warnings">
            <Badge badgeContent={numberOfErrorWarning} color="secondary" invisible={numberOfErrorWarning <= 0}>
              <MahanIcon type={MahanIconType.Alert} fontSize="inherit" />
            </Badge>
          </IconButton>

          <IconButton color="inherit" onClick={() => this.openSelectAircraftRegistersSideBar('something')} title="Select Aircraft Register">
            <MahanIcon type={MahanIconType.Flights} />
          </IconButton>
          <IconButton color="inherit" onClick={this.openSettingsSideBar} title="Settings">
            <SettingsIcon />
          </IconButton>
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
        <FlightRequirementModal
          flightRequirement={undefined}
          open={isFlightRequirementDialogOpen}
          onSubmit={this.flightRequirementDialogSubmitHandler}
          onDismiss={this.flightRequirementDialogDismissHandler}
        />
      </Fragment>
    );
  }
}

export default withStyles(styles)(ResourceSchedulerPage);
