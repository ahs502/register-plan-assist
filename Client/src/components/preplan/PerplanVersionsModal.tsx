import React, { useState } from 'react';
import { Theme, Typography, TableBody, Table, TableRow, TableCell, IconButton } from '@material-ui/core';
import { Check as CheckIcon, Clear as ClearIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';
import BaseModal, { BaseModalProps, useModalState, createModal } from 'src/components/BaseModal';
import Preplan from 'src/business/preplan/Preplan';
import RefiningTextField from 'src/components/RefiningTextField';
import { dataTypes } from 'src/utils/DataType';

const useStyles = makeStyles((theme: Theme) => ({
  // The modal specific styles go here...
}));

interface ViewState {}

export interface PerplanVersionsModalState {
  perplan: Preplan;
}

export interface PerplanVersionsModalProps extends BaseModalProps<PerplanVersionsModalState> {
  loadVersions(versionId: number): void;
  deleteVersion(versionId: number): void;
}

const PerplanVersionsModal = createModal<PerplanVersionsModalState, PerplanVersionsModalProps>(({ state, loadVersions, deleteVersion, ...others }) => {
  const [viewState, setViewState] = useState<ViewState>(() => ({
    //viewStateProperty: state.stateProperty
  }));

  const classes = useStyles();

  return (
    <BaseModal
      {...others}
      title="This is the modal title!"
      actions={[
        {
          title: 'Cancel',
          canceler: true
        }
      ]}
      body={({ handleKeyboardEvent }) => (
        <div>
          <Typography>Version of this preplan:</Typography>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Current</TableCell>
                <TableCell>
                  <RefiningTextField
                    autoFocus
                    dataType={dataTypes.label}
                    //value={viewState.label}
                    //  onChange={e => setViewState({ ...viewState, label: e.target.value })}
                    //  onKeyDown={handleKeyboardEvent}
                    //   error={errors.label !== undefined}
                    //   helperText={errors.label}
                  />
                  <IconButton color="inherit" title="Commit">
                    <CheckIcon />
                  </IconButton>
                </TableCell>
                <TableCell>
                  <IconButton color="inherit" title="Commit">
                    <ClearIcon />
                  </IconButton>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell>Current</TableCell>
                <TableCell>commment</TableCell>
                <TableCell>
                  <IconButton color="inherit" title="Commit">
                    <ClearIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}
    />
  );
});

export default PerplanVersionsModal;

export function usePerplanVersionsModalState() {
  return useModalState<PerplanVersionsModalState>();
}
