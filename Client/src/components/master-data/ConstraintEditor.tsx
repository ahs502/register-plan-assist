import React, { Fragment, FC, useState } from 'react';
import { Theme, Typography, TextField, Grid, RadioGroup, Radio, FormControlLabel, FormControl, InputLabel, Select, MenuItem, Input } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import MultiSelect from '../MultiSelect';
import MasterData from '../../business/master-data';
import AutoComplete from '../AutoComplete';
import Season, { SeasonModel } from '../../business/master-data/Season';
import DaysPicker from '../DaysPicker';
import { Weekday } from '../../business/Weekday';
import Constraint from '../../business/master-data/Constraint';

const useStyles = makeStyles((theme: Theme) => ({
  gridMargin: {
    marginTop: theme.spacing(3)
  },
  captionTextColor: {
    color: theme.palette.grey[500]
  },
  fieldsetStyle: {
    border: 'none',
    padding: theme.spacing(0),
    margin: theme.spacing(0)
  }
}));

type modeType = 'add' | 'edit' | 'readOnly';

export interface ConstraintEditorProps {
  model?: Constraint;
  mode: modeType;
}

const ConstraintEditor: FC<ConstraintEditorProps> = ({ model, mode }) => {
  const classes = useStyles();
  const airports = MasterData.all.airports.items.map(a => {
    return { name: a.name, id: a.id };
  });
  const aircraftGroups = MasterData.all.aircraftGroups.items.map(a => {
    return { name: a.name, id: a.id };
  });
  const registers = MasterData.all.aircraftRegisters.items.map(a => {
    return { name: a.name, id: a.id };
  });
  const seasons = [...MasterData.all.seasons.items];
  const allSeasenObjects = { name: 'All', id: '0' };
  const allSeason = seasons
    .sortBy('startDate')
    .concat(allSeasenObjects as Season)
    .reverse();
  const allTemplates = ['Aircraft Restriction on airport', 'Airport time restriction', 'Aircraft Time Restriction'];
  const aircraftGroupsAndRegisters = registers.concat(aircraftGroups);

  const [selectedSeason, setSelectedSeason] = useState(allSeasenObjects.id);
  const [isOnlyUseAircraft, setIsOnlyUseAircraft] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(allTemplates[0]);

  return (
    <fieldset className={classes.fieldsetStyle} disabled={mode === 'readOnly'}>
      <Grid container direction="column" spacing={1}>
        <Grid item xs={12}>
          <Typography className={classes.captionTextColor} variant="caption">
            Caption
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <TextField fullWidth margin="dense" label="Title" value={model ? model.name : ''} />
        </Grid>
        <Grid item xs={12}>
          <TextField fullWidth multiline rowsMax="2" rows="2" margin="dense" label="Details" />
        </Grid>
      </Grid>

      <Grid container direction="row" justify="center" alignItems="center" spacing={1} className={classes.gridMargin}>
        <Grid item xs={12} zeroMinWidth>
          <Typography className={classes.captionTextColor} variant="caption">
            Constraint Template
          </Typography>
        </Grid>
        <Grid item xs={12} zeroMinWidth>
          <FormControl fullWidth>
            <Select
              variant="outlined"
              input={<Input disabled={mode !== 'add'} />}
              value={selectedTemplate}
              onChange={e => {
                setSelectedTemplate(e.target.value as string);
              }}
            >
              {allTemplates.map((t, i) => {
                return (
                  <MenuItem key={i} value={t}>
                    {t}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} zeroMinWidth>
          <Typography variant="body2">When planning the flight of the</Typography>
        </Grid>
        <Grid item xs={3} zeroMinWidth>
          <Typography variant="body2">Airports(s)</Typography>
        </Grid>
        <Grid item xs={9} zeroMinWidth>
          <MultiSelect label="Airports" placeholder="Select Airports" options={airports} getOptionLabel={r => r.name} getOptionValue={r => r.id} />
        </Grid>

        <Grid item xs={3} zeroMinWidth>
          <RadioGroup
            onChange={() => {
              setIsOnlyUseAircraft(!isOnlyUseAircraft);
            }}
          >
            <FormControlLabel value="Only" checked={isOnlyUseAircraft} control={<Radio color="primary" />} label="Only" />
            <FormControlLabel value="Never" control={<Radio color="primary" />} label="Never" />
          </RadioGroup>
        </Grid>
        <Grid item xs={3} zeroMinWidth>
          <Typography variant="body2">Use the aircraft(s)</Typography>
        </Grid>
        <Grid item xs={6} zeroMinWidth>
          <MultiSelect label="Registers" placeholder="Select Registers" options={aircraftGroupsAndRegisters} getOptionLabel={r => r.name} getOptionValue={r => r.id} />
        </Grid>
        <Grid item xs={3} zeroMinWidth>
          <Typography variant="body2">except for</Typography>
        </Grid>
        <Grid item xs={9} zeroMinWidth>
          <MultiSelect label="Registers" placeholder="Select Registers" options={aircraftGroupsAndRegisters} getOptionLabel={r => r.name} getOptionValue={r => r.id} />
        </Grid>
      </Grid>

      <Grid container direction="row" justify="center" alignItems="center" spacing={2} className={classes.gridMargin}>
        <Grid item xs={12} zeroMinWidth>
          <Typography className={classes.captionTextColor} variant="caption">
            Date Filter
          </Typography>
        </Grid>
        <Grid item xs={6} zeroMinWidth>
          <TextField fullWidth label="From Date" />
        </Grid>
        <Grid item xs={6} zeroMinWidth>
          <TextField fullWidth label="To Date" />
        </Grid>
        <Grid item xs={3} zeroMinWidth>
          <Typography variant="body1">Season Type</Typography>
        </Grid>
        <Grid item xs={9} zeroMinWidth>
          <FormControl fullWidth>
            <Select
              variant="outlined"
              value={selectedSeason}
              input={<Input disabled={mode !== 'add'} />}
              onChange={e => {
                setSelectedSeason(e.target.value as string);
              }}
            >
              {allSeason.map(s => {
                return (
                  <MenuItem key={s.id} value={s.id}>
                    {s.name}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={3} zeroMinWidth>
          <Typography variant="body1">Days</Typography>
        </Grid>
        <Grid item xs={9} zeroMinWidth>
          <DaysPicker
            disabled={mode === 'readOnly'}
            onItemClick={wd => {
              console.log('This trick work');
              console.table(wd);
            }}
          />
        </Grid>
      </Grid>
    </fieldset>
  );
};

export default ConstraintEditor;
