import React, { useState } from 'react';
import { Theme, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import BaseModal, { BaseModalProps, useModalState, createModal } from 'src/components/BaseModal';
import NewPreplanModel from '@core/models/preplan/NewPreplanModel';
import PreplanHeader from 'src/business/preplan/PreplanHeader';
import Id from '@core/types/Id';
import { dataTypes } from 'src/utils/DataType';
import RefiningTextField from 'src/components/RefiningTextField';
import Validation from '@core/node_modules/@ahs502/validation/dist/Validation';
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
  | 'NAME_IS_NOT_DUPLICATED_WITH_OTHER_PERPLANS'
  | 'START_DATE_EXISTS'
  | 'START_DATE_IS_VALID'
  | 'END_DATE_EXISTS'
  | 'END_DATE_IS_VALID'
  | 'START_DATE_IS_NOT_AFTER_END_DATE'
  | 'END_DATE_IS_NOT_BEFORE_START_DATE'
> {
  constructor({ name, startDate, endDate }: ViewState, preplanHeaders: readonly PreplanHeader[]) {
    super(
      validator => {
        validator
          .check('NAME_EXISTS', !!name)
          .check('NAME_FORMAT_IS_CORRECT', () => dataTypes.name.checkView(name))
          .check(
            'NAME_IS_NOT_DUPLICATED_WITH_OTHER_PERPLANS',
            () => preplanHeaders.filter(p => p.user.id === persistant.user!.id && p.name.toUpperCase() === name.toUpperCase()).length < 2,
            'Preplan already exists.'
          );
        validator.check('START_DATE_EXISTS', !!startDate).check('START_DATE_IS_VALID', () => dataTypes.utcDate.checkView(startDate));
        validator.check('END_DATE_EXISTS', !!endDate).check('END_DATE_IS_VALID', () => dataTypes.utcDate.checkView(endDate));
        validator.when('START_DATE_IS_VALID', 'END_DATE_IS_VALID').then(() => {
          const ok = dataTypes.utcDate.convertViewToModel(startDate) <= dataTypes.utcDate.convertViewToModel(endDate);
          validator.check('START_DATE_IS_NOT_AFTER_END_DATE', ok, 'Can not be after end date.');
          validator.check('END_DATE_IS_NOT_BEFORE_START_DATE', ok, 'Can not be before start date.');
        });
      },
      {
        '*_EXISTS': 'Required.',
        '*_FORMAT_IS_VALID': 'Invalid format.',
        '*_IS_VALID': 'Invalid.',
        '*_IS_NOT_NEGATIVE': 'Should not be negative.'
      }
    );
  }
}

export interface EditPreplanModalState {
  preplanHeader: PreplanHeader;
}

export interface EditPreplanModalProps extends BaseModalProps<EditPreplanModalState> {
  onApply(sourcePreplanId: Id, newPreplanModel: NewPreplanModel): Promise<void>;
  preplanHeaders: readonly PreplanHeader[];
}

const EditPreplanModal = createModal<EditPreplanModalState, EditPreplanModalProps>(({ state, onApply, preplanHeaders, ...others }) => {
  const [viewState, setViewState] = useState<ViewState>(() => ({
    name: dataTypes.name.convertBusinessToView(state.preplanHeader.name),
    startDate: dataTypes.utcDate.convertBusinessToView(state.preplanHeader.startDate),
    endDate: dataTypes.utcDate.convertBusinessToView(state.preplanHeader.endDate)
  }));

  const validation = new ViewStateValidation(viewState, preplanHeaders);
  const errors = {
    name: validation.message('NAME_*'),
    startDate: validation.message('START_DATE_*'),
    endDate: validation.message('END_DATE_*')
  };

  const classes = useStyles();

  return (
    <BaseModal
      {...others}
      title="What are your intended modifications?"
      actions={[
        {
          title: 'Cancel',
          canceler: true
        },
        {
          title: 'Submit',
          submitter: true,
          disabled: !validation.ok,
          action: async () => {
            if (!validation.ok) throw 'Invalid form fields.';

            const newPreplanModel: NewPreplanModel = {
              name: dataTypes.name.convertViewToModel(viewState.name),
              startDate: dataTypes.utcDate.convertViewToModel(viewState.startDate),
              endDate: dataTypes.utcDate.convertViewToModel(viewState.endDate)
            };

            await onApply(state.preplanHeader.id, newPreplanModel);
          }
        }
      ]}
      body={({ handleKeyboardEvent }) => (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <RefiningTextField
              fullWidth
              autoFocus
              label="Name"
              dataType={dataTypes.name}
              value={viewState.name}
              onChange={({ target: { value: name } }) => setViewState({ ...viewState, name })}
              onKeyDown={handleKeyboardEvent}
              error={errors.name !== undefined}
              helperText={errors.name}
            />
          </Grid>
          <Grid item xs={6}>
            <RefiningTextField
              fullWidth
              label="Start Date"
              dataType={dataTypes.utcDate}
              value={viewState.startDate}
              onChange={({ target: { value: startDate } }) => setViewState({ ...viewState, startDate })}
              onKeyDown={handleKeyboardEvent}
              error={errors.startDate !== undefined}
              helperText={errors.startDate}
            />
          </Grid>
          <Grid item xs={6}>
            <RefiningTextField
              fullWidth
              label="End Date"
              dataType={dataTypes.utcDate}
              value={viewState.endDate}
              onChange={({ target: { value: endDate } }) => setViewState({ ...viewState, endDate })}
              onKeyDown={handleKeyboardEvent}
              error={errors.endDate !== undefined}
              helperText={errors.endDate}
            />
          </Grid>
        </Grid>
      )}
    />
  );
});

export default EditPreplanModal;

export function useEditPreplanModalState() {
  return useModalState<EditPreplanModalState>();
}
