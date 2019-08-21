import React, { Fragment, useState, FC, useEffect } from 'react';
import { Theme, IconButton, Paper, Tab, Tabs, Table, TableBody, TableCell, TableHead, TableRow, Switch, Grid, TextField, Typography, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { DoneAll as FinilizedIcon, Add as AddIcon, Edit as EditIcon, Clear as ClearIcon } from '@material-ui/icons';
import MahanIcon, { MahanIconType } from 'src/components/MahanIcon';
import Search from 'src/components/Search';
import LinkTypography from 'src/components/LinkTypography';
import NavBar from 'src/components/NavBar';
import { PreplanHeader } from 'src/view-models/Preplan';
import SimpleModal from 'src/components/SimpleModal';
import persistant from 'src/utils/persistant';
import PreplanService from 'src/services/PreplanService';
import delay from 'src/utils/delay';
import NewPreplanModel, { NewPreplanModelValidation } from '@core/models/NewPreplanModel';
import EditPreplanModel, { EditPreplanModelValidation } from '@core/models/EditPreplanModel';
import useRouter from 'src/utils/useRouter';

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
    height: 100
  },
  messagePosition: {
    paddingTop: 40
  },
  error: {}
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

const PreplanListPage: FC = () => {
  const [preplanHeaders, setPreplanHeaders] = useState<PreplanHeader[]>([]);
  const [filterPreplanHeaders, setFilterPreplanHeaders] = useState<PreplanHeader[]>([]);
  const [tab, setTab] = useState<Tab>('USER');
  const [newPreplanModalModel, setNewPreplanModalModel] = useState<PreplanModalModel>({ open: false });
  const [editPreplanModalModel, setEditPreplanModalModel] = useState<PreplanModalModel>({ open: false });
  const [copyPreplanModalModel, setCopyPreplanModalModel] = useState<PreplanModalModel>({ open: false });
  const [deletePreplanModalModel, setDeletePreplanModalModel] = useState<PreplanModalModel>({ open: false });
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState();
  useEffect(() => {
    setLoading(true);
    PreplanService.getAllHeaders().then(result => {
      setLoading(false);
      if (result.message) {
        setLoadingMessage(result.message);
        return;
      }
      const preplanHeader = result.value!.map(p => new PreplanHeader(p));
      setPreplanHeaders(preplanHeader);
      setFilterPreplanHeaders(preplanHeader);
    });
  }, []);

  function filterPreplan(preplanHeaders: PreplanHeader[], query: readonly string[]) {
    if (!query.length) return preplanHeaders;
    return preplanHeaders.filter(f => {
      const values = [f.name].map(s => s.toLowerCase());
      for (let j = 0; j < query.length; ++j) {
        if (values.some(s => s.includes(query[j]))) return true;
      }
      return false;
    });
  }

  const { history } = useRouter();
  const classes = useStyles();

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
          <Search onQueryChange={query => setFilterPreplanHeaders(filterPreplan(preplanHeaders, query))} outlined />
          <IconButton color="primary" title="Add Preplan" onClick={() => setNewPreplanModalModel({ ...newPreplanModalModel, open: true })}>
            <AddIcon fontSize="large" />
          </IconButton>
        </Tabs>

        <Paper>
          {(tab === 'PUBLIC' && filterPreplanHeaders.some(pn => pn.userId !== persistant.authentication!.user.id)) ||
          (tab === 'USER' && filterPreplanHeaders.some(pn => pn.userId === persistant.authentication!.user.id)) ? (
            <Table>
              <TableHead>
                <TableRow>
                  {tab === 'PUBLIC' && <TableCell className={classes.preplanTableCell}>User</TableCell>}
                  <TableCell className={classes.preplanTableCell}>Name</TableCell>
                  <TableCell className={classes.preplanTableCell}>Last Modified</TableCell>
                  <TableCell className={classes.preplanTableCell}>Created at</TableCell>
                  <TableCell className={classes.preplanTableCell}>Copy Source</TableCell>
                  <TableCell className={classes.preplanTableCell}>Finalized</TableCell>
                  <TableCell className={classes.preplanTableCell}>Simulation Name</TableCell>
                  {tab === 'USER' && (
                    <TableCell className={classes.preplanTableCell} align="center">
                      Public
                    </TableCell>
                  )}

                  <TableCell className={classes.preplanTableCell} align="center">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filterPreplanHeaders
                  .filter(p => (tab === 'USER' ? p.userId === persistant.authentication!.user.id : p.userId !== persistant.authentication!.user.id))
                  .map(preplanHeader => (
                    <TableRow key={preplanHeader.id}>
                      {tab === 'PUBLIC' && <TableCell>{preplanHeader.userDisplayName}</TableCell>}
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
                        {tab === 'USER' && (
                          <Switch
                            color="primary"
                            checked={preplanHeader.published}
                            onChange={async (event, checked) => {
                              const result = await PreplanService.setPublished(preplanHeader.id, event.target.checked);
                              setPreplanHeaders(result.value!.map(p => new PreplanHeader(p)));
                            }}
                          />
                        )}
                      </TableCell>
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
                              title="Delete Preplan"
                              onClick={() => {
                                setDeletePreplanModalModel({ open: true, name: preplanHeader.name, id: preplanHeader.id });
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
              {loading ? (
                <CircularProgress size={24} className={classes.progress} />
              ) : (
                <Typography align="center" className={classes.messagePosition}>
                  {loadingMessage ? loadingMessage : 'No Preplan'}
                </Typography>
              )}
            </Paper>
          )}
        </Paper>
      </div>

      <SimpleModal
        key="delete-preplan"
        open={deletePreplanModalModel.open}
        loading={deletePreplanModalModel.loading}
        title="Would you like to delete your pre plan?"
        errorMessage={deletePreplanModalModel.errorMessage}
        cancelable={true}
        onClose={() => setDeletePreplanModalModel({ ...deletePreplanModalModel, open: false })}
        actions={[
          {
            title: 'No'
          },
          {
            title: 'Yes',
            action: async () => {
              setDeletePreplanModalModel({ ...deletePreplanModalModel, loading: true });

              const result = await PreplanService.remove(deletePreplanModalModel.id!);

              if (result.message) {
                setDeletePreplanModalModel({ ...deletePreplanModalModel, loading: false, errorMessage: result.message });
                return;
              }
              setDeletePreplanModalModel({ ...deletePreplanModalModel, loading: false, open: false });
              setPreplanHeaders(result.value!.map(p => new PreplanHeader(p)));
            }
          }
        ]}
      >
        All of data about pre-plan {deletePreplanModalModel.name} will be deleted.
      </SimpleModal>

      <SimpleModal
        key="new-preplan"
        open={newPreplanModalModel.open}
        title="What is your pre plan's specifications?"
        errorMessage={newPreplanModalModel.errorMessage}
        cancelable={true}
        actions={[
          {
            title: 'cancle',
            action: () => {
              setNewPreplanModalModel({ ...newPreplanModalModel, open: false });
            }
          },
          {
            title: 'create',
            action: async () => {
              setNewPreplanModalModel({ ...newPreplanModalModel, loading: true, errorMessage: undefined });
              const model: NewPreplanModel = {
                name: newPreplanModalModel.name!,
                startDate: Date.toJSON(newPreplanModalModel.startDate),
                endDate: Date.toJSON(newPreplanModalModel.endDate)
              };

              const validation = new NewPreplanModelValidation(model, filterPreplanHeaders.filter(s => s.userId === persistant.authentication!.user.id).map(p => p.name));
              if (!validation.ok) {
                //TODO: Show error messages of form fields.
                setNewPreplanModalModel({ ...newPreplanModalModel, loading: false });
                return;
              }

              const result = await PreplanService.createEmpty(model);
              if (result.message) {
                setNewPreplanModalModel({ ...newPreplanModalModel, loading: false, errorMessage: result.message });
              } else {
                setNewPreplanModalModel({ ...newPreplanModalModel, loading: false, open: false });

                history.push(`/preplan/${result.value}`);
              }
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
        key="edit-preplan"
        open={editPreplanModalModel.open}
        loading={editPreplanModalModel.loading}
        title="What is this pre-plan's new specifications?"
        cancelable={true}
        actions={[
          {
            title: 'cancle',
            action: () => {
              setEditPreplanModalModel({ ...editPreplanModalModel, open: false });
            }
          },
          {
            title: 'apply',
            action: async () => {
              setEditPreplanModalModel({ ...editPreplanModalModel, loading: true, errorMessage: undefined });

              const model: EditPreplanModel = {
                id: editPreplanModalModel.id!,
                name: editPreplanModalModel.name!,
                startDate: Date.toJSON(editPreplanModalModel.startDate),
                endDate: Date.toJSON(editPreplanModalModel.endDate)
              };

              const validation = new EditPreplanModelValidation(
                model,
                filterPreplanHeaders.filter(s => s.userId === persistant.authentication!.user.id && s.id !== model.id).map(p => p.name)
              );

              if (!validation.ok) {
                //TODO: Show error messages of form fields.
                setEditPreplanModalModel({ ...editPreplanModalModel, loading: false });
                return;
              }

              const result = await PreplanService.editHeader(model);
              if (result.message) {
                setEditPreplanModalModel({ ...editPreplanModalModel, loading: false, open: true, errorMessage: result.message });
              } else {
                setEditPreplanModalModel({ ...editPreplanModalModel, loading: false, open: false });
                setPreplanHeaders(result.value!.map(p => new PreplanHeader(p)));
              }
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
        key="copy-preplan"
        open={copyPreplanModalModel.open}
        title="What is the new Pre Plan's name?"
        cancelable={true}
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
