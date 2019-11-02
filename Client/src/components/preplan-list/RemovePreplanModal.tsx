import React, { FC } from 'react';
import { Theme, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import ModalBase, { ModalBaseProps, ModalBaseModel } from 'src/components/ModalBase';
import PreplanHeader from 'src/business/preplan/PreplanHeader';
import Id from '@core/types/Id';

const useStyles = makeStyles((theme: Theme) => ({}));

export interface RemovePreplanModalModel extends ModalBaseModel {
  preplanHeader?: PreplanHeader;
}

export interface RemovePreplanModalProps extends ModalBaseProps<RemovePreplanModalModel> {
  onRemove(): void;
}

const RemovePreplanModal: FC<RemovePreplanModalProps> = ({ onRemove, ...others }) => {
  const { preplanHeader } = others.model;

  const classes = useStyles();

  return (
    <ModalBase
      {...others}
      title="Would you like to remove your preplan?"
      actions={[
        {
          title: 'Cancel'
        },
        {
          title: 'Remove',
          action: onRemove
        }
      ]}
    >
      <Typography variant="body1">All of data about preplan {preplanHeader!.name} will be removed.</Typography>
    </ModalBase>
  );
};

export default RemovePreplanModal;
