import React from 'react';
import { Theme, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import BaseModal, { BaseModalProps, useModalState, createModal } from 'src/components/BaseModal';
import PreplanHeader from 'src/business/preplan/PreplanHeader';
import Id from '@core/types/Id';

const useStyles = makeStyles((theme: Theme) => ({}));

export interface RemovePreplanModalState {
  preplanHeader: PreplanHeader;
}

export interface RemovePreplanModalProps extends BaseModalProps<RemovePreplanModalState> {
  onRemove(sourcePreplanId: Id): Promise<void>;
}

const RemovePreplanModal = createModal<RemovePreplanModalState, RemovePreplanModalProps>(({ state, onRemove, ...others }) => {
  const classes = useStyles();

  return (
    <BaseModal
      {...others}
      title="Would you like to remove your preplan?"
      actions={[
        {
          title: 'Cancel',
          canceler: true
        },
        {
          title: 'Remove',
          submitter: true,
          action: async () => await onRemove(state.preplanHeader.id)
        }
      ]}
      body={() => <Typography variant="body1">All of data about preplan {state.preplanHeader.name} will be removed.</Typography>}
    />
  );
});

export default RemovePreplanModal;

export function useRemovePreplanModalState() {
  return useModalState<RemovePreplanModalState>();
}
