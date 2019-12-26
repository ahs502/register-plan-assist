import React, { Fragment, useState, FC, useEffect } from 'react';
import { Theme, IconButton, Paper, Tab, Tabs, Table, TableBody, TableCell, TableHead, TableRow, Typography, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { DoneAll as FinilizedIcon, Add as AddIcon, Edit as EditIcon, Clear as ClearIcon } from '@material-ui/icons';
import MahanIcon, { MahanIconType } from 'src/components/MahanIcon';
import Search, { filterOnProperties } from 'src/components/Search';
import NavBar from 'src/components/NavBar';
import persistant from 'src/utils/persistant';
import { useSnackbar } from 'notistack';
import ProgressSwitch from 'src/components/ProgressSwitch';
import classNames from 'classnames';
import PreplanHeader from 'src/business/preplan/PreplanHeader';
import NewPreplanHeaderModal, { useNewPreplanHeaderModalState } from 'src/components/preplan-list/NewPreplanHeaderModal';
import ClonePreplanHeaderModal, { useClonePreplanHeaderModalState } from 'src/components/preplan-list/ClonePreplanHeaderModal';
import EditPreplanHeaderModal, { useEditPreplanHeaderModalState } from 'src/components/preplan-list/EditPreplanHeaderModal';
import RemovePreplanHeaderModal, { useRemovePreplanHeaderModalState } from 'src/components/preplan-list/RemovePreplanHeaderModal';
import { useHistory } from 'react-router-dom';
import { useThrowApplicationError } from 'src/pages/error';
import MasterData from 'src/business/master-data';
import PreplanHeaderService from 'src/services/PreplanHeaderService';

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
  const [query, setQuery] = useState<readonly string[]>([]);

  const [newPreplanHeaderModalState, openNewPreplanHeaderModal, closeNewPreplanHeaderModal] = useNewPreplanHeaderModalState();
  const [clonePreplanHeaderModalState, openClonePreplanHeaderModal, closeClonePreplanHeaderModal] = useClonePreplanHeaderModalState();
  const [editPreplanHeaderModalState, openEditPreplanHeaderModal, closeEditPreplanHeaderModal] = useEditPreplanHeaderModalState();
  const [removePreplanHeaderModalState, openRemovePreplanHeaderModal, closeRemovePreplanHeaderModal] = useRemovePreplanHeaderModalState();

  const { enqueueSnackbar } = useSnackbar();
  const throwApplicationError = useThrowApplicationError();

  useEffect(() => {
    setPrePlanLoading(true);
    PreplanHeaderService.getAll()
      .then(preplanHeaderDataModels => {
        const preplanHeaders = preplanHeaderDataModels.map(p => new PreplanHeader(p));
        setPreplanHeaders(preplanHeaders);
      }, throwApplicationError.withTitle('Unable to fetch the list of preplans.'))
      .then(() => setPrePlanLoading(false));
  }, []);

  const history = useHistory();
  const classes = useStyles();

  if (!MasterData.initialized) return <Fragment />;

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
          <IconButton color="primary" title="Add Preplan" onClick={() => openNewPreplanHeaderModal({})}>
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
                  <TableCell className={classes.preplanTableCell}>Accepted</TableCell>
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
                      <TableCell className={classes.preplanTableCell}>{preplanHeader.current.lastEditDateTime.format('d')}</TableCell>
                      <TableCell className={classes.preplanTableCell}>{preplanHeader.creationDateTime.format('d')}</TableCell>
                      <TableCell className={classes.preplanTableCell}>{preplanHeader.parentPreplanHeader && preplanHeader.parentPreplanHeader.name}</TableCell>
                      <TableCell className={classes.preplanTableCell} align="center">
                        {preplanHeader.accepted ? <FinilizedIcon /> : ''}
                      </TableCell>
                      <TableCell className={classes.preplanTableCell}>{preplanHeader.current.simulation && preplanHeader.current.simulation.name}</TableCell>

                      {tab === 'USER' && (
                        <TableCell className={classes.preplanTableCell} align="center">
                          <ProgressSwitch
                            checked={preplanHeader.published}
                            loading={preplanPublishSwitchLoadingStatus[preplanHeader.id]}
                            onChange={async (event, checked) => {
                              if (preplanPublishSwitchLoadingStatus[preplanHeader.id]) return;
                              setPreplanPublishSwitchLoadingStatus(state => ({ ...state, [preplanHeader.id]: true }));
                              try {
                                const preplanHeaderModels = await PreplanHeaderService.setPublished(preplanHeader.id, checked);
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
                        <IconButton title="Copy Preplan" onClick={() => openClonePreplanHeaderModal({ preplanHeader })}>
                          <MahanIcon type={MahanIconType.CopyContent} />
                        </IconButton>
                        {tab === 'USER' && (
                          <Fragment>
                            <IconButton title="Edit Preplan" onClick={() => openEditPreplanHeaderModal({ preplanHeader })}>
                              <EditIcon />
                            </IconButton>
                            <IconButton title="Remove Preplan" onClick={() => openRemovePreplanHeaderModal({ preplanHeader })}>
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
                <Typography align="center" classes={{ root: classes.waitingPaperMessage }}>
                  No preplans
                </Typography>
              )}
            </Paper>
          )}
        </Paper>
      </div>

      <NewPreplanHeaderModal
        preplanHeaders={preplanHeaders}
        state={newPreplanHeaderModalState}
        onClose={closeNewPreplanHeaderModal}
        onCreate={async newPreplanHeaderModel => {
          const newPreplanId = await PreplanHeaderService.createEmpty(newPreplanHeaderModel);
          history.push(`/preplan/${newPreplanId}`);
        }}
      />

      <ClonePreplanHeaderModal
        preplanHeaders={preplanHeaders}
        state={clonePreplanHeaderModalState}
        onClose={closeClonePreplanHeaderModal}
        onClone={async clonePreplanHeaderModel => {
          const newPreplanId = await PreplanHeaderService.clone(clonePreplanHeaderModel);
          history.push(`/preplan/${newPreplanId}`);
        }}
      />

      <EditPreplanHeaderModal
        preplanHeaders={preplanHeaders}
        state={editPreplanHeaderModalState}
        onClose={closeEditPreplanHeaderModal}
        onApply={async editPreplanHeaderModel => {
          const preplanHeaderDataModels = await PreplanHeaderService.edit(editPreplanHeaderModel);
          const preplanHeaders = preplanHeaderDataModels.map(p => new PreplanHeader(p));
          setPreplanHeaders(preplanHeaders);
          closeEditPreplanHeaderModal();
        }}
      />

      <RemovePreplanHeaderModal
        state={removePreplanHeaderModalState}
        onClose={closeRemovePreplanHeaderModal}
        onRemove={async preplanHeaderId => {
          const preplanHeaderDataModels = await PreplanHeaderService.remove(preplanHeaderId);
          const preplanHeaders = preplanHeaderDataModels.map(p => new PreplanHeader(p));
          setPreplanHeaders(preplanHeaders);
          closeRemovePreplanHeaderModal();
        }}
      />
    </Fragment>
  );
};

export default PreplanListPage;
