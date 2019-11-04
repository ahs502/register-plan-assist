import React, { FC } from 'react';
import { Theme, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import BaseModal, { BaseModalProps } from 'src/components/BaseModal';
import PreplanHeader from 'src/business/preplan/PreplanHeader';
import Id from '@core/types/Id';

const useStyles = makeStyles((theme: Theme) => ({}));

export interface RemovePreplanModalState {
  preplanHeader: PreplanHeader;
}

export interface RemovePreplanModalProps extends BaseModalProps<RemovePreplanModalState> {
  onRemove(sourcePreplanId: Id): Promise<void>;
}

const RemovePreplanModal: FC<RemovePreplanModalProps> = ({ state: [open, { preplanHeader }], onRemove, ...others }) => {
  const classes = useStyles();

  return (
    <BaseModal
      {...others}
      open={open}
      title="Would you like to remove your preplan?"
      actions={[
        {
          title: 'Cancel'
        },
        {
          title: 'Remove',
          action: async () => await onRemove(preplanHeader.id)
        }
      ]}
    >
      {open && <Typography variant="body1">All of data about preplan {preplanHeader.name} will be removed.</Typography>}
    </BaseModal>
  );
};

export default RemovePreplanModal;
