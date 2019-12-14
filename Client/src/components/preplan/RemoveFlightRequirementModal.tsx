import React, { useContext } from 'react';
import { Theme, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import BaseModal, { BaseModalProps, useModalState, createModal } from 'src/components/BaseModal';
import FlightRequirement from 'src/business/flight-requirement/FlightRequirement';
import { ReloadPreplanContext, PreplanContext } from 'src/pages/preplan';
import FlightRequirementService from 'src/services/FlightRequirementService';

const useStyles = makeStyles((theme: Theme) => ({}));

export interface RemoveFlightRequirementModalState {
  flightRequirement: FlightRequirement;
}

export interface RemoveFlightRequirementModalProps extends BaseModalProps<RemoveFlightRequirementModalState> {}

const RemoveFlightRequirementModal = createModal<RemoveFlightRequirementModalState, RemoveFlightRequirementModalProps>(({ state, ...others }) => {
  const preplan = useContext(PreplanContext);
  const reloadPreplan = useContext(ReloadPreplanContext);

  const classes = useStyles();

  return (
    <BaseModal
      {...others}
      title={state.flightRequirement ? `Are you sure to remove ${state.flightRequirement.marker}?` : ''}
      actions={[
        {
          title: 'Cancel',
          canceler: true
        },
        {
          title: 'Remove',
          submitter: true,
          action: async () => {
            const newPreplanModel = await FlightRequirementService.remove(preplan.id, state.flightRequirement.id);
            await reloadPreplan(newPreplanModel);
            return others.onClose();
          }
        }
      ]}
      body={() => <Typography variant="body1">If you continue to remove this flight requirement, all its related flights will be removed too.</Typography>}
    />
  );
});

export default RemoveFlightRequirementModal;

export function useRemoveFlightRequirementModalState() {
  return useModalState<RemoveFlightRequirementModalState>();
}
