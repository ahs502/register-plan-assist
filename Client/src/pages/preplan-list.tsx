import React, { Fragment, useState, FC, useEffect } from 'react';
import { Theme, IconButton, Paper, Tab, Tabs, Table, TableBody, TableCell, TableHead, TableRow, Typography, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { DoneAll as FinilizedIcon, Add as AddIcon, Edit as EditIcon, Clear as ClearIcon } from '@material-ui/icons';
import MahanIcon, { MahanIconType } from 'src/components/MahanIcon';
import Search, { filterOnProperties } from 'src/components/Search';
import NavBar from 'src/components/NavBar';
import persistant from 'src/utils/persistant';
import PreplanService from 'src/services/PreplanService';
import { useSnackbar } from 'notistack';
import ProgressSwitch from 'src/components/ProgressSwitch';
import classNames from 'classnames';
import PreplanHeader from 'src/business/preplan/PreplanHeader';
import NewPreplanModal, { useNewPreplanModalState } from 'src/components/preplan-list/NewPreplanModal';
import ClonePreplanModal, { useClonePreplanModalState } from 'src/components/preplan-list/ClonePreplanModal';
import EditPreplanModal, { useEditPreplanModalState } from 'src/components/preplan-list/EditPreplanModal';
import RemovePreplanModal, { useRemovePreplanModalState } from 'src/components/preplan-list/RemovePreplanModal';
import { useHistory } from 'react-router-dom';

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
    lineHeight: `${waitingPaperSize}px`
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

interface PreplanPublishSwitchLoadingStatus {
  [id: string]: boolean;
}

const PreplanListPage: FC = () => {
  const [preplanHeaders, setPreplanHeaders] = useState<PreplanHeader[]>([]);
  const [tab, setTab] = useState<'USER' | 'PUBLIC'>('USER');
  const [preplanLoading, setPrePlanLoading] = useState(false);
  const [preplanPublishSwitchLoadingStatus, setPreplanPublishSwitchLoadingStatus] = useState<PreplanPublishSwitchLoadingStatus>({});
  const [message, setMessage] = useState('');
  const [query, setQuery] = useState<readonly string[]>([]);

  const [newPreplanModalState, openNewPreplanModal, closeNewPreplanModal] = useNewPreplanModalState();
  const [clonePreplanModalState, openClonePreplanModal, closeClonePreplanModal] = useClonePreplanModalState();
  const [editPreplanModalState, openEditPreplanModal, closeEditPreplanModal] = useEditPreplanModalState();
  const [removePreplanModalState, openRemovePreplanModal, closeRemovePreplanModal] = useRemovePreplanModalState();

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    setPrePlanLoading(true);
    PreplanService.getAllHeaders().then(
      preplanHeaderModels => {
        const preplanHeaders = preplanHeaderModels.map(p => new PreplanHeader(p));
        setPreplanHeaders(preplanHeaders);
        setPrePlanLoading(false);
      },
      reason => setMessage(String(reason))
    );
  }, []);

  const history = useHistory();
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
          <IconButton color="primary" title="Add Preplan" onClick={() => openNewPreplanModal({})}>
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
                            loading={preplanPublishSwitchLoadingStatus[preplanHeader.id]}
                            onChange={async (event, checked) => {
                              if (preplanPublishSwitchLoadingStatus[preplanHeader.id]) return;
                              setPreplanPublishSwitchLoadingStatus(state => ({ ...state, [preplanHeader.id]: true }));
                              try {
                                const preplanHeaderModels = await PreplanService.setPublished(preplanHeader.id, checked);
                                const preplanHeaders = preplanHeaderModels.map(p => new PreplanHeader(p));
                                setPreplanHeaders(preplanHeaders);
                              } catch (reason) {
                                enqueueSnackbar(String(reason), { variant: 'warning' });
                              }
                              setPreplanPublishSwitchLoadingStatus(state => {
                                return { ...state, [preplanHeader.id]: false };
                              });
                            }}
                          />
                        </TableCell>
                      )}

                      <TableCell className={classes.preplanTableCell} align="center">
                        <IconButton title="Copy Preplan" onClick={() => openClonePreplanModal({ preplanHeader })}>
                          <MahanIcon type={MahanIconType.CopyContent} />
                        </IconButton>
                        {tab === 'USER' && (
                          <Fragment>
                            <IconButton title="Edit Preplan" onClick={() => openEditPreplanModal({ preplanHeader })}>
                              <EditIcon />
                            </IconButton>
                            <IconButton title="Remove Preplan" onClick={() => openRemovePreplanModal({ preplanHeader })}>
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
                  {message ? message : 'No preplans'}
                </Typography>
              )}
            </Paper>
          )}
        </Paper>
      </div>

      <NewPreplanModal
        state={newPreplanModalState}
        onClose={closeNewPreplanModal}
        onCreate={async newPreplanModel => {
          const newPreplanId = await PreplanService.createEmpty(newPreplanModel);
          history.push(`/preplan/${newPreplanId}`);
        }}
      />

      <ClonePreplanModal
        state={clonePreplanModalState}
        onClose={closeClonePreplanModal}
        onClone={async (sourcePreplanId, newPreplanModel) => {
          const newPreplanId = await PreplanService.clone(sourcePreplanId, newPreplanModel);
          history.push(`/preplan/${newPreplanId}`);
        }}
      />

      <EditPreplanModal
        state={editPreplanModalState}
        onClose={closeEditPreplanModal}
        onApply={async (sourcePreplanId, newPreplanModel) => {
          const preplanHeaderModels = await PreplanService.editHeader(sourcePreplanId, newPreplanModel);
          const preplanHeaders = preplanHeaderModels.map(p => new PreplanHeader(p));
          setPreplanHeaders(preplanHeaders);
          closeEditPreplanModal();
        }}
      />

      <RemovePreplanModal
        state={removePreplanModalState}
        onClose={closeRemovePreplanModal}
        onRemove={async sourcePreplanId => {
          const preplanHeaderModels = await PreplanService.remove(sourcePreplanId);
          const preplanHeaders = preplanHeaderModels.map(p => new PreplanHeader(p));
          setPreplanHeaders(preplanHeaders);
          closeRemovePreplanModal();
        }}
      />
    </Fragment>
  );
};

export default PreplanListPage;
