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

interface ViewModel {
  name: string;
  startDate: string;
  endDate: string;
}

export interface EditPreplanModalState {
  preplanHeader: PreplanHeader;
}

export interface EditPreplanModalProps extends BaseModalProps<EditPreplanModalState> {
  onApply(sourcePreplanId: Id, newPreplanModel: NewPreplanModel): Promise<void>;
}

const EditPreplanModal: FC<EditPreplanModalProps> = ({ state: [open, { preplanHeader }], onApply, ...others }) => {
  const [viewState, setViewState, render] = useModalViewState<ViewModel>(
    open,
    {
      name: '',
      startDate: '',
      endDate: ''
    },
    () => ({
      name: dataTypes.name.convertBusinessToView(preplanHeader.name),
      startDate: dataTypes.utcDate.convertBusinessToView(preplanHeader.startDate),
      endDate: dataTypes.utcDate.convertBusinessToView(preplanHeader.endDate)
    })
  );

  const classes = useStyles();

  return (
    <BaseModal
      {...others}
      open={open}
      title="What are your intended modifications?"
      actions={[
        {
          title: 'Cancel'
        },
        {
          title: 'Submit',
          action: async () => {
            //TODO: Validate the view model first...

            const newPreplanModel: NewPreplanModel = {
              name: dataTypes.name.convertViewToModel(viewState.name),
              startDate: dataTypes.utcDate.convertViewToModel(viewState.startDate),
              endDate: dataTypes.utcDate.convertViewToModel(viewState.endDate)
            };

            await onApply(preplanHeader.id, newPreplanModel);
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

export default EditPreplanModal;

export function useEditPreplanModalState() {
  return useModalState<EditPreplanModalState>();
}
