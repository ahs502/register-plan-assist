import React, { useState, useMemo } from 'react';
import { Theme, Grid, FormControlLabel, Checkbox, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import BaseModal, { BaseModalProps, useModalState, createModal } from 'src/components/BaseModal';
import PreplanHeader from 'src/business/preplan/PreplanHeader';
import { dataTypes } from 'src/utils/DataType';
import RefiningTextField from 'src/components/RefiningTextField';
import Validation from '@core/node_modules/@ahs502/validation/dist/Validation';
import persistant from 'src/utils/persistant';
import ClonePreplanHeaderModel from '@core/models/preplan/ClonePreplanHeaderModel';
import AutoComplete from 'src/components/AutoComplete';

const useStyles = makeStyles((theme: Theme) => ({}));

interface ViewState {
  name: string;
  startDate: string;
  endDate: string;
  includeChange: boolean;
  includeAllVersions: boolean;
  version?: PreplanHeader['versions'][number];
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
  | 'START_DATE_IS_NOT_AFTER_PREPLAN_START_DATE'
  | 'END_DATE_IS_NOT_BEFORE_PREPLAN_END_DATE'
  | 'ALL_VERSION_ONLY_SELECT_WITH_INCLUDE_CHANGE'
> {
  constructor(
    { name, startDate, endDate, includeChange, includeAllVersions: allVersion }: ViewState,
    currentPreplanHeader: PreplanHeader,
    preplanHeaders: readonly PreplanHeader[]
  ) {
    super(
      validator => {
        validator
          .check('NAME_EXISTS', !!name)
          .check('NAME_FORMAT_IS_CORRECT', () => dataTypes.name.checkView(name))
          .check(
            'NAME_IS_NOT_DUPLICATED_WITH_OTHER_PERPLANS',
            () => !preplanHeaders.some(p => p.user.id === persistant.user!.id && p.name.toUpperCase() === name.toUpperCase()),
            'Preplan already exists.'
          );
        validator.check('START_DATE_EXISTS', !!startDate).check('START_DATE_IS_VALID', () => dataTypes.utcDate.checkView(startDate));
        validator.check('END_DATE_EXISTS', !!endDate).check('END_DATE_IS_VALID', () => dataTypes.utcDate.checkView(endDate));
        validator.when('START_DATE_IS_VALID', 'END_DATE_IS_VALID').then(() => {
          const ok = dataTypes.utcDate.convertViewToModel(startDate) <= dataTypes.utcDate.convertViewToModel(endDate);
          validator.check('START_DATE_IS_NOT_AFTER_END_DATE', ok, 'Can not be after end date.');
          validator.check('END_DATE_IS_NOT_BEFORE_START_DATE', ok, 'Can not be before start date.');
        });
        validator
          .if(includeChange)
          .when('START_DATE_IS_VALID', 'END_DATE_IS_VALID')
          .then(() => {
            validator.check(
              'START_DATE_IS_NOT_AFTER_PREPLAN_START_DATE',
              dataTypes.utcDate.convertViewToModel(startDate) <= dataTypes.utcDate.convertBusinessToModel(currentPreplanHeader.startDate),
              `Can not after ${currentPreplanHeader.startDate.format('d')}.`
            );
            validator.check(
              'END_DATE_IS_NOT_BEFORE_PREPLAN_END_DATE',
              dataTypes.utcDate.convertViewToModel(endDate) >= dataTypes.utcDate.convertBusinessToModel(currentPreplanHeader.endDate),
              `Can not before ${currentPreplanHeader.endDate.format('d')}.`
            );
          });
        validator.if(!includeChange).check('ALL_VERSION_ONLY_SELECT_WITH_INCLUDE_CHANGE', !allVersion);
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

export interface ClonePreplanHeaderModalState {
  preplanHeader: PreplanHeader;
}

export interface ClonePreplanHeaderModalProps extends BaseModalProps<ClonePreplanHeaderModalState> {
  onClone(clonePreplanHeaderModel: ClonePreplanHeaderModel): Promise<void>;
  preplanHeaders: readonly PreplanHeader[];
}

const ClonePreplanHeaderModal = createModal<ClonePreplanHeaderModalState, ClonePreplanHeaderModalProps>(({ state, onClone, preplanHeaders, ...others }) => {
  const [viewState, setViewState] = useState<ViewState>(() => ({
    name: `Copy of ${dataTypes.name.convertBusinessToView(state.preplanHeader.name)}`,
    startDate: dataTypes.utcDate.convertBusinessToView(state.preplanHeader.startDate),
    endDate: dataTypes.utcDate.convertBusinessToView(state.preplanHeader.endDate),
    includeChange: false,
    includeAllVersions: false
  }));

  const preplanVersionOptions = useMemo(
    () => [
      {
        id: '',
        label: ' ',
        version: undefined
      },
      ...state.preplanHeader.versions
        .filter(v => !v.current)
        .map(l => ({
          id: l.id,
          label: l.current ? 'Current' : `${l.lastEditDateTime.format('d')} ${l.lastEditDateTime.format('t')} — ${l.description}`,
          version: l
        }))
    ],
    [state.preplanHeader.versions]
  );

  const validation = new ViewStateValidation(viewState, state.preplanHeader, preplanHeaders);
  const errors = {
    name: validation.message('NAME_*'),
    startDate: validation.message('START_DATE_*'),
    endDate: validation.message('END_DATE_*')
  };

  const classes = useStyles();

  return (
    <BaseModal
      {...others}
      title="What are the new preplan specifications?"
      actions={[
        {
          title: 'Cancel',
          canceler: true
        },
        {
          title: 'Copy',
          submitter: true,
          disabled: !validation.ok,
          action: async () => {
            if (!validation.ok) throw 'Invalid form fields.';

            const clonePreplanHeaderModel: ClonePreplanHeaderModel = {
              name: dataTypes.name.convertViewToModel(viewState.name),
              startDate: dataTypes.utcDate.convertViewToModel(viewState.startDate),
              endDate: dataTypes.utcDate.convertViewToModel(viewState.endDate),
              sourcePreplanId: viewState.version?.id ?? state.preplanHeader.current.id,
              includeChanges: viewState.includeChange,
              includeAllVersions: viewState.includeAllVersions
            };

            await onClone(clonePreplanHeaderModel);
          }
        }
      ]}
      body={({ handleKeyboardEvent }) => (
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={viewState.includeChange}
                  onChange={({ target: { checked } }) => setViewState({ ...viewState, includeChange: checked, includeAllVersions: false })}
                  color="primary"
                />
              }
              label="Include Changes"
            />
          </Grid>
          <Grid item xs={6}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={viewState.includeAllVersions}
                  onChange={({ target: { checked } }) =>
                    setViewState(viewState => ({ ...viewState, includeAllVersions: checked, version: preplanVersionOptions.find(p => p.version === undefined)?.version }))
                  }
                  color="primary"
                />
              }
              label="All Version"
              disabled={!viewState.includeChange}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography>Version</Typography>
            <AutoComplete
              options={preplanVersionOptions}
              value={preplanVersionOptions.find(p => p.version === viewState.version)}
              getOptionLabel={l => l.label}
              getOptionValue={l => l.id}
              onSelect={({ version }) => {
                setViewState({ ...viewState, version });
              }}
              isDisabled={viewState.includeAllVersions}
            />
          </Grid>
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

export default ClonePreplanHeaderModal;

export function useClonePreplanHeaderModalState() {
  return useModalState<ClonePreplanHeaderModalState>();
}
