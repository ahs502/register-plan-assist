import React from 'react';
import { Theme, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import BaseModal, { BaseModalProps, useModalState, createModal } from 'src/components/BaseModal';
import PreplanHeader from 'src/business/preplan/PreplanHeader';
import Id from '@core/types/Id';
import Preplan from 'src/business/preplan/Preplan';

const useStyles = makeStyles((theme: Theme) => ({}));

export interface RemoveVersionModalState {
  version: Preplan['versions'][number];
}

export interface RemoveVersionModalProps extends BaseModalProps<RemoveVersionModalState> {
  onRemove(version: Preplan['versions'][number]): Promise<void>;
}

const RemoveVersionModal = createModal<RemoveVersionModalState, RemoveVersionModalProps>(({ state, onRemove, ...others }) => {
  const classes = useStyles();

  return (
    <BaseModal
      {...others}
      title="Would you like to remove version?"
      actions={[
        {
          title: 'Cancel',
          canceler: true
        },
        {
          title: 'Remove',
          submitter: true,
          action: async () => await onRemove(state.version)
        }
      ]}
      body={() => <Typography variant="body1">All of data about version {state.version.current ? 'CURRENT' : state.version.description} will be removed.</Typography>}
    />
  );
});

export default RemoveVersionModal;

export function useRemoveVersionModalState() {
  return useModalState<RemoveVersionModalState>();
}
