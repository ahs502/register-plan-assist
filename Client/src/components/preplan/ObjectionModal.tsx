import React, { FC } from 'react';
import { Theme, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import ModalBase, { ModalBaseProps, ModalBaseModel } from 'src/components/ModalBase';
import Objectionable from 'src/business/constraints/Objectionable';

const useStyles = makeStyles((theme: Theme) => ({}));

export interface ObjectionModalModel extends ModalBaseModel {
  target?: Objectionable;
}

export interface ObjectionModalProps extends ModalBaseProps<ObjectionModalModel> {}

const ObjectionModal: FC<ObjectionModalProps> = ({ ...others }) => {
  const { target } = others.model;

  const classes = useStyles();

  return (
    <ModalBase
      {...others}
      title={target ? `The list of objections on ${target.marker}:` : ''}
      actions={[
        {
          title: 'Close'
        }
      ]}
    >
      TODO: The list of objections...
    </ModalBase>
  );
};

export default ObjectionModal;
