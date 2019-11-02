import React, { FC } from 'react';
import { Theme, Grid, TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import ModalBase, { ModalBaseProps, ModalBaseModel, useModalViewModel } from 'src/components/ModalBase';
import NewPreplanModel from '@core/models/preplan/NewPreplanModel';
import { parseDateUtc } from 'src/utils/parsers';

const useStyles = makeStyles((theme: Theme) => ({}));

interface ViewModel {
  name: string;
  startDate: string;
  endDate: string;
}

export interface NewPreplanModalModel extends ModalBaseModel {}

export interface NewPreplanModalProps extends ModalBaseProps<NewPreplanModalModel> {
  onCreate(newPreplanModel: NewPreplanModel): void;
}

const NewPreplanModal: FC<NewPreplanModalProps> = ({ onCreate, ...others }) => {
  const { open } = others.model;

  const [viewModel, setViewModel] = useModalViewModel<ViewModel>(open, {
    name: '',
    startDate: '',
    endDate: ''
  });

  const classes = useStyles();

  return (
    <ModalBase
      {...others}
      title="What are the new preplan specifications?"
      actions={[
        {
          title: 'Cancel'
        },
        {
          title: 'Create',
          action: () => {
            //TODO: Validate the view model first...

            const newPreplanModel: NewPreplanModel = {
              name: viewModel.name,
              startDate: parseDateUtc(viewModel.startDate)!.toJSON(),
              endDate: parseDateUtc(viewModel.endDate)!.toJSON()
            };

            onCreate(newPreplanModel);
          }
        }
      ]}
    >
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <TextField label="Name" value={viewModel.name} onChange={({ target: { value: name } }) => setViewModel({ ...viewModel, name })} />
        </Grid>
        <Grid item xs={6}>
          <TextField label="Start Date" value={viewModel.startDate} onChange={({ target: { value: startDate } }) => setViewModel({ ...viewModel, startDate })} />
        </Grid>
        <Grid item xs={6}>
          <TextField label="End Date" value={viewModel.endDate} onChange={({ target: { value: endDate } }) => setViewModel({ ...viewModel, endDate })} />
        </Grid>
      </Grid>
    </ModalBase>
  );
};

export default NewPreplanModal;
