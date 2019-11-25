import React, { FC } from 'react';
import { Theme, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import BaseModal, { BaseModalProps, useModalViewState, useModalState } from 'src/components/BaseModal';
import NewPreplanModel from '@core/models/preplan/NewPreplanModel';
import { formFields } from 'src/utils/FormField';
import RefiningTextField from 'src/components/RefiningTextField';
import Validation from '@core/node_modules/@ahs502/validation/dist/Validation';
import PreplanHeader from 'src/business/preplan/PreplanHeader';
import persistant from 'src/utils/persistant';

const useStyles = makeStyles((theme: Theme) => ({}));

interface ViewState {
  name: string;
  startDate: string;
  endDate: string;
}
class ViewStateValidation extends Validation<
  | 'NAME_EXISTS'
  | 'NAME_FORMAT_IS_CORRECT'
  | 'NAME_IS_NOT_DUPLICATED_WITH_OTHER_PERPLAN'
  | 'START_DATE_EXISTS'
  | 'START_DATE_IS_VALID'
  | 'END_DATE_EXISTS'
  | 'END_DATE_IS_VALID'
  | 'START_DATE_IS_NOT_AFTER_END_DATE'
  | 'END_DATE_IS_NOT_BEFORE_START_DATE'
> {
  constructor({ name, startDate, endDate }: ViewState, preplanHeaders: readonly PreplanHeader[]) {
    super(validator => {
      validator
        .check('NAME_EXISTS', !!name)
        .check('NAME_FORMAT_IS_CORRECT', () => formFields.name.check(name))
        .check('NAME_IS_NOT_DUPLICATED_WITH_OTHER_PERPLAN', () => !preplanHeaders.some(p => p.user.id === persistant.user!.id && p.name.toUpperCase() === name.toUpperCase()));
      validator.check('START_DATE_EXISTS', !!startDate).check('START_DATE_IS_VALID', () => formFields.utcDate.check(startDate));
      validator.check('END_DATE_EXISTS', !!endDate).check('END_DATE_IS_VALID', () => formFields.utcDate.check(endDate));
      validator
        .when('START_DATE_IS_VALID', 'END_DATE_IS_VALID')
        .then(() => formFields.utcDate.parse(startDate) <= formFields.utcDate.parse(endDate))
        .check('START_DATE_IS_NOT_AFTER_END_DATE', ok => ok, 'Can not be after end date.')
        .check('END_DATE_IS_NOT_BEFORE_START_DATE', ok => ok, 'Can not be before start date.');
    });
  }
}

export interface NewPreplanModalState {}

export interface NewPreplanModalProps extends BaseModalProps<NewPreplanModalState> {
  onCreate(newPreplanModel: NewPreplanModel): Promise<void>;
  preplanHeaders: readonly PreplanHeader[];
}

const NewPreplanModal: FC<NewPreplanModalProps> = ({ state: [open], onCreate, preplanHeaders, ...others }) => {
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
