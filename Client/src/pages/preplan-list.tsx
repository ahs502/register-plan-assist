import React, { PureComponent, Fragment } from 'react';
import { WithStyles, createStyles, withStyles, Theme } from '@material-ui/core/styles';
import { IconButton, Typography, Paper, Tab, Tabs, Fab, Table, TableBody, TableCell, TableHead, TableRow, Switch } from '@material-ui/core';
import NavBar from '../components/NavBar';
import LinkButton from '../components/LinkButton';
import { Waves as WavesIcon, DoneAll as FinilizedIcon, Add as AddIcon, Edit as EditIcon, Clear as ClearIcon } from '@material-ui/icons';
import classNames from 'classnames';
import Preplan from '../business/Preplan';
import Search from '../components/Search';
import LinkTypography from '../components/LinkTypography';
import MahanIcon, { MahanIconType } from '../components/MahanIcon';
import FlightRequirementDialog from '../components/preplan/FlightRequirementDialog';

const styles = (theme: Theme) =>
  createStyles({
    iconSize: {
      fontSize: 24,
      padding: 0,
      margin: 0
    },
    contentPage: {
      maxWidth: '1176px',
      margin: 'auto'
    },
    preplanTableCell: {
      paddingRight: theme.spacing.unit * 2,
      paddingLeft: theme.spacing.unit * 2,
      '&:last-child': {
        paddingRight: theme.spacing.unit * 2
      }
    }
  });

interface Props extends WithStyles<typeof styles> {}
interface State {
  preplans: Preplan[];
  tabNumber: Number;
  preplanType: PreplanType;
}

enum PreplanType {
  User = 0,
  Public = 1
}

class PreplanList extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      preplans: getDummyPreplans(),
      tabNumber: 0,
      preplanType: PreplanType.User
    };
  }

  handleChange = (event: React.ChangeEvent<{}>, tabNumber: Number) => {
    this.setState({
      ...this.state,
      tabNumber,
      preplanType: tabNumber === 0 ? PreplanType.User : PreplanType.Public
    });
  };

  togglePreplanPublic = (preplan: Preplan) => (event: React.ChangeEvent<{}>, checked: boolean) => {
    this.setState(prevState => {
      const newState = { ...prevState, preplans: [...prevState.preplans] };
      const tempPreplan = newState.preplans.find(p => p.id === preplan.id);

      if (tempPreplan) {
        tempPreplan.public = checked;
      }

      return newState;
    });
  };

  render() {
    const { classes } = this.props;
    const { tabNumber, preplans, preplanType } = this.state;

    return (
      <Fragment>
        <NavBar
          navBarLinks={[
            {
              title: 'Pre Plans',
              link: '/preplan-list'
            }
          ]}
        >
          <LinkButton to="/master-data" variant="text" color="inherit">
            Master Data
            <MahanIcon type={MahanIconType.TextFile} />
          </LinkButton>
        </NavBar>

        <div className={classes.contentPage}>
          <Tabs value={tabNumber} indicatorColor="primary" textColor="primary" onChange={this.handleChange}>
            <Tab label="Current User" />
            <Tab label="Public" />
            <Search outlined />
            <IconButton color="primary">
              <AddIcon fontSize="large" />
            </IconButton>
          </Tabs>

          <Paper>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell className={classes.preplanTableCell}>Name</TableCell>
                  <TableCell className={classes.preplanTableCell}>Last Modified</TableCell>
                  <TableCell className={classes.preplanTableCell}>Created at</TableCell>
                  <TableCell className={classes.preplanTableCell}>Copy Source</TableCell>
                  <TableCell className={classes.preplanTableCell}>Finalized</TableCell>
                  <TableCell className={classes.preplanTableCell}>Simulation Name</TableCell>
                  <TableCell className={classes.preplanTableCell} align="center">
                    {preplanType === PreplanType.Public ? 'User' : 'Public'}
                  </TableCell>
                  <TableCell className={classes.preplanTableCell} align="center">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {preplans
                  .filter(p => (p.userId === '1001' && preplanType === PreplanType.User) || (p.userId !== '1001' && preplanType === PreplanType.Public))
                  .map(preplan => (
                    <TableRow key={preplan.id}>
                      <TableCell className={classes.preplanTableCell} component="th" scope="row">
                        <LinkTypography to={'preplan/' + preplan.id}>{preplan.name}</LinkTypography>
                      </TableCell>
                      <TableCell className={classes.preplanTableCell}>{preplan.lastEditDateTime.toDateString()}</TableCell>
                      <TableCell className={classes.preplanTableCell}>{preplan.creationDateTime.toDateString()}</TableCell>
                      <TableCell className={classes.preplanTableCell}>{preplan.parentPreplanName}</TableCell>
                      <TableCell className={classes.preplanTableCell} align="center">
                        {preplan.finalized ? <FinilizedIcon /> : ''}
                      </TableCell>
                      <TableCell className={classes.preplanTableCell}>{preplan.simulationTitle}</TableCell>
                      <TableCell className={classes.preplanTableCell}>
                        {preplanType === PreplanType.Public ? preplan.userDisplayName : <Switch checked={preplan.public} onChange={this.togglePreplanPublic(preplan)} />}
                      </TableCell>
                      <TableCell className={classes.preplanTableCell}>
                        <IconButton>
                          <MahanIcon type={MahanIconType.CopyContent} />
                        </IconButton>
                        {preplanType !== PreplanType.Public && (
                          <Fragment>
                            <IconButton>
                              <EditIcon />
                            </IconButton>
                            <IconButton>
                              <ClearIcon />
                            </IconButton>
                          </Fragment>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </Paper>
        </div>
      </Fragment>
    );
  }
}

export default withStyles(styles)(PreplanList);

function getDummyPreplans(): Preplan[] {
  return [
    {
      id: '123',
      name: 'S20 International Final',
      public: true,
      finalized: false,
      userId: '1001',
      userName: 'MAHANAIR961234',
      userDisplayName: 'Moradi',
      parentPreplanId: '122',
      parentPreplanName: 'S19 International Default',
      creationDateTime: new Date(),
      lastEditDateTime: new Date(),
      startDate: new Date(2019, 1, 1),
      endDate: new Date(2019, 7, 1),
      simulationId: '32847321984',
      simulationTitle: 'S19 International Simulation'
    },
    {
      id: '124',
      name: 'S21 International Final',
      public: false,
      finalized: true,
      userId: '1001',
      userName: 'MAHANAIR961234',
      userDisplayName: 'Moradi',
      parentPreplanId: '122',
      parentPreplanName: 'S19 International Default',
      creationDateTime: new Date(),
      lastEditDateTime: new Date(),
      startDate: new Date(2019, 1, 1),
      endDate: new Date(2019, 7, 1),
      simulationId: '32847321984',
      simulationTitle: 'S19 International Simulation'
    },
    {
      id: '125',
      name: 'S19 International Final',
      public: true,
      finalized: false,
      userId: '1002',
      userName: 'MAHANAIR961234',
      userDisplayName: 'Moradi',
      parentPreplanId: '122',
      parentPreplanName: 'S19 International Default',
      creationDateTime: new Date(),
      lastEditDateTime: new Date(),
      startDate: new Date(2019, 1, 1),
      endDate: new Date(2019, 7, 1),
      simulationId: '32847321984',
      simulationTitle: 'S19 International Simulation'
    },
    {
      id: '126',
      name: 'S19 International Final',
      public: true,
      finalized: true,
      userId: '1002',
      userName: 'MAHANAIR961234',
      userDisplayName: 'Moradi',
      parentPreplanId: '122',
      parentPreplanName: 'S19 International Default',
      creationDateTime: new Date(),
      lastEditDateTime: new Date(),
      startDate: new Date(2019, 1, 1),
      endDate: new Date(2019, 7, 1),
      simulationId: '32847321984',
      simulationTitle: 'S19 International Simulation'
    },
    {
      id: '127',
      name: 'S19 International Final',
      public: true,
      finalized: true,
      userId: '1003',
      userName: 'MAHANAIR961234',
      userDisplayName: 'Moradi',
      parentPreplanId: '122',
      parentPreplanName: 'S19 International Default',
      creationDateTime: new Date(),
      lastEditDateTime: new Date(),
      startDate: new Date(2019, 1, 1),
      endDate: new Date(2019, 7, 1),
      simulationId: '32847321984',
      simulationTitle: 'S19 International Simulation'
    },
    {
      id: '128',
      name: 'S19 International Final',
      public: true,
      finalized: true,
      userId: '1003',
      userName: 'MAHANAIR961234',
      userDisplayName: 'Moradi',
      parentPreplanId: '122',
      parentPreplanName: 'S19 International Default',
      creationDateTime: new Date(),
      lastEditDateTime: new Date(),
      startDate: new Date(2019, 1, 1),
      endDate: new Date(2019, 7, 1),
      simulationId: '32847321984',
      simulationTitle: 'S19 International Simulation'
    }
  ];
}
