import React, { Fragment, useState, FC } from 'react';
import { Theme, IconButton, Paper, Tab, Tabs, Table, TableBody, TableCell, TableHead, TableRow, Switch } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { DoneAll as FinilizedIcon, Add as AddIcon, Edit as EditIcon, Clear as ClearIcon } from '@material-ui/icons';
import MahanIcon, { MahanIconType } from 'src/components/MahanIcon';
import Search from 'src/components/Search';
import LinkButton from 'src/components/LinkButton';
import LinkTypography from 'src/components/LinkTypography';
import NavBar from 'src/components/NavBar';
import { PreplanHeader } from 'src/view-models/Preplan';

const useStyles = makeStyles((theme: Theme) => ({
  contentPage: {
    maxWidth: '1176px',
    margin: 'auto'
  },
  preplanTableCell: {
    paddingRight: theme.spacing(0),
    paddingLeft: theme.spacing(0),
    '&:last-child': {
      paddingRight: theme.spacing(0)
    },
    '&:first-child': {
      paddingLeft: theme.spacing(2)
    }
  }
}));

type Tab = 'USER' | 'PUBLIC';

const PreplanListPage: FC = () => {
  const [preplanHeaders, setPreplanHeaders] = useState<ReadonlyArray<Readonly<PreplanHeader>>>([]);
  const [tab, setTab] = useState<Tab>('USER');

  const classes = useStyles();

  const currentUserId: string = '1001'; //TODO: Needs to be reviewed.

  if (!preplanHeaders.length) setPreplanHeaders(getDummyPreplanHeaders()); //TODO: Remove this line later.

  return (
    <Fragment>
      <NavBar
        navBarLinks={[
          {
            title: 'Pre Plans',
            link: '/preplan-list'
          }
        ]}
      />

      <div className={classes.contentPage}>
        <Tabs value={tab} indicatorColor="primary" textColor="primary" onChange={(event, tab) => setTab(tab)}>
          <Tab value="USER" label="Current User" />
          <Tab value="PUBLIC" label="Public" />
          <Search outlined />
          <IconButton color="primary" title="Add Preplan">
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
                  {tab === 'USER' ? 'User' : 'Public'}
                </TableCell>
                <TableCell className={classes.preplanTableCell} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {preplanHeaders
                .filter(p => (tab === 'USER' ? p.userId === currentUserId : p.published))
                .map(preplanHeader => (
                  <TableRow key={preplanHeader.id}>
                    <TableCell className={classes.preplanTableCell} component="th" scope="row">
                      <LinkTypography to={'preplan/' + preplanHeader.id}>{preplanHeader.name}</LinkTypography>
                    </TableCell>
                    <TableCell className={classes.preplanTableCell}>{preplanHeader.lastEditDateTime.toDateString()}</TableCell>
                    <TableCell className={classes.preplanTableCell}>{preplanHeader.creationDateTime.toDateString()}</TableCell>
                    <TableCell className={classes.preplanTableCell}>{preplanHeader.parentPreplanName}</TableCell>
                    <TableCell className={classes.preplanTableCell} align="center">
                      {preplanHeader.finalized ? <FinilizedIcon /> : ''}
                    </TableCell>
                    <TableCell className={classes.preplanTableCell}>{preplanHeader.simulationName}</TableCell>
                    <TableCell className={classes.preplanTableCell} align="center">
                      {tab === 'USER' ? (
                        <Switch color="primary" checked={preplanHeader.published} onChange={(event, checked) => alert('Not implemented.')} />
                      ) : (
                        preplanHeader.userDisplayName
                      )}
                    </TableCell>
                    <TableCell className={classes.preplanTableCell} align="center">
                      <IconButton title="Copy Preplan">
                        <MahanIcon type={MahanIconType.CopyContent} />
                      </IconButton>
                      {tab === 'USER' && (
                        <Fragment>
                          <IconButton title="Edit Preplan">
                            <EditIcon />
                          </IconButton>
                          <IconButton title="Delete Preplan">
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
};

export default PreplanListPage;

//////////////////////////////////////////////

function getDummyPreplanHeaders(): PreplanHeader[] {
  return [
    {
      id: '123',
      name: 'S20 International Final',
      published: true,
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
      simulationName: 'S19 International Simulation'
    },
    {
      id: '124',
      name: 'S21 International Final',
      published: false,
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
      simulationName: 'S19 International Simulation'
    },
    {
      id: '125',
      name: 'S19 International Final',
      published: true,
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
      simulationName: 'S19 International Simulation'
    },
    {
      id: '126',
      name: 'S19 International Final',
      published: true,
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
      simulationName: 'S19 International Simulation'
    },
    {
      id: '127',
      name: 'S19 International Final',
      published: true,
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
      simulationName: 'S19 International Simulation'
    },
    {
      id: '128',
      name: 'S19 International Final',
      published: true,
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
      simulationName: 'S19 International Simulation'
    }
  ];
}
