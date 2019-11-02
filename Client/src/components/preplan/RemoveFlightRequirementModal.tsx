import React, { FC } from 'react';
import { Theme, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import ModalBase, { ModalBaseProps, ModalBaseModel } from 'src/components/ModalBase';
import FlightRequirement from 'src/business/flight-requirement/FlightRequirement';

const useStyles = makeStyles((theme: Theme) => ({}));

export interface RemoveFlightRequirementModalModel extends ModalBaseModel {
  flightRequirement?: FlightRequirement;
}

export interface RemoveFlightRequirementModalProps extends ModalBaseProps<RemoveFlightRequirementModalModel> {
  onRemove(): void;
}

const RemoveFlightRequirementModal: FC<RemoveFlightRequirementModalProps> = ({ onRemove, ...others }) => {
  const { flightRequirement } = others.model;

  const classes = useStyles();

  return (
    <ModalBase
      {...others}
      title={flightRequirement ? `Are you sure to remove ${flightRequirement.marker}?` : ''}
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
      <Typography variant="body1">If you continue to remove this flight requirement, all its related flights will be removed too.</Typography>
    </ModalBase>
  );
};

export default RemoveFlightRequirementModal;
