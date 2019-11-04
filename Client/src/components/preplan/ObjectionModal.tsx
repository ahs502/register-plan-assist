import React, { FC } from 'react';
import { Theme, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import BaseModal, { BaseModalProps } from 'src/components/BaseModal';
import Objectionable from 'src/business/constraints/Objectionable';

const useStyles = makeStyles((theme: Theme) => ({}));

export interface ObjectionModalState {
  target: Objectionable;
}

export interface ObjectionModalProps extends BaseModalProps<ObjectionModalState> {}

const ObjectionModal: FC<ObjectionModalProps> = ({ state: [open, { target }], ...others }) => {
  const classes = useStyles();

  return (
    <BaseModal
      {...others}
      open={open}
      title={target ? `The list of objections on ${target.marker}:` : ''}
      actions={[
        {
          title: 'Close'
        }
      ]}
    >
      TODO: The list of objections...
    </BaseModal>
  );
};

export default ObjectionModal;
