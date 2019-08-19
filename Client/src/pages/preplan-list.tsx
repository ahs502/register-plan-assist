import React, { Fragment, useState, FC } from 'react';
import {
  Theme,
  IconButton,
  Paper,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Switch,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { DoneAll as FinilizedIcon, Add as AddIcon, Edit as EditIcon, Clear as ClearIcon } from '@material-ui/icons';
import MahanIcon, { MahanIconType } from 'src/components/MahanIcon';
import Search from 'src/components/Search';
import LinkButton from 'src/components/LinkButton';
import LinkTypography from 'src/components/LinkTypography';
import NavBar from 'src/components/NavBar';
import { PreplanHeader } from 'src/view-models/Preplan';
import DraggableDialog from 'src/components/DraggableDialog';
import SimpleModal from 'src/components/SimpleModal';
import persistant from 'src/utils/persistant';
import PreplanService from 'src/services/PreplanService';
import delay from 'src/utils/delay';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flexGrow: 1
  },
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
  },
  marginBottom1: {
    marginBottom: theme.spacing(1)
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary
  }
}));

type Tab = 'USER' | 'PUBLIC';

interface PreplanModalModel {
  open: boolean;
  loading?: boolean;
  errorMessage?: string;
  id?: string;
  name?: string;
  startDate?: string;
  endDate?: string;
}

function createPreplanModel() {}

function sleep(milliseconds: number) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if (new Date().getTime() - start > milliseconds) {
      break;
    }
  }
}

const PreplanListPage: FC = () => {
  const [preplanHeaders, setPreplanHeaders] = useState<ReadonlyArray<Readonly<PreplanHeader>>>([]);
  const [tab, setTab] = useState<Tab>('USER');
  const [newPreplanModalModel, setNewPreplanModalModel] = useState<PreplanModalModel>({ open: false });
  const [editPreplanModalModel, setEditPreplanModalModel] = useState<PreplanModalModel>({ open: false });
  const [copyPreplanModalModel, setCopyPreplanModalModel] = useState<PreplanModalModel>({ open: false });
  const [deletePreplanModalModel, setDeletePreplanModalModel] = useState<PreplanModalModel>({ open: false });

  const classes = useStyles();

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
          <IconButton color="primary" title="Add Preplan" onClick={() => setNewPreplanModalModel({ ...newPreplanModalModel, open: true })}>
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
                  {tab === 'USER' ? 'Public' : 'User'}
                </TableCell>
                <TableCell className={classes.preplanTableCell} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {preplanHeaders
                .filter(p => (tab === 'USER' ? p.userId === persistant.authentication!.user.id || true : p.userId !== persistant.authentication!.user.id))
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
                      <IconButton
                        title="Copy Preplan"
                        onClick={() => {
                          setCopyPreplanModalModel({
                            open: true,
                            name: 'Copy of ' + preplanHeader.name,
                            startDate: formatDateddMMMyyyy(preplanHeader.startDate),
                            endDate: formatDateddMMMyyyy(preplanHeader.endDate)
                          });
                        }}
                      >
                        <MahanIcon type={MahanIconType.CopyContent} />
                      </IconButton>
                      {tab === 'USER' && (
                        <Fragment>
                          <IconButton
                            title="Edit Preplan"
                            onClick={() => {
                              setEditPreplanModalModel({
                                open: true,
                                name: preplanHeader.name,
                                startDate: formatDateddMMMyyyy(preplanHeader.startDate),
                                endDate: formatDateddMMMyyyy(preplanHeader.endDate)
                              });
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            title="Delete Preplan"
                            onClick={() => {
                              setDeletePreplanModalModel({ open: true, name: preplanHeader.name });
                            }}
                          >
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

      <SimpleModal
        open={deletePreplanModalModel.open}
        loading={deletePreplanModalModel.loading}
        title="Would you like to delete your pre plan?"
        cancelable={true}
        onClose={() => setDeletePreplanModalModel({ ...deletePreplanModalModel, open: false })}
        actions={[
          {
            title: 'No'
          },
          {
            title: 'Yes',
            action: async () => {
              // create and validate model
              setDeletePreplanModalModel({ ...deletePreplanModalModel, loading: true, errorMessage: undefined });

              // const result = await PreplanService.remove(deletePreplanModalModel.id!);
              const result = await delay(5000, { message: 'a', value: [] });
              // if (result.message) {
              //   setDeletePreplanModalModel({ ...deletePreplanModalModel, loading: false, errorMessage: result.message });
              //   return;
              // }
              // setPreplanHeaders(result.value!.map(p => new PreplanHeader(p)));
              setDeletePreplanModalModel({ ...deletePreplanModalModel, loading: false, open: false });
              // delay(5000, { message: 'a', value: [] }).then(() => {
              //   setDeletePreplanModalModel({ ...deletePreplanModalModel, loading: false, open: false });
              // });
            }
          }
        ]}
      >
        All of data about pre-plan {deletePreplanModalModel.name} will be deleted.
      </SimpleModal>

      <SimpleModal
        open={newPreplanModalModel.open}
        title="What is your pre plan's specifications?"
        actions={[
          {
            title: 'cancle',
            action: () => {
              setNewPreplanModalModel({ ...newPreplanModalModel, open: false });
            }
          },
          {
            title: 'create',
            action: () => {
              setNewPreplanModalModel({ ...newPreplanModalModel, open: false });
            }
          }
        ]}
        onClose={() => {
          setNewPreplanModalModel({ ...newPreplanModalModel, open: false });
        }}
      >
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <TextField
              label="Name"
              onChange={e => {
                setNewPreplanModalModel({ ...newPreplanModalModel, name: e.target.value });
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Start Date"
              onChange={e => {
                setNewPreplanModalModel({ ...newPreplanModalModel, startDate: e.target.value });
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="End Date"
              onChange={e => {
                setNewPreplanModalModel({ ...newPreplanModalModel, endDate: e.target.value });
              }}
            />
          </Grid>
        </Grid>
      </SimpleModal>

      <SimpleModal
        open={editPreplanModalModel.open}
        title="What is this pre-plan's new specifications?"
        actions={[
          {
            title: 'cancle',
            action: () => {
              setEditPreplanModalModel({ ...editPreplanModalModel, open: false });
            }
          },
          {
            title: 'apply',
            action: () => {
              setEditPreplanModalModel({ ...editPreplanModalModel, open: false });
            }
          }
        ]}
        onClose={() => {
          setEditPreplanModalModel({ ...editPreplanModalModel, open: false });
        }}
      >
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <TextField
              label="Name"
              value={editPreplanModalModel.name}
              onChange={e => {
                setEditPreplanModalModel({ ...editPreplanModalModel, name: e.target.value });
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Start Date"
              value={editPreplanModalModel.startDate}
              onChange={e => {
                setEditPreplanModalModel({ ...editPreplanModalModel, startDate: e.target.value });
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="End Date"
              value={editPreplanModalModel.endDate}
              onChange={e => {
                setEditPreplanModalModel({ ...editPreplanModalModel, endDate: e.target.value });
              }}
            />
          </Grid>
        </Grid>
      </SimpleModal>

      <SimpleModal
        open={copyPreplanModalModel.open}
        title="What is the new Pre Plan's name?"
        actions={[
          {
            title: 'cancle',
            action: () => {
              setCopyPreplanModalModel({ ...copyPreplanModalModel, open: false });
            }
          },
          {
            title: 'copy',
            action: () => {
              setCopyPreplanModalModel({ ...copyPreplanModalModel, open: false });
            }
          }
        ]}
        onClose={() => {
          setCopyPreplanModalModel({ ...copyPreplanModalModel, open: false });
        }}
      >
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <TextField
              label="Name"
              value={copyPreplanModalModel.name}
              onChange={e => {
                setCopyPreplanModalModel({ ...copyPreplanModalModel, name: e.target.value });
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Start Date"
              value={copyPreplanModalModel.startDate}
              onChange={e => setCopyPreplanModalModel({ ...copyPreplanModalModel, startDate: e.target.value })}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="End Date"
              value={copyPreplanModalModel.endDate}
              onChange={e => {
                setCopyPreplanModalModel({ ...copyPreplanModalModel, endDate: e.target.value });
              }}
            />
          </Grid>
        </Grid>
      </SimpleModal>
    </Fragment>
  );
};

export default PreplanListPage;

function formatDateddMMMyyyy(date: Date) {
  let day = '' + date.getUTCDate(),
    year = date
      .getUTCFullYear()
      .toString()
      .substring(2, 4);
  const month = date.toLocaleString('default', { month: 'short' }).toUpperCase();

  day = day.padStart(2, '0');

  return [day, month, year].join('');
}

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
