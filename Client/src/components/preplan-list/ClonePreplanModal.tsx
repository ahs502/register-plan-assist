import React, { FC } from 'react';
import { Theme, Grid, TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import BaseModal, { BaseModalProps, useModalViewState, useModalState } from 'src/components/BaseModal';
import NewPreplanModel from '@core/models/preplan/NewPreplanModel';
import PreplanHeader from 'src/business/preplan/PreplanHeader';
import Id from '@core/types/Id';
import RefiningTextField from 'src/components/RefiningTextField';
import { dataTypes } from 'src/utils/DataType';

const useStyles = makeStyles((theme: Theme) => ({}));

interface ViewState {
  name: string;
  startDate: string;
  endDate: string;
}

export interface ClonePreplanModalState {
  preplanHeader: PreplanHeader;
}

export interface ClonePreplanModalProps extends BaseModalProps<ClonePreplanModalState> {
  onClone(sourcePreplanId: Id, newPreplanModel: NewPreplanModel): Promise<void>;
}

const ClonePreplanModal: FC<ClonePreplanModalProps> = ({ state: [open, { preplanHeader }], onClone, ...others }) => {
  const [viewState, setViewState, render] = useModalViewState<ViewState>(
    open,
    {
      name: '',
      startDate: '',
      endDate: ''
    },
    () => ({
      name: `Copy of ${dataTypes.name.convertBusinessToView(preplanHeader.name)}`,
      startDate: dataTypes.utcDate.convertBusinessToView(preplanHeader.startDate),
      endDate: dataTypes.utcDate.convertBusinessToView(preplanHeader.endDate)
    })
  );

  const classes = useStyles();

  return (
    <BaseModal
      {...others}
      open={open}
      title="What are the new preplan specifications?"
      actions={[
        {
          title: 'Cancel'
        },
        {
          title: 'Copy',
          action: async () => {
            //TODO: Validate the view model first...

            const newPreplanModel: NewPreplanModel = {
              name: dataTypes.name.convertViewToModel(viewState.name),
              startDate: dataTypes.utcDate.convertViewToModel(viewState.startDate),
              endDate: dataTypes.utcDate.convertViewToModel(viewState.endDate)
            };

            await onClone(preplanHeader.id, newPreplanModel);
          }
        }
      ]}
    >
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <RefiningTextField label="Name" dataType={dataTypes.name} value={viewState.name} onChange={({ target: { value: name } }) => setViewState({ ...viewState, name })} />
        </Grid>
        <Grid item xs={6}>
          <RefiningTextField
            label="Start Date"
            dataType={dataTypes.utcDate}
            value={viewState.startDate}
            onChange={({ target: { value: startDate } }) => setViewState({ ...viewState, startDate })}
          />
        </Grid>
        <Grid item xs={6}>
          <RefiningTextField
            label="End Date"
            dataType={dataTypes.utcDate}
            value={viewState.endDate}
            onChange={({ target: { value: endDate } }) => setViewState({ ...viewState, endDate })}
          />
        </Grid>
      </Grid>
    </BaseModal>
  );
};

export default ClonePreplanModal;

export function useClonePreplanModalState() {
  return useModalState<ClonePreplanModalState>();
}
