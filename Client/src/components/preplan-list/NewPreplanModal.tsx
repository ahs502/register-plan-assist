import React, { FC } from 'react';
import { Theme, Grid, TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import BaseModal, { BaseModalProps, useModalViewState } from 'src/components/BaseModal';
import NewPreplanModel from '@core/models/preplan/NewPreplanModel';
import { parseDateUtc } from 'src/utils/parsers';

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
  const [viewState, setViewState] = useModalViewState<ViewState>(open, {
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
              name: viewState.name,
              startDate: parseDateUtc(viewState.startDate)!.toJSON(),
              endDate: parseDateUtc(viewState.endDate)!.toJSON()
            };

            await onCreate(newPreplanModel);
          }
        }
      ]}
    >
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <TextField label="Name" value={viewState.name} onChange={({ target: { value: name } }) => setViewState({ ...viewState, name })} />
        </Grid>
        <Grid item xs={6}>
          <TextField label="Start Date" value={viewState.startDate} onChange={({ target: { value: startDate } }) => setViewState({ ...viewState, startDate })} />
        </Grid>
        <Grid item xs={6}>
          <TextField label="End Date" value={viewState.endDate} onChange={({ target: { value: endDate } }) => setViewState({ ...viewState, endDate })} />
        </Grid>
      </Grid>
    </BaseModal>
  );
};

export default NewPreplanModal;
