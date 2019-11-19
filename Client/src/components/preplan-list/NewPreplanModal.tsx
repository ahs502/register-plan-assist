import React, { FC } from 'react';
import { Theme, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import BaseModal, { BaseModalProps, useModalViewState, useModalState } from 'src/components/BaseModal';
import NewPreplanModel from '@core/models/preplan/NewPreplanModel';
import { formFields } from 'src/utils/FormField';
import RefiningTextField from 'src/components/RefiningTextField';

const useStyles = makeStyles((theme: Theme) => ({}));

interface ViewState {
  name: string;
  startDate: string;
  endDate: string;
}

export interface NewPreplanModalState {}

export interface NewPreplanModalProps extends BaseModalProps<NewPreplanModalState> {
  onCreate(newPreplanModel: NewPreplanModel): Promise<void>;
}

const NewPreplanModal: FC<NewPreplanModalProps> = ({ state: [open], onCreate, ...others }) => {
  const [viewState, setViewState, render] = useModalViewState<ViewState>(open, {
    name: '',
    startDate: '',
    endDate: ''
  });

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
          title: 'Create',
          action: async () => {
            //TODO: Validate the view model first...

            const newPreplanModel: NewPreplanModel = {
              name: formFields.name.parse(viewState.name),
              startDate: formFields.utcDate.parse(viewState.startDate),
              endDate: formFields.utcDate.parse(viewState.endDate)
            };

            await onCreate(newPreplanModel);
          }
        }
      ]}
    >
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <RefiningTextField label="Name" formField={formFields.name} value={viewState.name} onChange={({ target: { value: name } }) => setViewState({ ...viewState, name })} />
        </Grid>
        <Grid item xs={6}>
          <RefiningTextField
            label="Start Date"
            formField={formFields.utcDate}
            value={viewState.startDate}
            onChange={({ target: { value: startDate } }) => setViewState({ ...viewState, startDate })}
          />
        </Grid>
        <Grid item xs={6}>
          <RefiningTextField
            label="End Date"
            formField={formFields.utcDate}
            value={viewState.endDate}
            onChange={({ target: { value: endDate } }) => setViewState({ ...viewState, endDate })}
          />
        </Grid>
      </Grid>
    </BaseModal>
  );
};

export default NewPreplanModal;

export function useNewPreplanModalState() {
  return useModalState<NewPreplanModalState>();
}
