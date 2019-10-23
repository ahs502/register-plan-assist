import React, { FC, useState, Fragment } from 'react';
import {
  Theme,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  Typography,
  Grid,
  IconButton,
  Switch,
  FormControlLabel,
  Checkbox,
  InputLabel,
  Fab,
  CircularProgress
} from '@material-ui/core';
import { Clear as ClearIcon, Add as AddIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';
import DaysPicker from 'src/components/DaysPicker';
import Weekday from '@core/types/Weekday';
import MasterData, { Stc } from '@core/master-data';
import AutoComplete from 'src/components/AutoComplete';
import Rsx, { Rsxes } from '@core/types/Rsx';
import AircraftIdentityType from '@core/types/AircraftIdentityType';
import FlightRequirement from 'src/business/flight-requirement/FlightRequirement';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    position: 'relative'
  },
  timesFieldSet: {
    borderColor: theme.palette.grey[50],
    borderRadius: 6
  },
  times: {
    overflow: 'auto',
    maxHeight: 168
  },
  gridStyle: {
    matgin: theme.spacing(0, 0, 2, 0)
  },
  captionTextColor: {
    color: theme.palette.grey[500]
  },
  fab: {
    margin: theme.spacing(1),
    position: 'absolute',
    left: 496,
    top: 283
  },
  progress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12
  },
  disable: {
    opacity: 0.5
  }
}));

//type modeType = 'add' | 'edit' | 'readOnly' | 'return';

// const titleMessage = {
//   add: 'What is the new flight requierment?',
//   edit: 'Edit flight requierment',
//   readOnly: 'Flight requierment',
//   return: 'What is the return flight requierment?'
// };

const rsxes = Rsxes.map(r => {
  return { name: r };
});

export type FlightRequirementModalMode = 'ADD' | 'EDIT' | 'READ_ONLY' | 'RETURN' | 'REMOVE';

export interface FlightRequirementModalAircraftIdentity {
  id: string;
  entityId: string;
  name: string;
  type: AircraftIdentityType;
}

export interface FlightRequirementModalModel {
  open: boolean;
  loading: boolean;
  errorMessage?: string;
  flightRequirement?: FlightRequirement;
  weekly?: boolean;
  day?: number;
  days?: boolean[];
  unavailableDays?: boolean[];
  label?: string;
  flightNumber?: string;
  departureAirport?: string;
  arrivalAirport?: string;
  blockTime?: string;
  times?: { stdLowerBound: string; stdUpperBound: string }[];
  allowedAircraftIdentities?: FlightRequirementModalAircraftIdentity[];
  forbiddenAircraftIdentities?: FlightRequirementModalAircraftIdentity[];
  originPermission?: boolean;
  destinationPermission?: boolean;
  notes?: string;
  required?: boolean;
  rsx?: Rsx;
  stc?: Stc;
  category?: string;
  mode?: FlightRequirementModalMode;
  actionTitle?: string;
  disable?: boolean;
}

// Component props type:
export interface FlightRequirementEditorProps {
  model: FlightRequirementModalModel;
  selectedDay?: Weekday;
}

// Component body:
const FlightRequirementEditor: FC<FlightRequirementEditorProps> = ({ model, selectedDay }) => {
  if (model.mode === 'ADD') {
    model = {} as FlightRequirementModalModel;
    model.flightRequirement = {} as FlightRequirement;
  }

  const stc = MasterData.all.stcs.items;
  const airports = MasterData.all.airports.items;

  model.times = model.times || [];
  if (model.times.length === 0) model.times.push({} as { stdLowerBound: string; stdUpperBound: string });

  const [flightRequirementModalModel, setFlightRequirementModalModel] = useState<FlightRequirementModalModel>(model!);

  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Fab
        size="small"
        aria-label="add"
        className={classes.fab}
        onClick={() => {
          // var temp = { ...flightRequirement };
          // temp.times = temp.times && [...temp.times];
          // temp.times && temp.times.push({} as FlightTime);
          // setFlightRequirement(temp);
          flightRequirementModalModel.times!.push({} as { stdLowerBound: string; stdUpperBound: string });
          setFlightRequirementModalModel({ ...flightRequirementModalModel });
        }}
      >
        <AddIcon />
      </Fab>

      <div>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <Typography variant="caption" className={classes.captionTextColor}>
                  Flight Information
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <TextField fullWidth label="Label" value={model.label} onChange={l => setFlightRequirementModalModel({ ...flightRequirementModalModel, label: l.target.value })} />
              </Grid>
              <Grid item xs={4}>
                {/* <InputLabel htmlFor="rsx">RSX</InputLabel> */}
                <AutoComplete
                  label="RSX"
                  options={rsxes}
                  getOptionLabel={l => l.name}
                  getOptionValue={v => v.name}
                  value={{ name: flightRequirementModalModel.rsx! }}
                  onSelect={s => setFlightRequirementModalModel({ ...flightRequirementModalModel, rsx: s.name })}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Category"
                  value={model.category}
                  onChange={l => setFlightRequirementModalModel({ ...flightRequirementModalModel, category: l.target.value })}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Departure"
                  value={flightRequirementModalModel.departureAirport}
                  onChange={a => setFlightRequirementModalModel({ ...flightRequirementModalModel, departureAirport: a.target.value })}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Arrival"
                  value={flightRequirementModalModel.arrivalAirport}
                  onChange={a => setFlightRequirementModalModel({ ...flightRequirementModalModel, arrivalAirport: a.target.value })}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Flight Number"
                  value={model.flightNumber}
                  onChange={l => setFlightRequirementModalModel({ ...flightRequirementModalModel, flightNumber: l.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="BlockTime"
                  value={model.blockTime}
                  onChange={l => setFlightRequirementModalModel({ ...flightRequirementModalModel, blockTime: l.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <AutoComplete
                  options={stc}
                  label="Stc"
                  getOptionLabel={l => l.name}
                  getOptionValue={l => l.id}
                  value={flightRequirementModalModel.stc}
                  onSelect={s => {
                    setFlightRequirementModalModel({ ...flightRequirementModalModel, stc: s });
                  }}
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <div>
              <fieldset className={classes.timesFieldSet}>
                <legend>Time(s):</legend>
                <Grid container spacing={1} className={classes.times}>
                  {flightRequirementModalModel &&
                    flightRequirementModalModel.times &&
                    flightRequirementModalModel.times.map((t, index) => {
                      return (
                        <Fragment key={index}>
                          <Grid item xs={4}>
                            <TextField
                              fullWidth
                              label="STD Lower Bound"
                              value={t.stdLowerBound}
                              onChange={s => {
                                const time = flightRequirementModalModel.times!.find(s => s === t)!;
                                time.stdLowerBound = s.target.value;
                                setFlightRequirementModalModel({ ...flightRequirementModalModel, times: [...flightRequirementModalModel.times!] });
                              }}
                            />
                          </Grid>
                          <Grid item xs={4}>
                            <TextField
                              fullWidth
                              label="STD Upper Bound"
                              value={t.stdUpperBound}
                              onChange={s => {
                                const time = flightRequirementModalModel.times!.find(s => s === t)!;
                                time.stdUpperBound = s.target.value;
                                setFlightRequirementModalModel({ ...flightRequirementModalModel, times: [...flightRequirementModalModel.times!] });
                              }}
                            />
                          </Grid>
                          <Grid item xs={4}>
                            {index > 0 && (
                              <IconButton
                                onClick={() => {
                                  var temp = { ...flightRequirementModalModel };
                                  temp.times = temp.times && temp.times.filter(r => r != t);
                                  setFlightRequirementModalModel(temp);
                                }}
                              >
                                <ClearIcon />
                              </IconButton>
                            )}
                          </Grid>
                        </Fragment>
                      );
                    })}
                </Grid>
              </fieldset>
            </div>
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <Typography variant="caption" className={classes.captionTextColor}>
                  Allowed Aircrafts
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Include Aircraft" />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Exclude Aircraft" />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" className={classes.captionTextColor}>
                  Days
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" className={classes.captionTextColor}>
                  Options
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Grid item>
                  <DaysPicker selectedDays={model.days} onItemClick={w => setFlightRequirementModalModel({ ...flightRequirementModalModel, days: w })} />
                </Grid>
              </Grid>
              <Grid item xs={6}>
                <Grid container>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          color="primary"
                          checked={model.required}
                          onChange={e => setFlightRequirementModalModel({ ...flightRequirementModalModel, required: e.target.checked })}
                        />
                      }
                      label="Required"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      label="Destination Permmision"
                      control={
                        <Checkbox
                          color="primary"
                          checked={flightRequirementModalModel.destinationPermission}
                          onChange={e => setFlightRequirementModalModel({ ...flightRequirementModalModel, destinationPermission: e.target.checked })}
                        />
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      label="Origin Permission"
                      control={
                        <Checkbox
                          color="primary"
                          checked={flightRequirementModalModel.originPermission}
                          onChange={e => setFlightRequirementModalModel({ ...flightRequirementModalModel, originPermission: e.target.checked })}
                        />
                      }
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  value={flightRequirementModalModel.notes}
                  onChange={s => setFlightRequirementModalModel({ ...flightRequirementModalModel, notes: s.target.value })}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default FlightRequirementEditor;
