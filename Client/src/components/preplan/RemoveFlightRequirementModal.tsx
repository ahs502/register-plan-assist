import React, { FC, useContext } from 'react';
import { Theme, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import BaseModal, { BaseModalProps, useModalState } from 'src/components/BaseModal';
import FlightRequirement from 'src/business/flight-requirement/FlightRequirement';
import { ReloadPreplanContext, PreplanContext } from 'src/pages/preplan';
import FlightRequirementService from 'src/services/FlightRequirementService';

const useStyles = makeStyles((theme: Theme) => ({}));

export interface RemoveFlightRequirementModalState {
  flightRequirement: FlightRequirement;
}

export interface RemoveFlightRequirementModalProps extends BaseModalProps<RemoveFlightRequirementModalState> {}

const RemoveFlightRequirementModal: FC<RemoveFlightRequirementModalProps> = ({ state: [open, { flightRequirement }], ...others }) => {
  const preplan = useContext(PreplanContext);
  const reloadPreplan = useContext(ReloadPreplanContext);

  const classes = useStyles();

  return (
    <BaseModal
      {...others}
      open={open}
      title={flightRequirement ? `Are you sure to remove ${flightRequirement.marker}?` : ''}
      actions={[
        {
          title: 'Cancel'
        },
        {
          title: 'Remove',
          action: async () => {
            const newPreplanModel = await FlightRequirementService.remove(preplan.id, flightRequirement.id);
            await reloadPreplan(newPreplanModel);
            return others.onClose();
          }
        }
      ]}
    >
      <Typography variant="body1">If you continue to remove this flight requirement, all its related flights will be removed too.</Typography>
    </BaseModal>
  );
};

export default RemoveFlightRequirementModal;

export function useRemoveFlightRequirementModalState() {
  return useModalState<RemoveFlightRequirementModalState>();
}
