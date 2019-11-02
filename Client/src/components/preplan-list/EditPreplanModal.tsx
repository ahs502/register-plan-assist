import React, { FC } from 'react';
import { Theme, Grid, TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import BaseModal, { BaseModalProps, useModalViewState } from 'src/components/BaseModal';
import NewPreplanModel from '@core/models/preplan/NewPreplanModel';
import { parseDateUtc } from 'src/utils/parsers';
import PreplanHeader from 'src/business/preplan/PreplanHeader';
import Id from '@core/types/Id';

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
  const [viewState, setViewState] = useModalViewState<ViewModel>(
    open,
    {
      name: '',
      startDate: '',
      endDate: ''
    },
    () => ({
      name: preplanHeader.name,
      startDate: preplanHeader.startDate.format('d'),
      endDate: preplanHeader.endDate.format('d')
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
              name: viewState.name,
              startDate: parseDateUtc(viewState.startDate)!.toJSON(),
              endDate: parseDateUtc(viewState.endDate)!.toJSON()
            };

            await onApply(preplanHeader.id, newPreplanModel);
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

export default EditPreplanModal;
