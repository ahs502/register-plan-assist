import React, { Fragment, useState, FC, useEffect } from 'react';
import { Theme, IconButton, Paper, Tab, Tabs, Table, TableBody, TableCell, TableHead, TableRow, Grid, TextField, Typography, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { DoneAll as FinilizedIcon, Add as AddIcon, Edit as EditIcon, Clear as ClearIcon } from '@material-ui/icons';
import MahanIcon, { MahanIconType } from 'src/components/MahanIcon';
import Search, { filterOnProperties } from 'src/components/Search';
import NavBar from 'src/components/NavBar';
import ModalBase from 'src/components/ModalBase';
import persistant from 'src/utils/persistant';
import PreplanService from 'src/services/PreplanService';
import useRouter from 'src/utils/useRouter';
import { useSnackbar } from 'notistack';
import ProgressSwitch from 'src/components/ProgressSwitch';
import classNames from 'classnames';
import PreplanHeader from 'src/business/preplan/PreplanHeader';

const waitingPaperSize = 250;
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
  },
  progress: {
    position: 'relative',
    top: 50,
    left: '50%',
    marginTop: -12,
    marginLeft: -12
  },
  waitingPaper: {
    height: waitingPaperSize
  },
  waitingPaperMessage: {
    lineHeight: waitingPaperSize
  },
  messagePosition: {
    paddingTop: 40
  },
  error: {},
  switchProgressBar: {
    position: 'relative'
  },
  linkTableCell: {
    cursor: 'pointer'
  },
  publicHeader: {
    paddingLeft: 12
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

interface PublishLoadingStatus {
  [id: string]: boolean;
  value: boolean;
}

const PreplanListPage: FC = () => {
  const [preplanHeaders, setPreplanHeaders] = useState<PreplanHeader[]>([]);
  const [tab, setTab] = useState<Tab>('USER');
  const [newPreplanModalModel, setNewPreplanModalModel] = useState<PreplanModalModel>({ open: false });
  const [editPreplanModalModel, setEditPreplanModalModel] = useState<PreplanModalModel>({ open: false });
  const [copyPreplanModalModel, setCopyPreplanModalModel] = useState<PreplanModalModel>({ open: false });
  const [removePreplanModalModel, setRemovePreplanModalModel] = useState<PreplanModalModel>({ open: false });
  const [preplanLoading, setPrePlanLoading] = useState(false);
  const [publishLoadingStatus, setPublishLoadingStatus] = useState<PublishLoadingStatus>({ value: false });
  const [loadingMessage, setLoadingMessage] = useState('');
  const [query, setQuery] = useState([] as readonly string[]);

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    setPrePlanLoading(true);
    PreplanService.getAllHeaders().then(
      preplanHeaderModels => {
        setPreplanHeaders(preplanHeaderModels.map(p => new PreplanHeader(p)));
        setPrePlanLoading(false);
      },
      reason => setLoadingMessage(String(reason))
    );
  }, []);

  const { history } = useRouter();
  const classes = useStyles();

  const filteredPreplanHeaders = filterOnProperties(preplanHeaders, query, 'name');

  return (
    <Fragment>
      <NavBar
        navBarLinks={[
          {
            title: 'Preplans',
            link: '/preplan-list'
          }
        ]}
      />

      <div className={classes.contentPage}>
        <Tabs value={tab} indicatorColor="primary" textColor="primary" onChange={(event, tab) => setTab(tab)}>
          <Tab value="USER" label="Current User" />
          <Tab value="PUBLIC" label="Public" />
          <Search onQueryChange={query => setQuery(query)} outlined />
          <IconButton color="primary" title="Add Preplan" onClick={() => setNewPreplanModalModel({ ...newPreplanModalModel, open: true })}>
            <AddIcon fontSize="large" />
          </IconButton>
        </Tabs>

        <Paper>
          {(tab === 'PUBLIC' && filteredPreplanHeaders.some(p => p.user.id !== persistant.user!.id)) ||
          (tab === 'USER' && filteredPreplanHeaders.some(p => p.user.id === persistant.user!.id)) ? (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell className={classes.preplanTableCell}>Name</TableCell>
                  {tab === 'PUBLIC' && <TableCell className={classes.preplanTableCell}>User</TableCell>}
                  <TableCell className={classes.preplanTableCell}>Last Modified</TableCell>
                  <TableCell className={classes.preplanTableCell}>Created at</TableCell>
                  <TableCell className={classes.preplanTableCell}>Copy Source</TableCell>
                  <TableCell className={classes.preplanTableCell}>Finalized</TableCell>
                  <TableCell className={classes.preplanTableCell}>Simulation Name</TableCell>
                  {tab === 'USER' && <TableCell className={classNames(classes.preplanTableCell, classes.publicHeader)}>Public</TableCell>}
                  <TableCell className={classes.preplanTableCell} align="center">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPreplanHeaders
                  .filter(p => (tab === 'USER' ? p.user.id === persistant.user!.id : p.user.id !== persistant.user!.id))
                  .map(preplanHeader => (
                    <TableRow key={preplanHeader.id}>
                      <TableCell
                        onClick={() => history.push('preplan/' + preplanHeader.id)}
                        className={classNames(classes.preplanTableCell, classes.linkTableCell)}
                        component="th"
                        scope="row"
                      >
                        {/* <LinkTypography to={'preplan/' + preplanHeader.id}>{preplanHeader.name}</LinkTypography> */}
                        {preplanHeader.name}
                      </TableCell>

                      {tab === 'PUBLIC' && <TableCell className={classes.preplanTableCell}>{preplanHeader.user.displayName}</TableCell>}
                      <TableCell className={classes.preplanTableCell}>{preplanHeader.lastEditDateTime.format('d')}</TableCell>
                      <TableCell className={classes.preplanTableCell}>{preplanHeader.creationDateTime.format('d')}</TableCell>
                      <TableCell className={classes.preplanTableCell}>{preplanHeader.parentPreplan && preplanHeader.parentPreplan.name}</TableCell>
                      <TableCell className={classes.preplanTableCell} align="center">
                        {preplanHeader.finalized ? <FinilizedIcon /> : ''}
                      </TableCell>
                      <TableCell className={classes.preplanTableCell}>{preplanHeader.simulation && preplanHeader.simulation.name}</TableCell>

                      {tab === 'USER' && (
                        <TableCell className={classes.preplanTableCell} align="center">
                          <ProgressSwitch
                            checked={preplanHeader.published}
                            loading={publishLoadingStatus[preplanHeader.id]}
                            onChange={async (event, checked) => {
                              if (publishLoadingStatus[preplanHeader.id]) return;
                              setPublishLoadingStatus(state => ({ ...state, [preplanHeader.id]: true }));
                              try {
                                const preplanHeaderModels = await PreplanService.setPublished(preplanHeader.id, checked);
                                setPreplanHeaders(preplanHeaderModels.map(p => new PreplanHeader(p)));
                              } catch (reason) {
                                enqueueSnackbar(String(reason), { variant: 'warning' });
                              }
                              setPublishLoadingStatus(state => {
                                return { ...state, [preplanHeader.id]: false };
                              });
                            }}
                          />
                        </TableCell>
                      )}

                      <TableCell className={classes.preplanTableCell} align="center">
                        <IconButton
                          title="Copy Preplan"
                          onClick={() => {
                            setCopyPreplanModalModel({
                              open: true,
                              id: preplanHeader.id,
                              name: 'Copy of ' + preplanHeader.name,
                              startDate: preplanHeader.startDate.format('d'),
                              endDate: preplanHeader.endDate.format('d')
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
                                  id: preplanHeader.id,
                                  startDate: preplanHeader.startDate.format('d'),
                                  endDate: preplanHeader.endDate.format('d')
                                });
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              title="Remove Preplan"
                              onClick={() => {
                                setRemovePreplanModalModel({ open: true, name: preplanHeader.name, id: preplanHeader.id });
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
          ) : (
            <Paper className={classes.waitingPaper}>
              {preplanLoading ? (
                <CircularProgress size={24} className={classes.progress} />
              ) : (
                <Typography align="center" classes={{ body1: classes.waitingPaperMessage }}>
                  {loadingMessage ? loadingMessage : 'No preplans'}
                </Typography>
              )}
            </Paper>
          )}
        </Paper>
      </div>

      <ModalBase
        key="remove-preplan"
        open={removePreplanModalModel.open}
        loading={removePreplanModalModel.loading}
        title="Would you like to remove your preplan?"
        cancelable={true}
        errorMessage={removePreplanModalModel.errorMessage}
        onClose={() => setRemovePreplanModalModel({ ...removePreplanModalModel, open: false })}
        actions={[
          {
            title: 'Cancel'
          },
          {
            title: 'Remove',
            action: async () => {
              setRemovePreplanModalModel({ ...removePreplanModalModel, loading: true });
              try {
                const preplanHeaderModels = await PreplanService.remove(removePreplanModalModel.id!);
                setPreplanHeaders(preplanHeaderModels.map(p => new PreplanHeader(p)));
                setRemovePreplanModalModel({ ...removePreplanModalModel, loading: false, open: false });
              } catch (reason) {
                setRemovePreplanModalModel({ ...removePreplanModalModel, loading: false, errorMessage: String(reason) });
              }
            }
          }
        ]}
      >
        All of data about preplan {removePreplanModalModel.name} will be removed.
      </ModalBase>

      <ModalBase
        key="new-preplan"
        open={newPreplanModalModel.open}
        loading={newPreplanModalModel.loading}
        title="What is the specifications of your preplan?"
        cancelable={true}
        errorMessage={newPreplanModalModel.errorMessage}
        onClose={() => setNewPreplanModalModel({ ...newPreplanModalModel, open: false })}
        actions={[
          {
            title: 'Cancel'
          },
          {
            title: 'Create',
            action: async () => {
              setNewPreplanModalModel({ ...newPreplanModalModel, loading: true, errorMessage: undefined });
              try {
                const newPreplanId = await PreplanService.createEmpty({
                  name: newPreplanModalModel.name!,
                  startDate: Date.toJSON(newPreplanModalModel.startDate),
                  endDate: Date.toJSON(newPreplanModalModel.endDate)
                });
                setNewPreplanModalModel({ ...newPreplanModalModel, loading: false, open: false });
                history.push(`/preplan/${newPreplanId}`);
              } catch (reason) {
                setNewPreplanModalModel({ ...newPreplanModalModel, loading: false, errorMessage: String(reason) });
              }
            }
          }
        ]}
      >
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <TextField label="Name" onChange={e => setNewPreplanModalModel({ ...newPreplanModalModel, name: e.target.value })} />
          </Grid>
          <Grid item xs={6}>
            <TextField label="Start Date" onChange={e => setNewPreplanModalModel({ ...newPreplanModalModel, startDate: e.target.value })} />
          </Grid>
          <Grid item xs={6}>
            <TextField label="End Date" onChange={e => setNewPreplanModalModel({ ...newPreplanModalModel, endDate: e.target.value })} />
          </Grid>
        </Grid>
      </ModalBase>

      <ModalBase
        key="edit-preplan"
        open={editPreplanModalModel.open}
        loading={editPreplanModalModel.loading}
        title="What do you want to change?"
        cancelable={true}
        errorMessage={editPreplanModalModel.errorMessage}
        onClose={() => setEditPreplanModalModel({ ...editPreplanModalModel, open: false })}
        actions={[
          {
            title: 'Cancel'
          },
          {
            title: 'Update',
            action: async () => {
              setEditPreplanModalModel({ ...editPreplanModalModel, loading: true, errorMessage: undefined });
              try {
                const preplanHeaderModels = await PreplanService.editHeader(editPreplanModalModel.id!, {
                  name: editPreplanModalModel.name!,
                  startDate: Date.toJSON(editPreplanModalModel.startDate),
                  endDate: Date.toJSON(editPreplanModalModel.endDate)
                });
                setPreplanHeaders(preplanHeaderModels.map(p => new PreplanHeader(p)));
                setEditPreplanModalModel({ ...editPreplanModalModel, loading: false, open: false });
              } catch (reason) {
                setEditPreplanModalModel({ ...editPreplanModalModel, loading: false, errorMessage: String(reason) });
              }
            }
          }
        ]}
      >
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <TextField label="Name" value={editPreplanModalModel.name} onChange={e => setEditPreplanModalModel({ ...editPreplanModalModel, name: e.target.value })} />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Start Date"
              value={editPreplanModalModel.startDate}
              onChange={e => setEditPreplanModalModel({ ...editPreplanModalModel, startDate: e.target.value })}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField label="End Date" value={editPreplanModalModel.endDate} onChange={e => setEditPreplanModalModel({ ...editPreplanModalModel, endDate: e.target.value })} />
          </Grid>
        </Grid>
      </ModalBase>

      <ModalBase
        key="copy-preplan"
        open={copyPreplanModalModel.open}
        loading={copyPreplanModalModel.loading}
        cancelable={true}
        title="What is the new Pre Plan's name?"
        errorMessage={copyPreplanModalModel.errorMessage}
        onClose={() => setCopyPreplanModalModel({ ...copyPreplanModalModel, open: false })}
        actions={[
          {
            title: 'Cancel'
          },
          {
            title: 'Copy',
            action: async () => {
              setCopyPreplanModalModel({ ...copyPreplanModalModel, loading: true, errorMessage: undefined });
              try {
                const newPreplanId = await PreplanService.clone(copyPreplanModalModel.id!, {
                  name: copyPreplanModalModel.name!,
                  startDate: Date.toJSON(copyPreplanModalModel.startDate),
                  endDate: Date.toJSON(copyPreplanModalModel.endDate)
                });
                setCopyPreplanModalModel({ ...copyPreplanModalModel, loading: false, open: false });
                history.push(`/preplan/${newPreplanId}`);
              } catch (reason) {
                setCopyPreplanModalModel({ ...copyPreplanModalModel, loading: false, open: true, errorMessage: String(reason) });
              }
            }
          }
        ]}
      >
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <TextField label="Name" value={copyPreplanModalModel.name} onChange={e => setCopyPreplanModalModel({ ...copyPreplanModalModel, name: e.target.value })} />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Start Date"
              value={copyPreplanModalModel.startDate}
              onChange={e => setCopyPreplanModalModel({ ...copyPreplanModalModel, startDate: e.target.value })}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField label="End Date" value={copyPreplanModalModel.endDate} onChange={e => setCopyPreplanModalModel({ ...copyPreplanModalModel, endDate: e.target.value })} />
          </Grid>
        </Grid>
      </ModalBase>
    </Fragment>
  );
};

export default PreplanListPage;
