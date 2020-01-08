import React, { useMemo, useContext, Fragment, useState, useEffect } from 'react';
import { Theme, Typography, Grid, Paper, Tabs, Tab, Checkbox, IconButton, FormControlLabel, Slider } from '@material-ui/core';
import { Clear as ClearIcon, Add as AddIcon, Remove as RemoveIcon, WrapText as WrapTextIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';
import BaseModal, { BaseModalProps, useModalState, createModal } from 'src/components/BaseModal';
import FlightRequirement from 'src/business/flight-requirement/FlightRequirement';
import Weekday, { Weekdays } from '@core/types/Weekday';
import AutoComplete from 'src/components/AutoComplete';
import MultiSelect from 'src/components/MultiSelect';
import MasterData from 'src/business/master-data';
import { Rsxes } from '@core/types/Rsx';
import AircraftIdentityType from '@core/types/AircraftIdentityType';
import { PreplanContext, ReloadPreplanContext } from 'src/pages/preplan';
import NewFlightRequirementModel from '@core/models/flight-requirement/NewFlightRequirementModel';
import FlightLegModel from '@core/models/flight/FlightLegModel';
import AircraftIdentityModel from '@core/models/AircraftIdentityModel';
import FlightRequirementLegModel from '@core/models/flight-requirement/FlightRequirementLegModel';
import DayFlightRequirementModel from '@core/models/flight-requirement/DayFlightRequirementModel';
import Flight from 'src/business/flight/Flight';
import FlightRequirementService from 'src/services/FlightRequirementService';
import DayFlightRequirementLegModel from '@core/models/flight-requirement/DayFlightRequirementLegModel';
import { dataTypes } from 'src/utils/DataType';
import RefiningTextField from 'src/components/RefiningTextField';
import {
  ViewState,
  RouteLegViewState,
  WeekDayViewState,
  LegViewState,
  ViewStateValidation,
  ChangeScopeViewState,
  BaseScopeViewState,
  BaseDayViewState,
  GeneralOptionViewState,
  RsxOptionViewState,
  AircraftIdentityOptionViewState
} from 'src/components/preplan/FlightRequirementModal.types';
import classNames from 'classnames';
import EditFlightModel from '@core/models/flight/EditFlightModel';
import chroma from 'chroma-js';
import FlightRequirementChangeModel from '@core/models/flight-requirement/FlightRequirementChangeModel';
import FlightRequirementLegChangeModel from '@core/models/flight-requirement/FlightRequirementLegChangeModel';
import DayFlightRequirementChangeModel from '@core/models/flight-requirement/DayFlightRequirementChangeModel';
import DayFlightRequirementLegChangeModel from '@core/models/flight-requirement/DayFlightRequirementLegChangeModel';

const useStyles = makeStyles((theme: Theme) => ({
  scopeTabBase: {
    flexGrow: 0,
    minWidth: `${100 * (2 / 12)}%`,
    textTransform: 'unset'
  },
  scopeTabChange: {
    textTransform: 'unset'
  },
  scopeChangeRoot: {
    width: '100%',
    display: 'flex'
  },
  scopeChangeSelection: {
    flexGrow: 1,
    paddingBottom: 13,
    paddingLeft: 6
  },
  scopeChangeWeeks: {
    width: '100%',
    display: 'flex',
    marginBottom: 2
  },
  scopeChangeWeek: {
    width: 10,
    flexGrow: 1,
    position: 'relative',
    borderWidth: 1,
    borderRightWidth: 0,
    borderStyle: 'solid',
    borderRadius: 0,
    margin: 0,
    padding: '4px 0px 4px 0px',
    color: theme.palette.grey[600],
    borderColor: theme.palette.grey[400],
    overflow: 'hidden',
    fontSize: '13px',
    lineHeight: '15px',
    userSelect: 'none',
    cursor: 'pointer',
    '&:first-child': {
      borderTopLeftRadius: 5,
      borderBottomLeftRadius: 5
    },
    '&:last-child': {
      borderRightWidth: 1,
      borderTopRightRadius: 5,
      borderBottomRightRadius: 5
    },
    '&:hover $scopeChangeWeekHover': {
      display: 'block'
    }
  },
  scopeChangeWeekHover: {
    display: 'none',
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#0002',
    userSelect: 'none',
    pointerEvents: 'none'
  },
  selectedWeek: {
    display: 'black',
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#0002',
    userSelect: 'none',
    pointerEvents: 'none'
  },
  scopeChangeChunk: {
    color: theme.palette.common.black,
    backgroundColor: chroma(theme.palette.secondary.light)
      .alpha(0.25)
      .hex(),
    borderColor: theme.palette.secondary.light,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    '&:not($scopeChangeChunkStart)': {
      borderLeftColor: chroma(theme.palette.secondary.light)
        .alpha(0.5)
        .hex(),
      '&$scopeChangeChunkSelected': {
        borderLeftColor: chroma(theme.palette.secondary.main)
          .alpha(0.5)
          .hex()
      }
    }
  },
  scopeChangeChunkStart: {
    borderLeftWidth: 2
  },
  scopeChangeChunkEnd: {
    borderRightWidth: 2,
    '&:last-child': {
      borderRightWidth: 2
    }
  },
  scopeChangeAfterChunkEnd: {
    borderLeftWidth: '0 !important'
  },
  scopeChangeChunkSelected: {
    fontWeight: 'bold',
    backgroundColor: chroma(theme.palette.secondary.main)
      .alpha(0.4)
      .hex(),
    borderColor: theme.palette.secondary.main
  },
  scopeChangeChunkError: {
    color: theme.palette.error.dark,
    backgroundColor: chroma(theme.palette.error.light)
      .alpha(0.25)
      .hex(),
    borderColor: theme.palette.error.light,
    '& $scopeChangeChunkSelected': {
      backgroundColor: chroma(theme.palette.error.main)
        .alpha(0.4)
        .hex(),
      borderColor: theme.palette.error.main
    }
  },
  scopeChangeSliderRoot: {
    height: 6
  },
  scopeChangeSliderThumb: {
    height: 20,
    width: 20,
    marginTop: -7,
    marginLeft: -10,
    backgroundColor: theme.palette.common.white,
    border: '2px solid currentColor',
    '&:hover, &$active': {
      boxShadow: `0 0 12px 4px ${chroma(theme.palette.primary.main).alpha(0.7)}`
    }
  },
  scopeChangeSliderValueLabel: {
    left: 'calc(-50% + 0px)',
    top: 23,
    '& *': {
      background: 'transparent',
      color: theme.palette.common.black,
      transform: 'rotate(-15deg)'
    },
    fontSize: '11px'
  },
  scopeChangeSliderTrack: {
    height: 6,
    borderRadius: 3
  },
  scopeChangeSliderRail: {
    height: 6,
    borderRadius: 3
  },
  scopeChangeAdd: {
    marginTop: 34,
    marginLeft: 8
  },
  rebaseScopeChange: {
    marginBottom: 34,
    marginRight: -56,
    bottom: 5
  },
  dayTab: {
    minWidth: 'unset',
    textTransform: 'unset'
  },
  panelPaper: {
    padding: theme.spacing(2)
  },
  dayPanelPaper: {
    minHeight: 388
  },
  flex: {
    display: 'flex'
  },
  grow: {
    flexGrow: 1
  },
  checkboxContainer: {
    height: 48
  },
  error: {
    color: theme.palette.error.main
  }
}));

export interface FlightRequirementModalState {
  flightRequirement?: FlightRequirement;
  day?: Weekday;
  date?: Date;
}

export interface FlightRequirementModalProps extends BaseModalProps<FlightRequirementModalState> {}

const FlightRequirementModal = createModal<FlightRequirementModalState, FlightRequirementModalProps>(({ state, ...others }) => {
  const preplan = useContext(PreplanContext);
  const reloadPreplan = useContext(ReloadPreplanContext);

  const flights = useMemo(() => (state.flightRequirement ? preplan.flights.filter(({ flightRequirement: { id } }) => id === state.flightRequirement!.id) : []), []);

  const categoryOptions = useMemo(makeCategoryOptions, []);
  const rsxOptions = useMemo(makeRsxOptions, []);
  const aircraftIdentityOptions = useMemo(makeAircraftIdentityOptions, []);

  const [viewState, setViewState] = useState<ViewState>(makeInitialViewState);
  const { bypassValidation, scopeIndex, dayIndex, legIndex } = viewState;
  const routeLegViewState = viewState.route[legIndex];
  const scopeViewState = scopeIndex === 'BASE' ? viewState.baseScope : scopeIndex === -1 ? undefined : viewState.changeScopes[scopeIndex];
  const dayViewState = dayIndex === 'ALL' ? scopeViewState?.baseDay : scopeViewState?.weekDays[dayIndex];
  const weekDayViewState = dayIndex === 'ALL' ? undefined : scopeViewState?.weekDays[dayIndex];
  const legViewState = dayViewState?.legs[legIndex];

  const validation = new ViewStateValidation(viewState, preplan.aircraftRegisters);
  const errors = makeValidationErrors();

  const classes = useStyles();

  return (
    <BaseModal
      {...others}
      maxWidth="lg"
      cancelable={true}
      title={state.flightRequirement ? 'What are your intended changes?' : 'What is the new flight requirement?'}
      actions={[
        {
          title: preplan.readonly ? 'Close' : 'Cancel',
          canceler: true
        },
        {
          title: 'Submit',
          submitter: true,
          disabled: !viewState.bypassValidation && !validation.ok,
          invisible: preplan.readonly,
          action: submit
        }
      ]}
      body={({ handleKeyboardEvent }) => {
        return (
          <Grid container spacing={0}>
            <Grid item xs={12} container spacing={2}>
              {generalFields()}

              {/* A little extra space */}
              <Grid item xs={12}></Grid>
            </Grid>

            <Grid item xs={12}>
              {scopeTabs()}
            </Grid>

            {/* Scope contents */}
            <Grid item xs={12}>
              <Paper classes={{ root: classes.panelPaper }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} container spacing={0}>
                    <Grid item xs={1}>
                      {daySelection()}
                    </Grid>
                    <Grid item xs={1}>
                      {dayTabs()}
                    </Grid>

                    {/* Day contents */}
                    <Grid item xs={10}>
                      <Paper classes={{ root: classNames(classes.panelPaper, classes.dayPanelPaper) }}>
                        <Grid container spacing={2}>
                          {dayGeneralFields()}

                          <Grid item xs={12}>
                            {legTabs()}

                            {/* Leg contents */}
                            <Paper classes={{ root: classes.panelPaper }}>
                              <Grid container spacing={2}>
                                {legFields()}{' '}
                              </Grid>
                            </Paper>
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        );

        function generalFields() {
          return (
            <Fragment>
              <Grid item xs={5}>
                <RefiningTextField
                  fullWidth
                  autoFocus
                  label="Label"
                  dataType={dataTypes.label}
                  value={viewState.label}
                  onChange={({ target: { value: label } }) => setViewState({ ...viewState, label })}
                  onKeyDown={handleKeyboardEvent}
                  error={errors.label !== undefined}
                  helperText={errors.label}
                  disabled={preplan.readonly}
                />
              </Grid>
              <Grid item xs={5}>
                {viewState.addingNewCategory ? (
                  <RefiningTextField
                    fullWidth
                    label="New Category"
                    dataType={dataTypes.name}
                    value={viewState.category}
                    onChange={({ target: { value: category } }) =>
                      setViewState({
                        ...viewState,
                        category,
                        categoryOption: categoryOptions.slice(1).find(o => o.name.toUpperCase() === category.toUpperCase()) || categoryOptions[0]
                      })
                    }
                    onKeyDown={handleKeyboardEvent}
                    error={errors.category !== undefined}
                    helperText={errors.category}
                    disabled={preplan.readonly}
                  />
                ) : (
                  <AutoComplete
                    options={categoryOptions}
                    label="Category"
                    getOptionLabel={o => o.name}
                    getOptionValue={o => o.name}
                    value={viewState.categoryOption}
                    onSelect={categoryOption => setViewState({ ...viewState, category: categoryOption === categoryOptions[0] ? '' : categoryOption.name, categoryOption })}
                    isDisabled={preplan.readonly}
                  />
                )}
              </Grid>
              <Grid item xs={1}>
                {viewState.addingNewCategory ? (
                  <IconButton
                    disabled={preplan.readonly}
                    title="Select Category"
                    onClick={() => setViewState({ ...viewState, addingNewCategory: false, category: '', categoryOption: categoryOptions[0] })}
                  >
                    <ClearIcon />
                  </IconButton>
                ) : (
                  <IconButton
                    disabled={preplan.readonly}
                    title="New Category"
                    onClick={() => setViewState({ ...viewState, addingNewCategory: true, category: '', categoryOption: categoryOptions[0] })}
                  >
                    <AddIcon />
                  </IconButton>
                )}
              </Grid>
              <Grid item xs={1}>
                <AutoComplete
                  options={MasterData.all.stcs.items}
                  label="Stc"
                  getOptionLabel={s => s.name}
                  getOptionValue={s => s.id}
                  value={viewState.stc}
                  onSelect={stc => setViewState({ ...viewState, stc })}
                  isDisabled={preplan.readonly}
                />
              </Grid>
            </Fragment>
          );
        }
        function scopeTabs() {
          return (
            <Tabs
              value={scopeIndex === 'BASE' ? 'BASE' : 'CHANGE'}
              onChange={(e, value) => {
                const newScopeIndex: ViewState['scopeIndex'] = value === 'BASE' ? 'BASE' : scopeIndex;
                if (newScopeIndex === scopeIndex) return;
                setViewState(viewState => {
                  return refineViewState(
                    {
                      ...viewState,
                      scopeIndex: newScopeIndex,
                      dayIndex: newScopeIndex !== -1 ? dayIndex : 'ALL',
                      legIndex: newScopeIndex !== -1 ? legIndex : 0
                    },
                    true
                  );
                });
              }}
              variant="fullWidth"
            >
              <Tab
                classes={{ root: classNames(classes.scopeTabBase, { [classes.error]: errors.baseScope }) }}
                value="BASE"
                label={<FormControlLabel control={<Checkbox color="primary" checked={scopeIndex === 'BASE'} />} label="Base" labelPlacement="end" />}
              />
              <Tab
                classes={{ root: classes.scopeTabChange }}
                value="CHANGE"
                disableRipple
                label={
                  <div className={classes.scopeChangeRoot}>
                    <div className={classes.scopeChangeSelection}>
                      <div className={classes.scopeChangeWeeks}>
                        {preplan.weeks.all.map((week, weekIndex) => {
                          const changeScopeIndex = viewState.changeScopes.findIndex(({ startWeekIndex, endWeekIndex }) => startWeekIndex <= weekIndex && weekIndex <= endWeekIndex);
                          const changeScope = changeScopeIndex < 0 ? undefined : viewState.changeScopes[changeScopeIndex];

                          return (
                            <div
                              key={weekIndex}
                              className={classNames(
                                classes.scopeChangeWeek,
                                changeScope && {
                                  [classes.scopeChangeChunk]: true,
                                  [classes.scopeChangeChunkStart]: weekIndex === changeScope.startWeekIndex,
                                  [classes.scopeChangeChunkEnd]: weekIndex === changeScope.endWeekIndex,
                                  [classes.scopeChangeChunkSelected]: changeScopeIndex === scopeIndex,
                                  [classes.scopeChangeChunkError]: errors.changeScopes[changeScopeIndex]
                                },
                                {
                                  [classes.scopeChangeAfterChunkEnd]: weekIndex > 0 && viewState.changeScopes.some(({ endWeekIndex }) => endWeekIndex === weekIndex - 1)
                                }
                              )}
                              title={`Week from ${week.startDate.format('d')} to ${week.endDate.format('d')}`}
                              onClick={() => {
                                //if (changeScopeIndex === -1)
                                setViewState(viewState => {
                                  return { ...viewState, selectedWeekIndex: weekIndex };
                                });

                                if (changeScopeIndex === scopeIndex) return;

                                setViewState(viewState => {
                                  return refineViewState(
                                    {
                                      ...viewState,
                                      scopeIndex: changeScopeIndex,
                                      sliderStartIndex: changeScopeIndex < 0 ? 0 : viewState.changeScopes[changeScopeIndex].startWeekIndex,
                                      sliderEndIndex: changeScopeIndex < 0 ? 0 : viewState.changeScopes[changeScopeIndex].endWeekIndex - 1
                                    },
                                    true
                                  );
                                });
                              }}
                            >
                              {formatDate(week.startDate, true)}
                              <div className={classNames(viewState.selectedWeekIndex === weekIndex ? classes.selectedWeek : classes.scopeChangeWeekHover)} />
                            </div>
                          );
                        })}
                      </div>

                      <Slider
                        color="primary"
                        classes={{
                          root: classes.scopeChangeSliderRoot,
                          thumb: classes.scopeChangeSliderThumb,
                          valueLabel: classes.scopeChangeSliderValueLabel,
                          track: classes.scopeChangeSliderTrack,
                          rail: classes.scopeChangeSliderRail
                        }}
                        step={1}
                        min={0}
                        max={preplan.weeks.all.length}
                        valueLabelDisplay="on"
                        valueLabelFormat={index =>
                          scopeIndex === 'BASE' || scopeIndex < 0 || viewState.sliderStartIndex === viewState.sliderEndIndex
                            ? ''
                            : formatDate(index === viewState.sliderStartIndex ? preplan.weeks.all[index].startDate : preplan.weeks.all[index - 1].endDate)
                        }
                        track={scopeIndex === 'BASE' || scopeIndex < 0 ? false : 'normal'}
                        value={scopeIndex === 'BASE' || scopeIndex < 0 ? [] : [viewState.sliderStartIndex, viewState.sliderEndIndex]}
                        onChange={(e, value) =>
                          scopeIndex === 'BASE' ||
                          scopeIndex < 0 ||
                          setViewState({ ...viewState, sliderStartIndex: (value as number[])[0], sliderEndIndex: (value as number[])[1] })
                        }
                        onChangeCommitted={() =>
                          scopeIndex === 'BASE' ||
                          scopeIndex < 0 ||
                          setViewState(
                            refineViewState({
                              ...viewState,
                              changeScopes: splice(viewState.changeScopes, scopeIndex, 1, ([c]) => {
                                return {
                                  ...c,
                                  startWeekIndex: viewState.sliderStartIndex,
                                  endWeekIndex: viewState.sliderEndIndex - 1
                                };
                              })
                            })
                          )
                        }
                      />
                    </div>
                    <div>
                      <IconButton
                        classes={{ root: classes.rebaseScopeChange }}
                        title={'Remove change'}
                        onClick={() => {
                          if (scopeIndex !== 'BASE' && scopeIndex >= 0) {
                            setViewState(viewState => {
                              return refineViewState({
                                ...viewState,
                                scopeIndex: -1,
                                changeScopes: splice(viewState.changeScopes, scopeIndex, 1, ([c]) => ({
                                  ...viewState.baseScope,
                                  startWeekIndex: c.startWeekIndex,
                                  endWeekIndex: c.endWeekIndex,
                                  isNew: c.isNew,
                                  isTemp: false
                                }))
                              });
                            });
                          }
                        }}
                      >
                        <RemoveIcon />
                      </IconButton>

                      <IconButton
                        classes={{ root: classes.scopeChangeAdd }}
                        title={scopeIndex === 'BASE' || scopeIndex < 0 ? 'Add a new change' : 'Split the selected change'}
                        onClick={() => {
                          if (scopeIndex === 'BASE' || scopeIndex < 0)
                            return (
                              viewState.changeScopes[0]?.startWeekIndex === 0 ||
                              setViewState(viewState => {
                                return {
                                  ...viewState,
                                  scopeIndex: 0,
                                  sliderStartIndex: viewState.selectedWeekIndex ?? 0,
                                  sliderEndIndex: (viewState.selectedWeekIndex ?? 0) + 1,
                                  changeScopes: [
                                    {
                                      ...viewState.baseScope,
                                      startWeekIndex: viewState.selectedWeekIndex ?? 0,
                                      endWeekIndex: viewState.selectedWeekIndex ?? 0,
                                      isTemp: true,
                                      isNew: true
                                    },
                                    ...viewState.changeScopes
                                  ]
                                };
                              })
                            );
                          if (viewState.changeScopes[scopeIndex].startWeekIndex === viewState.changeScopes[scopeIndex].endWeekIndex) return;
                          setViewState(viewState => ({
                            ...viewState,
                            scopeIndex: 0,
                            sliderStartIndex: viewState.selectedWeekIndex ?? 0,
                            sliderEndIndex: (viewState.selectedWeekIndex ?? 0) + 1,
                            changeScopes: [
                              {
                                ...viewState.changeScopes[scopeIndex],
                                startWeekIndex: viewState.selectedWeekIndex ?? 0,
                                endWeekIndex: viewState.selectedWeekIndex ?? 0,
                                isTemp: true,
                                isNew: true
                              },
                              ...viewState.changeScopes
                            ]
                          }));
                        }}
                      >
                        <AddIcon />
                      </IconButton>
                    </div>
                  </div>
                }
              />
            </Tabs>
          );
        }
        function daySelection() {
          return (
            <Fragment>
              <div className={classes.checkboxContainer}>
                <Checkbox
                  // icon={errors.daySelects === undefined ? <CheckBoxOutlineBlankIcon /> : <CheckBoxOutlineBlankIcon color="error" />}
                  indeterminate={scopeViewState && scopeViewState.weekDays.some(d => d.selected) && !scopeViewState.weekDays.every(d => d.selected)}
                  checked={scopeViewState?.weekDays.every(d => d.selected) ?? false}
                  onChange={e => {
                    if (!scopeViewState) return;
                    const selected = !scopeViewState.weekDays.every(d => d.selected);
                    updateScope(scope => ({
                      ...scope,
                      weekDays: scope.weekDays.map(() => ({ ...scope.baseDay, selected }))
                    }));
                  }}
                  color="primary"
                  disabled={preplan.readonly || !scopeViewState}
                />
              </div>
              {Weekdays.map(d => (
                <div className={classes.checkboxContainer} key={d}>
                  <Checkbox
                    // icon={errors.daySelects === undefined ? <CheckBoxOutlineBlankIcon /> : <CheckBoxOutlineBlankIcon color="error" />}
                    checked={scopeViewState?.weekDays[d].selected ?? false}
                    onChange={(e, selected) =>
                      scopeViewState &&
                      updateScope(scope => ({
                        ...scope,
                        weekDays: splice(scope.weekDays, d, 1, { ...scope.baseDay, selected })
                      }))
                    }
                    disabled={preplan.readonly}
                  />
                </div>
              ))}
            </Fragment>
          );
        }
        function dayTabs() {
          return (
            <Tabs value={dayIndex} onChange={(e, dayIndex) => setViewState({ ...viewState, dayIndex })} variant="fullWidth" orientation="vertical">
              <Tab classes={{ root: classNames(classes.dayTab, { [classes.error]: errors.allDays }) }} value="ALL" label="(All)" disabled={!scopeViewState} />
              {Weekdays.map(d => (
                <Tab
                  key={d}
                  classes={{ root: classNames(classes.dayTab, { [classes.error]: errors.dayTabs[d] }) }}
                  value={d}
                  label={`${
                    scopeViewState &&
                    (scopeViewState.weekDays[d].rsx !== scopeViewState.baseDay.rsx ||
                      dataTypes.label.refineView(scopeViewState.weekDays[d].notes) !== dataTypes.label.refineView(scopeViewState.baseDay.notes) ||
                      scopeViewState.weekDays[d].allowedAircraftIdentities.some(i => !scopeViewState.baseDay.allowedAircraftIdentities.includes(i)) ||
                      scopeViewState.baseDay.allowedAircraftIdentities.some(i => !scopeViewState.weekDays[d].allowedAircraftIdentities.includes(i)) ||
                      scopeViewState.weekDays[d].forbiddenAircraftIdentities.some(i => !scopeViewState.baseDay.forbiddenAircraftIdentities.includes(i)) ||
                      scopeViewState.baseDay.forbiddenAircraftIdentities.some(i => !scopeViewState.weekDays[d].forbiddenAircraftIdentities.includes(i)) ||
                      scopeViewState.weekDays[d].legs.some(
                        (l, index) =>
                          dataTypes.daytime.refineView(l.stdLowerBound) !== dataTypes.daytime.refineView(scopeViewState.baseDay.legs[index].stdLowerBound) ||
                          dataTypes.daytime.refineView(l.stdUpperBound) !== dataTypes.daytime.refineView(scopeViewState.baseDay.legs[index].stdUpperBound) ||
                          dataTypes.daytime.refineView(l.blockTime) !== dataTypes.daytime.refineView(scopeViewState.baseDay.legs[index].blockTime) ||
                          l.originPermission !== scopeViewState.baseDay.legs[index].originPermission ||
                          l.destinationPermission !== scopeViewState.baseDay.legs[index].destinationPermission
                      ))
                      ? '✱'
                      : ''
                  } (${d + 1}) ${Weekday[d].slice(0, 3)}`}
                  disabled={!scopeViewState}
                />
              ))}
            </Tabs>
          );
        }
        function dayGeneralFields() {
          const disabled = preplan.readonly || !scopeViewState || (dayIndex !== 'ALL' && !weekDayViewState!.selected);

          return (
            <Fragment>
              <Grid item xs={2}>
                <AutoComplete
                  label="RSX"
                  options={rsxOptions}
                  getOptionLabel={l => l.name}
                  getOptionValue={v => v.name}
                  value={dayViewState ? rsxOptions.find(o => o.name === dayViewState.rsx) : rsxOptions[0]}
                  onSelect={({ name: rsx }) => dayViewState && updateDay(day => ({ ...day, rsx }))}
                  isDisabled={disabled}
                />
              </Grid>
              <Grid item xs={10}>
                <RefiningTextField
                  fullWidth
                  label="Notes"
                  dataType={dataTypes.label}
                  value={dayViewState?.notes ?? ''}
                  onChange={({ target: { value: notes } }) => dayViewState && updateDay(day => ({ ...day, notes }))}
                  onKeyDown={handleKeyboardEvent}
                  disabled={disabled}
                  error={errors.notes !== undefined}
                  helperText={errors.notes}
                />
              </Grid>
              <Grid item xs={5}>
                <MultiSelect
                  label="Allowed Aircrafts"
                  options={aircraftIdentityOptions}
                  getOptionLabel={l => l.name}
                  getOptionValue={l => l.id}
                  value={dayViewState?.allowedAircraftIdentities ?? []}
                  onSelect={allowedAircraftIdentities =>
                    dayViewState && updateDay(day => ({ ...day, allowedAircraftIdentities: allowedAircraftIdentities ? allowedAircraftIdentities : [] }))
                  }
                  isDisabled={disabled}
                  error={errors.allowedAircrafts !== undefined}
                  helperText={errors.allowedAircrafts}
                ></MultiSelect>
              </Grid>
              <Grid item xs={5}>
                <MultiSelect
                  label="Forbidden Aircrafts"
                  options={aircraftIdentityOptions}
                  getOptionLabel={l => l.name}
                  getOptionValue={l => l.id}
                  value={dayViewState?.forbiddenAircraftIdentities ?? []}
                  onSelect={forbiddenAircraftIdentities =>
                    dayViewState && updateDay(day => ({ ...day, forbiddenAircraftIdentities: forbiddenAircraftIdentities ? forbiddenAircraftIdentities : [] }))
                  }
                  isDisabled={disabled}
                ></MultiSelect>
              </Grid>
              <Grid item xs={2}>
                <RefiningTextField
                  fullWidth
                  label="Register"
                  dataType={dataTypes.preplanAircraftRegister(preplan.aircraftRegisters)}
                  value={dayViewState?.aircraftRegister ?? ''}
                  onChange={({ target: { value: aircraftRegister } }) => {
                    if (!scopeViewState) return;
                    const defaultAircraftRegister = scopeViewState!.weekDays
                      .filter(d => d.selected)
                      .some(
                        d =>
                          dataTypes.preplanAircraftRegister(preplan.aircraftRegisters).refineView(d.aircraftRegister) !==
                          dataTypes.preplanAircraftRegister(preplan.aircraftRegisters).refineView(aircraftRegister)
                      )
                      ? ''
                      : aircraftRegister;
                    updateScope(scope =>
                      dayIndex === 'ALL'
                        ? {
                            ...scope,
                            baseDay: { ...scope.baseDay, aircraftRegister },
                            weekDays: scope.weekDays.map(day => ({ ...day, aircraftRegister }))
                          }
                        : {
                            ...scope,
                            baseDay: { ...scope.baseDay, aircraftRegister: defaultAircraftRegister },
                            weekDays: scope.weekDays.map((day, index) => ({
                              ...day,
                              aircraftRegister: !day.selected ? defaultAircraftRegister : index === dayIndex ? aircraftRegister : day.aircraftRegister
                            }))
                          }
                    );
                  }}
                  onKeyDown={handleKeyboardEvent}
                  disabled={disabled}
                  error={errors.aircraftRegister !== undefined}
                  helperText={errors.aircraftRegister}
                />
              </Grid>
            </Fragment>
          );
        }
        function legTabs() {
          return (
            <div className={classes.flex}>
              <Tabs variant="scrollable" scrollButtons="auto" value={legIndex} onChange={(e, legIndex) => setViewState({ ...viewState, legIndex })}>
                {viewState.route.map((routeLeg, routeLegIndex) => (
                  <Tab
                    classes={{ root: classNames({ [classes.error]: errors.legTabs[routeLegIndex] }) }}
                    key={routeLegIndex}
                    label={
                      <div className={classes.flex}>
                        <div className={classes.grow}>
                          <Typography variant="caption" display="block">
                            {routeLeg.flightNumber || <Fragment>&mdash;</Fragment>}
                          </Typography>
                          {routeLegIndex === 0 && (
                            <Typography variant="button" display="inline">
                              {routeLeg.departureAirport || <Fragment>&mdash;&nbsp;</Fragment>}&nbsp;
                            </Typography>
                          )}
                          <Typography variant="button" display="inline">
                            &rarr;&nbsp;{routeLeg.arrivalAirport || <Fragment>&nbsp;&mdash;</Fragment>}
                          </Typography>
                        </div>
                        {dayIndex === 'ALL' && scopeIndex === 'BASE' && viewState.route.length > 1 && (
                          <Fragment>
                            &nbsp;&nbsp;&nbsp;&nbsp;
                            <IconButton
                              title="Remove leg"
                              disabled={preplan.readonly}
                              onClick={e => {
                                if (viewState.route.length < 2) return;
                                e.stopPropagation(); // To prevent unintended click after remove.
                                updateRoute(
                                  Math.min(routeLegIndex, viewState.route.length - 2),
                                  route => splice(route, routeLegIndex, 1),
                                  legs => splice(legs, routeLegIndex, 1)
                                );
                              }}
                            >
                              <ClearIcon />
                            </IconButton>
                          </Fragment>
                        )}
                      </div>
                    }
                    disabled={!scopeViewState}
                  />
                ))}
              </Tabs>

              {/* Add and return buttons */}
              {dayIndex === 'ALL' && scopeIndex === 'BASE' && (
                <Fragment>
                  <div>
                    <IconButton
                      title="Append a new leg"
                      disabled={preplan.readonly || !scopeViewState || !dataTypes.airport.checkView(viewState.route[viewState.route.length - 1].arrivalAirport)}
                      onClick={() => scopeViewState && appendLeg(viewState.route[viewState.route.length - 1].arrivalAirport, '')}
                    >
                      <AddIcon />
                    </IconButton>
                  </div>
                  <div className={classes.grow} />
                  <div>
                    <IconButton
                      title="Append a returning leg"
                      disabled={
                        preplan.readonly ||
                        !scopeViewState ||
                        viewState.route.some(l => !dataTypes.airport.checkView(l.departureAirport) || !dataTypes.airport.checkView(l.arrivalAirport)) ||
                        dataTypes.airport.refineView(viewState.route[0].departureAirport) === dataTypes.airport.refineView(viewState.route.last()!.arrivalAirport)
                      }
                      onClick={() => {
                        if (!scopeViewState) return;
                        const path: string[] = [viewState.route[0].departureAirport, ...viewState.route.map(l => l.arrivalAirport)].map(a => dataTypes.airport.refineView(a));
                        loop: for (let i = 1; i <= path.length - 1; i++) {
                          for (let j = 0; j < path.length - i; ++j) if (path[j + i] !== path[path.length - j - 1]) continue loop;
                          const departureAirport = path[i];
                          const arrivalAirport = path[i - 1];
                          appendLeg(departureAirport, arrivalAirport);
                          break loop;
                        }
                      }}
                    >
                      <WrapTextIcon />
                    </IconButton>
                  </div>
                </Fragment>
              )}
            </div>
          );

          function appendLeg(departureAirport: string, arrivalAirport: string): void {
            updateRoute(
              viewState.route.length,
              route => [...route, { flightNumber: '', departureAirport, arrivalAirport }],
              legs => [...legs, { blockTime: '', stdLowerBound: '', stdUpperBound: '', originPermission: false, destinationPermission: false }]
            );
          }
        }
        function legFields() {
          const disabled = preplan.readonly || !scopeViewState;
          const routeDisabled = disabled || dayIndex !== 'ALL' || scopeIndex !== 'BASE';
          const legDisabled = disabled || (dayIndex !== 'ALL' && !scopeViewState!.weekDays[dayIndex].selected);

          return (
            <Fragment>
              <Grid item xs={4}>
                <RefiningTextField
                  fullWidth
                  label="Flight Number"
                  dataType={dataTypes.flightNumber}
                  value={routeLegViewState.flightNumber}
                  onChange={({ target: { value: flightNumber } }) => updateRouteLeg(routeLeg => ({ ...routeLeg, flightNumber }))}
                  onKeyDown={handleKeyboardEvent}
                  disabled={routeDisabled}
                  error={errors.flightNumber !== undefined}
                  helperText={errors.flightNumber}
                />
              </Grid>
              <Grid item xs={4}>
                <RefiningTextField
                  fullWidth
                  label="Departure Airport"
                  dataType={dataTypes.airport}
                  value={routeLegViewState.departureAirport}
                  onChange={({ target: { value: departureAirport } }) => updateRouteLeg(routeLeg => ({ ...routeLeg, departureAirport }))}
                  onKeyDown={handleKeyboardEvent}
                  disabled={routeDisabled}
                  error={errors.departureAirport !== undefined}
                  helperText={errors.departureAirport}
                />
              </Grid>
              <Grid item xs={4}>
                <RefiningTextField
                  fullWidth
                  label="Arrival Airport"
                  dataType={dataTypes.airport}
                  value={routeLegViewState.arrivalAirport}
                  onChange={({ target: { value: arrivalAirport } }) => updateRouteLeg(routeLeg => ({ ...routeLeg, arrivalAirport }))}
                  onKeyDown={handleKeyboardEvent}
                  disabled={routeDisabled}
                  error={errors.arrivalAirport !== undefined}
                  helperText={errors.arrivalAirport}
                />
              </Grid>
              <Grid item xs={4}>
                <RefiningTextField
                  fullWidth
                  label="Block Time"
                  dataType={dataTypes.daytime}
                  value={legViewState?.blockTime ?? ''}
                  onChange={({ target: { value: blockTime } }) => updateLeg(leg => ({ ...leg, blockTime }))}
                  onKeyDown={handleKeyboardEvent}
                  disabled={legDisabled}
                  error={errors.blockTime !== undefined}
                  helperText={errors.blockTime}
                />
              </Grid>
              <Grid item xs={4}>
                <RefiningTextField
                  fullWidth
                  label="STD / STD Lower Bound"
                  dataType={dataTypes.daytime}
                  value={legViewState?.stdLowerBound ?? ''}
                  onChange={({ target: { value: stdLowerBound } }) => legViewState && updateLeg(leg => ({ ...leg, stdLowerBound }))}
                  onKeyDown={handleKeyboardEvent}
                  disabled={legDisabled}
                  error={errors.stdLowerBound !== undefined}
                  helperText={errors.stdLowerBound}
                />
              </Grid>
              <Grid item xs={4}>
                <RefiningTextField
                  fullWidth
                  label="STD Upper Bound"
                  dataType={dataTypes.daytime}
                  value={legViewState?.stdUpperBound ?? ''}
                  onChange={({ target: { value: stdUpperBound } }) => legViewState && updateLeg(leg => ({ ...leg, stdUpperBound }))}
                  onKeyDown={handleKeyboardEvent}
                  disabled={legDisabled}
                  error={errors.stdUpperBound !== undefined}
                  helperText={errors.stdUpperBound}
                />
              </Grid>
              <Grid item xs={3}>
                <FormControlLabel
                  label="Origin Permission"
                  control={
                    <Checkbox
                      color="primary"
                      checked={legViewState?.originPermission ?? false}
                      onChange={(e, originPermission) => legViewState && updateLeg(leg => ({ ...leg, originPermission }))}
                    />
                  }
                  disabled={legDisabled}
                />
              </Grid>
              <Grid item xs={3}>
                <FormControlLabel
                  label="Destination Permission"
                  control={
                    <Checkbox
                      color="primary"
                      checked={legViewState?.destinationPermission ?? false}
                      onChange={(e, destinationPermission) => legViewState && updateLeg(leg => ({ ...leg, destinationPermission }))}
                    />
                  }
                  disabled={legDisabled}
                />
              </Grid>
            </Fragment>
          );
        }

        function formatDate(date: Date, lineBreak?: boolean): JSX.Element {
          const dateString = date.format('d');
          const day = dateString[0] === '0' ? dateString.slice(1, 2) : dateString.slice(0, 2);
          const month = dateString.slice(2, 5);
          if (lineBreak)
            return (
              <Fragment>
                {day}
                <br />
                {month}
              </Fragment>
            );
          return (
            <Fragment>
              {day}&nbsp;{month}
            </Fragment>
          );
        }

        function splice<T>(source: readonly T[], index: number, count: number, filler?: T | readonly T[] | ((piece: readonly T[]) => T | T[] | undefined | null)): T[] {
          const filling = filler && (typeof filler === 'function' ? (filler as (piece: readonly T[]) => T | T[] | undefined | null)(source.slice(index, index + count)) : filler);
          if (!filling) return [...source.slice(0, index), ...source.slice(index + count)];
          if (!Array.isArray(filling)) return [...source.slice(0, index), filling as T, ...source.slice(index + count)];
          return [...source.slice(0, index), ...filling, ...source.slice(index + count)];
        }

        function updateScope(update: (scope: BaseScopeViewState) => BaseScopeViewState): void {
          if (scopeIndex === 'BASE') {
            setViewState({
              ...viewState,
              baseScope: update(viewState.baseScope)
            });
          } else if (scopeIndex >= 0) {
            setViewState({
              ...viewState,
              changeScopes: splice(viewState.changeScopes, scopeIndex, 1, ([c]) => ({
                startWeekIndex: c.startWeekIndex,
                endWeekIndex: c.endWeekIndex,
                ...update(c),
                isTemp: false,
                isNew: c.isNew
              }))
            });
          }
        }
        function updateDay(update: (day: BaseDayViewState) => BaseDayViewState): void {
          updateScope(scope =>
            dayIndex === 'ALL'
              ? { ...scope, baseDay: update(scope.baseDay), weekDays: scope.weekDays.map(d => ({ selected: d.selected, ...update(d) })) }
              : { ...scope, weekDays: splice(scope.weekDays, dayIndex, 1, ([d]) => ({ selected: d.selected, ...update(d) })) }
          );
        }
        function updateRoute(
          legIndex: number,
          updateRoute: (route: readonly RouteLegViewState[]) => RouteLegViewState[],
          updateLegs: (legs: readonly LegViewState[]) => LegViewState[]
        ): void {
          setViewState({
            ...viewState,
            legIndex,
            route: updateRoute(viewState.route),
            baseScope: {
              ...viewState.baseScope,
              baseDay: {
                ...viewState.baseScope.baseDay,
                legs: updateLegs(viewState.baseScope.baseDay.legs)
              },
              weekDays: viewState.baseScope.weekDays.map(d => ({
                ...d,
                legs: updateLegs(d.legs)
              }))
            },
            changeScopes: viewState.changeScopes.map(c => ({
              ...c,
              baseDay: {
                ...c.baseDay,
                legs: updateLegs(c.baseDay.legs)
              },
              weekDays: c.weekDays.map(d => ({
                ...d,
                legs: updateLegs(d.legs)
              }))
            }))
          });
        }
        function updateRouteLeg(update: (routeLeg: RouteLegViewState) => RouteLegViewState): void {
          setViewState({
            ...viewState,
            route: splice(viewState.route, legIndex, 1, ([l]) => update(l))
          });
        }
        function updateLeg(update: (leg: LegViewState) => LegViewState): void {
          updateDay(day => ({ ...day, legs: splice(day.legs, legIndex, 1, ([l]) => update(l)) }));
        }
      }}
    />
  );

  function makeCategoryOptions(): readonly GeneralOptionViewState[] {
    return [
      { name: ' ' /* &nbsp; */ },
      ...preplan.flightRequirements
        .map(f => f.category)
        .filter(Boolean)
        .reverse()
        .distinct((a, b) => a.toUpperCase() === b.toUpperCase())
        .sortBy(c => c.toUpperCase())
        .map(c => ({ name: c }))
    ];
  }
  function makeRsxOptions(): readonly RsxOptionViewState[] {
    return Rsxes.map(r => ({ name: r }));
  }
  function makeAircraftIdentityOptions(): readonly AircraftIdentityOptionViewState[] {
    return [
      ...preplan.aircraftRegisters.items.map((a, index) => ({
        id: 'register ' + index,
        name: a.name,
        type: 'REGISTER' as AircraftIdentityType,
        entityId: a.id
      })),
      ...MasterData.all.aircraftTypes.items.flatMap((a, index) => [
        {
          id: 'type ' + index,
          name: a.name,
          type: 'TYPE' as AircraftIdentityType,
          entityId: a.id
        },
        {
          id: 'type dummy ' + index,
          name: a.name + '_DUMMY',
          type: 'TYPE_DUMMY' as AircraftIdentityType,
          entityId: a.id
        },
        {
          id: 'type existing ' + index,
          name: a.name + '_EXISTING',
          type: 'TYPE_EXISTING' as AircraftIdentityType,
          entityId: a.id
        }
      ]),
      ...MasterData.all.aircraftRegisterGroups.items.map((g, index) => ({
        id: 'group ' + index,
        name: g.name,
        type: 'GROUP' as AircraftIdentityType,
        entityId: g.id
      }))
    ];
  }
  function makeInitialViewState(): ViewState {
    const { flightRequirement, day, date } = state;

    if (!flightRequirement)
      return {
        bypassValidation: true,
        label: '',
        addingNewCategory: false,
        category: '',
        categoryOption: undefined,
        stc: MasterData.all.stcs.items.find(s => s.name === 'J')!,
        scopeIndex: 'BASE',
        dayIndex: 'ALL',
        legIndex: 0,
        sliderStartIndex: 0,
        sliderEndIndex: 0,
        route: [
          {
            flightNumber: '',
            departureAirport: '',
            arrivalAirport: ''
          }
        ],
        baseScope: {
          baseDay: {
            rsx: 'REAL',
            notes: '',
            allowedAircraftIdentities: [],
            forbiddenAircraftIdentities: [],
            aircraftRegister: '',
            legs: [
              {
                blockTime: '',
                stdLowerBound: '',
                stdUpperBound: '',
                originPermission: false,
                destinationPermission: false
              }
            ]
          },
          weekDays: Weekdays.map<WeekDayViewState>(d => ({
            selected: false,
            rsx: 'REAL',
            notes: '',
            allowedAircraftIdentities: [],
            forbiddenAircraftIdentities: [],
            aircraftRegister: '',
            legs: [
              {
                blockTime: '',
                stdLowerBound: '',
                stdUpperBound: '',
                originPermission: false,
                destinationPermission: false
              }
            ]
          }))
        },
        changeScopes: []
      };

    const baseDefaultAircraftRegisters = extractDefaultAircraftRegisters();
    const scopeIndex = (date && flightRequirement.changes.findIndex(c => c.startDate <= date && date.getDatePart() <= c.endDate)) ?? 'BASE';
    const changeScopes = flightRequirement.changes.map<ChangeScopeViewState>(c => {
      const changeDefaultAircraftRegisters = extractDefaultAircraftRegisters(c);

      return {
        startWeekIndex: preplan.weeks.all.findIndex(({ startDate, endDate }) => startDate <= c.startDate && c.startDate <= endDate),
        endWeekIndex: preplan.weeks.all.findIndex(({ startDate, endDate }) => startDate <= c.endDate && c.endDate <= endDate),
        isTemp: false,
        isNew: false,
        baseDay: {
          rsx: c.rsx,
          notes: dataTypes.label.convertBusinessToView(c.notes),
          allowedAircraftIdentities: c.aircraftSelection.includedIdentities.map(i => aircraftIdentityOptions.find(o => o.type === i.type && o.entityId === i.entity.id)!),
          forbiddenAircraftIdentities: c.aircraftSelection.excludedIdentities.map(i => aircraftIdentityOptions.find(o => o.type === i.type && o.entityId === i.entity.id)!),
          aircraftRegister: changeDefaultAircraftRegisters.all,
          legs: c.route.map<LegViewState>(l => ({
            blockTime: dataTypes.daytime.convertBusinessToView(l.blockTime),
            stdLowerBound: dataTypes.daytime.convertBusinessToView(l.stdLowerBound),
            stdUpperBound: dataTypes.daytime.convertBusinessToViewOptional(l.stdUpperBound),
            originPermission: l.originPermission,
            destinationPermission: l.destinationPermission
          }))
        },
        weekDays: Weekdays.map<WeekDayViewState>(d => {
          const sourceDayFlightRequirementChange = c.days.find(x => x.day === d);

          return {
            selected: !!sourceDayFlightRequirementChange,
            rsx: sourceDayFlightRequirementChange ? sourceDayFlightRequirementChange.rsx : c.rsx,
            notes: dataTypes.label.convertBusinessToView(sourceDayFlightRequirementChange ? sourceDayFlightRequirementChange.notes : c.notes),
            allowedAircraftIdentities: (sourceDayFlightRequirementChange ? sourceDayFlightRequirementChange.aircraftSelection : c.aircraftSelection).includedIdentities.map(
              i => aircraftIdentityOptions.find(o => o.type === i.type && o.entityId === i.entity.id)!
            ),
            forbiddenAircraftIdentities: (sourceDayFlightRequirementChange ? sourceDayFlightRequirementChange.aircraftSelection : c.aircraftSelection).excludedIdentities.map(
              i => aircraftIdentityOptions.find(o => o.type === i.type && o.entityId === i.entity.id)!
            ),
            aircraftRegister: changeDefaultAircraftRegisters[d],
            legs: sourceDayFlightRequirementChange
              ? sourceDayFlightRequirementChange.route.map<LegViewState>(l => ({
                  blockTime: dataTypes.daytime.convertBusinessToView(l.blockTime),
                  stdLowerBound: dataTypes.daytime.convertBusinessToView(l.stdLowerBound),
                  stdUpperBound: dataTypes.daytime.convertBusinessToViewOptional(l.stdUpperBound),
                  originPermission: l.originPermission,
                  destinationPermission: l.destinationPermission
                }))
              : c.route.map<LegViewState>(l => ({
                  blockTime: dataTypes.daytime.convertBusinessToView(l.blockTime),
                  stdLowerBound: dataTypes.daytime.convertBusinessToView(l.stdLowerBound),
                  stdUpperBound: dataTypes.daytime.convertBusinessToViewOptional(l.stdUpperBound),
                  originPermission: l.originPermission,
                  destinationPermission: l.destinationPermission
                }))
          };
        })
      };
    });

    return refineViewState(
      {
        bypassValidation: false,
        label: dataTypes.label.convertBusinessToView(flightRequirement.label),
        addingNewCategory: false,
        category: dataTypes.name.convertBusinessToView(flightRequirement.category),
        categoryOption: categoryOptions.slice(1).find(o => o.name.toUpperCase() === dataTypes.name.convertBusinessToView(flightRequirement.category).toUpperCase()) || undefined,
        stc: flightRequirement.stc,
        scopeIndex,
        dayIndex: day ?? date?.getWeekday() ?? 'ALL',
        legIndex: 0,
        sliderStartIndex: scopeIndex === 'BASE' ? 0 : changeScopes[scopeIndex].startWeekIndex,
        sliderEndIndex: scopeIndex === 'BASE' ? 0 : changeScopes[scopeIndex].endWeekIndex + 1,
        route: flightRequirement.route.map<RouteLegViewState>((l, index) => ({
          originalIndex: index,
          flightNumber: dataTypes.flightNumber.convertBusinessToView(l.flightNumber),
          departureAirport: dataTypes.airport.convertBusinessToView(l.departureAirport),
          arrivalAirport: dataTypes.airport.convertBusinessToView(l.arrivalAirport)
        })),
        baseScope: {
          baseDay: {
            rsx: flightRequirement.rsx,
            notes: dataTypes.label.convertBusinessToView(flightRequirement.notes),
            allowedAircraftIdentities: flightRequirement.aircraftSelection.includedIdentities.map(
              i => aircraftIdentityOptions.find(o => o.type === i.type && o.entityId === i.entity.id)!
            ),
            forbiddenAircraftIdentities: flightRequirement.aircraftSelection.excludedIdentities.map(
              i => aircraftIdentityOptions.find(o => o.type === i.type && o.entityId === i.entity.id)!
            ),
            aircraftRegister: baseDefaultAircraftRegisters.all,
            legs: flightRequirement.route.map<LegViewState>(l => ({
              blockTime: dataTypes.daytime.convertBusinessToView(l.blockTime),
              stdLowerBound: dataTypes.daytime.convertBusinessToView(l.stdLowerBound),
              stdUpperBound: dataTypes.daytime.convertBusinessToViewOptional(l.stdUpperBound),
              originPermission: l.originPermission,
              destinationPermission: l.destinationPermission
            }))
          },
          weekDays: Weekdays.map<WeekDayViewState>(d => {
            const sourceDayFlightRequirement = flightRequirement.days.find(x => x.day === d);

            return {
              selected: !!sourceDayFlightRequirement,
              rsx: sourceDayFlightRequirement ? sourceDayFlightRequirement.rsx : flightRequirement.rsx,
              notes: dataTypes.label.convertBusinessToView(sourceDayFlightRequirement ? sourceDayFlightRequirement.notes : flightRequirement.notes),
              allowedAircraftIdentities: (sourceDayFlightRequirement ? sourceDayFlightRequirement.aircraftSelection : flightRequirement.aircraftSelection).includedIdentities.map(
                i => aircraftIdentityOptions.find(o => o.type === i.type && o.entityId === i.entity.id)!
              ),
              forbiddenAircraftIdentities: (sourceDayFlightRequirement ? sourceDayFlightRequirement.aircraftSelection : flightRequirement.aircraftSelection).excludedIdentities.map(
                i => aircraftIdentityOptions.find(o => o.type === i.type && o.entityId === i.entity.id)!
              ),
              aircraftRegister: baseDefaultAircraftRegisters[d],
              legs: sourceDayFlightRequirement
                ? sourceDayFlightRequirement.route.map<LegViewState>(l => ({
                    blockTime: dataTypes.daytime.convertBusinessToView(l.blockTime),
                    stdLowerBound: dataTypes.daytime.convertBusinessToView(l.stdLowerBound),
                    stdUpperBound: dataTypes.daytime.convertBusinessToViewOptional(l.stdUpperBound),
                    originPermission: l.originPermission,
                    destinationPermission: l.destinationPermission
                  }))
                : flightRequirement.route.map<LegViewState>(l => ({
                    blockTime: dataTypes.daytime.convertBusinessToView(l.blockTime),
                    stdLowerBound: dataTypes.daytime.convertBusinessToView(l.stdLowerBound),
                    stdUpperBound: dataTypes.daytime.convertBusinessToViewOptional(l.stdUpperBound),
                    originPermission: l.originPermission,
                    destinationPermission: l.destinationPermission
                  }))
            };
          })
        },
        changeScopes
      },
      true
    );

    function extractDefaultAircraftRegisters(filter?: { startDate: Date; endDate: Date }): { all: string; [day: number]: string } {
      const filteredFlights = !filter ? flights : flights.filter(f => filter.startDate <= f.date && f.date <= filter.endDate);
      const flightsByDay = filteredFlights.groupBy('day');
      const result: string[] = [];

      Weekdays.forEach(d => {
        if (!(d in flightsByDay)) return (result[d] = '');

        const aircraftRegisters = flightsByDay[d].map(({ aircraftRegister }) => aircraftRegister).distinct();
        result[d] =
          aircraftRegisters.length === 1 && aircraftRegisters[0]
            ? dataTypes.preplanAircraftRegister(preplan.aircraftRegisters).convertBusinessToViewOptional(aircraftRegisters[0])
            : '';
      });

      const allAircraftRegisters = result.distinct();
      const all = allAircraftRegisters.length === 1 ? allAircraftRegisters[0] : '';

      return { all, ...result };
    }
  }
  function makeValidationErrors() {
    const routeLegValidation = validation.$.routeLegValidations[legIndex];
    const scopeValidation = scopeIndex === 'BASE' ? validation.$.baseScopeValidation : scopeIndex === -1 ? undefined : validation.$.changeScopeValidations[scopeIndex];
    const dayValidation = dayIndex === 'ALL' ? scopeValidation?.$.baseDayValidation : scopeValidation?.$.weekDayValidations[dayIndex];
    const legValidation = dayValidation?.$.legValidations[legIndex];

    return {
      label: bypassValidation ? undefined : validation.message('LABEL_*'),
      category: bypassValidation ? undefined : validation.message('CATEGORY_*'),
      baseScope: bypassValidation ? false : !validation.$.baseScopeValidation.ok,
      changeScopes: (validation.$.changeScopeValidations ?? []).map(v => (bypassValidation ? false : !v.ok)),
      allDays: bypassValidation ? false : !(scopeValidation?.$.baseDayValidation.ok ?? true) || !validation.$.routeLegValidations.every(v => v.ok),
      dayTabs: scopeValidation ? (scopeValidation.$.weekDayValidations ?? []).map(v => (bypassValidation ? false : !v.ok)) : Weekdays.map(() => false),
      notes: bypassValidation || !dayValidation ? undefined : dayValidation.message('NOTES_*'),
      allowedAircrafts: bypassValidation || !dayValidation ? undefined : dayValidation.message('ALLOWED_AIRCRAFT_IDENTITIES_*'),
      aircraftRegister: bypassValidation || !dayValidation ? undefined : dayValidation.message('AIRCRAFT_REGISTER_*'),
      legTabs: dayValidation
        ? (dayValidation.$.legValidations ?? []).map((v, index) => (bypassValidation ? false : !v.ok || !validation.$.routeLegValidations[index].ok))
        : (validation.$.routeLegValidations ?? []).map(v => (bypassValidation ? false : !v.ok)),
      flightNumber: bypassValidation ? undefined : routeLegValidation.message('FLIGHT_NUMBER_*'),
      departureAirport: bypassValidation ? undefined : routeLegValidation.message('DEPARTURE_AIRPORT_*'),
      arrivalAirport: bypassValidation ? undefined : routeLegValidation.message('ARRIVAL_AIRPORT_*'),
      stdLowerBound: bypassValidation || !legValidation ? undefined : legValidation.message('STD_LOWER_BOUND_*'),
      stdUpperBound: bypassValidation || !legValidation ? undefined : legValidation.message('STD_UPPER_BOUND_*'),
      blockTime: bypassValidation || !legValidation ? undefined : legValidation.message('BLOCKTIME_*')
    };
  }

  async function submit(): Promise<void> {
    viewState.bypassValidation && setViewState({ ...viewState, bypassValidation: false });

    if (!validation.ok) throw 'Invalid form fields.';

    const refinedViewState = refineViewState(viewState);

    const newFlightRequirementModel: NewFlightRequirementModel = {
      label: dataTypes.label.convertViewToModel(refinedViewState.label),
      category: dataTypes.name.convertViewToModel(refinedViewState.category),
      stcId: dataTypes.stc.convertBusinessToModel(refinedViewState.stc),
      aircraftSelection: {
        includedIdentities: refinedViewState.baseScope.baseDay.allowedAircraftIdentities.map<AircraftIdentityModel>(i => ({
          type: i.type,
          entityId: i.entityId
        })),
        excludedIdentities: refinedViewState.baseScope.baseDay.forbiddenAircraftIdentities.map<AircraftIdentityModel>(i => ({
          type: i.type,
          entityId: i.entityId
        }))
      },
      rsx: refinedViewState.baseScope.baseDay.rsx,
      notes: dataTypes.label.convertViewToModel(refinedViewState.baseScope.baseDay.notes),
      ignored: state.flightRequirement ? state.flightRequirement.ignored : false,
      route: refinedViewState.baseScope.baseDay.legs.map<FlightRequirementLegModel>((l, index) => ({
        flightNumber: dataTypes.flightNumber.convertViewToModel(refinedViewState.route[index].flightNumber),
        departureAirportId: dataTypes.airport.convertViewToModel(refinedViewState.route[index].departureAirport),
        arrivalAirportId: dataTypes.airport.convertViewToModel(refinedViewState.route[index].arrivalAirport),
        blockTime: dataTypes.daytime.convertViewToModel(l.blockTime),
        stdLowerBound: dataTypes.daytime.convertViewToModel(l.stdLowerBound),
        stdUpperBound: dataTypes.daytime.convertViewToModelOptional(l.stdUpperBound),
        originPermission: l.originPermission,
        destinationPermission: l.destinationPermission
      })),
      days: refinedViewState.baseScope.weekDays
        .map<{ selected: boolean; model: DayFlightRequirementModel }>((d, index) => ({
          selected: d.selected,
          model: {
            aircraftSelection: {
              includedIdentities: d.allowedAircraftIdentities.map(i => ({
                type: i.type,
                entityId: i.entityId
              })),
              excludedIdentities: d.forbiddenAircraftIdentities.map(i => ({
                type: i.type,
                entityId: i.entityId
              }))
            },
            rsx: d.rsx,
            day: index,
            notes: dataTypes.label.convertViewToModel(d.notes),
            route: d.legs.map<DayFlightRequirementLegModel>(l => ({
              blockTime: dataTypes.daytime.convertViewToModel(l.blockTime),
              stdLowerBound: dataTypes.daytime.convertViewToModel(l.stdLowerBound),
              stdUpperBound: dataTypes.daytime.convertViewToModelOptional(l.stdUpperBound),
              originPermission: l.originPermission,
              destinationPermission: l.destinationPermission
            }))
          }
        }))
        .filter(x => x.selected)
        .map(x => x.model),
      changes: refinedViewState.changeScopes.map<FlightRequirementChangeModel>(c => {
        const startDate = dataTypes.utcDate.convertBusinessToModel(preplan.weeks.all[c.startWeekIndex].startDate);
        const endDate = dataTypes.utcDate.convertBusinessToModel(preplan.weeks.all[c.endWeekIndex].endDate);
        const preplanStartDate = dataTypes.utcDate.convertBusinessToModel(preplan.startDate);
        const preplanEndDate = dataTypes.utcDate.convertBusinessToModel(preplan.endDate);
        return {
          startDate: preplanStartDate > startDate ? preplanStartDate : startDate,
          endDate: preplanEndDate < endDate ? preplanEndDate : endDate,
          aircraftSelection: {
            includedIdentities: c.baseDay.allowedAircraftIdentities.map<AircraftIdentityModel>(i => ({
              type: i.type,
              entityId: i.entityId
            })),
            excludedIdentities: c.baseDay.forbiddenAircraftIdentities.map<AircraftIdentityModel>(i => ({
              type: i.type,
              entityId: i.entityId
            }))
          },
          rsx: c.baseDay.rsx,
          notes: dataTypes.label.convertViewToModel(c.baseDay.notes),
          route: c.baseDay.legs.map<FlightRequirementLegChangeModel>((l, index) => ({
            flightNumber: dataTypes.flightNumber.convertViewToModel(refinedViewState.route[index].flightNumber),
            departureAirportId: dataTypes.airport.convertViewToModel(refinedViewState.route[index].departureAirport),
            arrivalAirportId: dataTypes.airport.convertViewToModel(refinedViewState.route[index].arrivalAirport),
            blockTime: dataTypes.daytime.convertViewToModel(l.blockTime),
            stdLowerBound: dataTypes.daytime.convertViewToModel(l.stdLowerBound),
            stdUpperBound: dataTypes.daytime.convertViewToModelOptional(l.stdUpperBound),
            originPermission: l.originPermission,
            destinationPermission: l.destinationPermission
          })),
          days: c.weekDays
            .map<{ selected: boolean; model: DayFlightRequirementChangeModel }>((d, index) => ({
              selected: d.selected,
              model: {
                aircraftSelection: {
                  includedIdentities: d.allowedAircraftIdentities.map(i => ({
                    type: i.type,
                    entityId: i.entityId
                  })),
                  excludedIdentities: d.forbiddenAircraftIdentities.map(i => ({
                    type: i.type,
                    entityId: i.entityId
                  }))
                },
                rsx: d.rsx,
                day: index,
                notes: dataTypes.label.convertViewToModel(d.notes),
                route: d.legs.map<DayFlightRequirementLegChangeModel>(l => ({
                  blockTime: dataTypes.daytime.convertViewToModel(l.blockTime),
                  stdLowerBound: dataTypes.daytime.convertViewToModel(l.stdLowerBound),
                  stdUpperBound: dataTypes.daytime.convertViewToModelOptional(l.stdUpperBound),
                  originPermission: l.originPermission,
                  destinationPermission: l.destinationPermission
                }))
              }
            }))
            .filter(x => x.selected)
            .map(x => x.model)
        };
      })
    };

    const flightsByWeekIndexAndDay = flights.groupBy(
      f => String(preplan.weeks.all.findIndex(({ startDate, endDate }) => startDate <= f.date && f.date <= endDate)),
      g => g.groupBy('day', h => h[0])
    );

    const flightModels = preplan.weeks.all
      .flatMap((week, weekIndex) => {
        const weekDays = refinedViewState.changeScopes.find(c => c.startWeekIndex <= weekIndex && weekIndex <= c.endWeekIndex)?.weekDays ?? refinedViewState.baseScope.weekDays;
        const weekFlightsByDay = flightsByWeekIndexAndDay[weekIndex];
        return weekDays
          .map<EditFlightModel>((weekDay, day) => {
            if (!weekDay.selected) return undefined as any;
            const aircraftRegisterId = dataTypes.preplanAircraftRegister(preplan.aircraftRegisters).convertViewToModelOptional(weekDay.aircraftRegister);
            const legs = weekDay.legs.map(({ stdLowerBound, stdUpperBound }, index) => ({
              originalIndex: refinedViewState.route[index].originalIndex,
              std: dataTypes.daytime.convertViewToModel(stdLowerBound)
            }));
            const oldFlight: Flight | undefined = weekFlightsByDay?.[day];
            return oldFlight
              ? oldFlight.extractModel(flightModel => ({
                  ...flightModel,
                  aircraftRegisterId: aircraftRegisterId ?? flightModel.aircraftRegisterId,
                  legs: legs.map<FlightLegModel>(({ originalIndex, std }, index) =>
                    originalIndex === undefined
                      ? {
                          ...flightModel.legs[index],
                          std
                        }
                      : {
                          std
                        }
                  )
                }))
              : {
                  date: dataTypes.utcDate.convertBusinessToModel(week.startDate.clone().addDays(day)),
                  aircraftRegisterId,
                  legs: legs.map<FlightLegModel>(({ std }) => ({
                    std
                  }))
                };
          })
          .filter(Boolean);
      })
      .filter(fm => fm.date >= dataTypes.utcDate.convertBusinessToModel(preplan.startDate) && fm.date <= dataTypes.utcDate.convertBusinessToModel(preplan.endDate));

    const newPreplanModel = state.flightRequirement
      ? await FlightRequirementService.edit(preplan.id, { id: state.flightRequirement.id, ...newFlightRequirementModel }, flightModels)
      : await FlightRequirementService.add(preplan.id, newFlightRequirementModel, flightModels);
    await reloadPreplan(newPreplanModel);
    return others.onClose();
  }

  function refineViewState(viewState: ViewState, forced?: boolean): ViewState {
    // For viewState.changeScopes:
    //   Merge with viewState.baseScope or each other as much as you can, EXCEPT FOR THE SELECTED ONE IF SPECIFIED.
    //   If specified, for the changeScopes[selectedChangeScopeIndex], cut or remove all overlapping changes.

    let selectedChangeScope = viewState.scopeIndex === 'BASE' || viewState.scopeIndex < 0 ? undefined : viewState.changeScopes[viewState.scopeIndex];

    if (selectedChangeScope && selectedChangeScope.isTemp) return viewState;

    const newScope = viewState.changeScopes.find(c => c.isNew && !c.isTemp);
    if (newScope) {
      const inside = viewState.changeScopes.find(
        c =>
          !c.isNew &&
          newScope.startWeekIndex >= c.startWeekIndex &&
          newScope.startWeekIndex <= c.endWeekIndex &&
          newScope.endWeekIndex >= c.startWeekIndex &&
          newScope.endWeekIndex <= c.endWeekIndex
      );
      if (inside) {
        const secondPart = { ...inside };

        inside.endWeekIndex = newScope.startWeekIndex - 1;

        secondPart.startWeekIndex = newScope.endWeekIndex + 1;
        viewState.changeScopes.push(secondPart);
      }

      const endInside = viewState.changeScopes.find(
        c => !c.isNew && newScope.startWeekIndex <= c.startWeekIndex && newScope.endWeekIndex >= c.startWeekIndex && newScope.endWeekIndex <= c.endWeekIndex
      );
      if (endInside) {
        endInside.startWeekIndex = newScope.endWeekIndex + 1;
      }

      const startInside = viewState.changeScopes.find(
        c => !c.isNew && newScope.endWeekIndex >= c.endWeekIndex && newScope.startWeekIndex >= c.startWeekIndex && newScope.startWeekIndex <= c.endWeekIndex
      );
      if (startInside) {
        startInside.endWeekIndex = newScope.startWeekIndex - 1;
      }
      newScope.isNew = false;
    }

    viewState.changeScopes
      .filter(c => c.startWeekIndex > c.endWeekIndex)
      .forEach(c => {
        viewState.changeScopes.remove(c);
        if (c !== selectedChangeScope) return;
        selectedChangeScope = undefined;
        viewState.scopeIndex = -1;
      });

    if (selectedChangeScope) {
      viewState.changeScopes
        .filter(c => c !== selectedChangeScope && c.startWeekIndex >= selectedChangeScope!.startWeekIndex && c.endWeekIndex <= selectedChangeScope!.endWeekIndex)
        .forEach(c => viewState.changeScopes.remove(c));

      viewState.changeScopes
        .filter(c => c !== selectedChangeScope && c.startWeekIndex < selectedChangeScope!.startWeekIndex && c.endWeekIndex >= selectedChangeScope!.startWeekIndex)
        .forEach(c => (c.endWeekIndex = selectedChangeScope!.startWeekIndex - 1));

      viewState.changeScopes
        .filter(c => c !== selectedChangeScope && c.startWeekIndex <= selectedChangeScope!.endWeekIndex && c.endWeekIndex > selectedChangeScope!.endWeekIndex)
        .forEach(c => (c.startWeekIndex = selectedChangeScope!.endWeekIndex + 1));
    }

    viewState.changeScopes
      .sortBy('startWeekIndex')
      .filter(c => (c !== selectedChangeScope || forced) && scopeEquals(c, viewState.baseScope))
      .forEach(c => viewState.changeScopes.remove(c));

    for (let index = 0; index < viewState.changeScopes.length - 1; ++index) {
      const a = viewState.changeScopes[index];
      const b = viewState.changeScopes[index + 1];
      if (a.endWeekIndex !== b.startWeekIndex - 1) continue;
      if (!scopeEquals(a, b)) continue;
      if ((a === selectedChangeScope || b === selectedChangeScope) && !forced) continue;
      a.endWeekIndex = b.endWeekIndex;
      selectedChangeScope = b === selectedChangeScope ? a : selectedChangeScope;
      viewState.changeScopes.remove(b);
      index--;
    }

    viewState.scopeIndex =
      viewState.scopeIndex === 'BASE'
        ? 'BASE'
        : selectedChangeScope
        ? viewState.changeScopes.indexOf(selectedChangeScope)
        : viewState.scopeIndex < viewState.changeScopes.length
        ? viewState.scopeIndex
        : -1;

    viewState.sliderStartIndex = selectedChangeScope ? selectedChangeScope.startWeekIndex : 0;
    viewState.sliderEndIndex = selectedChangeScope ? selectedChangeScope.endWeekIndex + 1 : 0;

    return viewState;

    function scopeEquals(a: BaseScopeViewState, b: BaseScopeViewState): boolean {
      if (a.weekDays.some((weekDay, index) => weekDay.selected !== b.weekDays[index].selected)) return false;
      const aDays = [a.baseDay, ...a.weekDays];
      const bDays = [b.baseDay, ...b.weekDays];

      return !aDays.some((aDay, index) => {
        const bDay = bDays[index];

        return (
          aDay.aircraftRegister !== bDay.aircraftRegister ||
          aDay.allowedAircraftIdentities.some(i => !bDay.allowedAircraftIdentities.includes(i)) ||
          bDay.allowedAircraftIdentities.some(i => !aDay.allowedAircraftIdentities.includes(i)) ||
          aDay.forbiddenAircraftIdentities.some(i => !bDay.forbiddenAircraftIdentities.includes(i)) ||
          bDay.forbiddenAircraftIdentities.some(i => !aDay.forbiddenAircraftIdentities.includes(i)) ||
          aDay.rsx !== bDay.rsx ||
          aDay.notes !== bDay.notes ||
          aDay.legs.some((aLeg, index) => {
            const bLeg = bDay.legs[index];

            return (
              aLeg.stdLowerBound !== bLeg.stdLowerBound ||
              aLeg.stdUpperBound !== bLeg.stdUpperBound ||
              aLeg.blockTime !== bLeg.blockTime ||
              aLeg.originPermission !== bLeg.originPermission ||
              aLeg.destinationPermission !== bLeg.destinationPermission
            );
          })
        );
      });
    }
  }
});

export default FlightRequirementModal;

export function useFlightRequirementModalState() {
  return useModalState<FlightRequirementModalState>();
}
