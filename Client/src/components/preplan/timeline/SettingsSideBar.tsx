import React, { FC, useState, useContext } from 'react';
import { Theme, FormControlLabel, Checkbox, Typography, ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import SideBarContainer from 'src/components/preplan/timeline/SideBarContainer';
import { ExpandMore as ExpandMoreIcon } from '@material-ui/icons';
import persistant from 'src/utils/persistant';
import RpaUserSettingModel from '@core/models/RpaUserSettingModel';

const useStyles = makeStyles((theme: Theme) => ({
  // formControl: {
  //   marginTop: theme.spacing(2)
  // },
  // selectStyle: {
  //   paddingLeft: theme.spacing(1),
  //   paddingRight: theme.spacing(5)
  // },
  // textFieldStyle: {
  //   paddingLeft: theme.spacing(1)
  // }
  root: {
    width: '100%'
  },
  column: {
    flexBasis: '10%'
  }
}));

// const minimumGroundTimeModes: readonly { value: MinimumGroundTimeMode; label: string }[] = [
//   { value: 'MINIMUM', label: 'Minimum' },
//   { value: 'MAXIMUM', label: 'Maximum' },
//   { value: 'AVERAGE', label: 'Average' }
// ];

interface ViewState {
  timeLineLocaltime: boolean;
  flightRequirementLocaltime: boolean;
}

export interface SettingsSideBarProps {
  // autoArrangerOptions: AutoArrangerOptions;
  onApply: (userSetting: RpaUserSettingModel) => void;
}

const SettingsSideBar: FC<SettingsSideBarProps> = ({
  // autoArrangerOptions,
  onApply
}) => {
  // const [minimumGroundTimeMode, setMinimumGroundTimeMode] = useState(autoArrangerOptions.minimumGroundTimeMode);
  // const [minimumGroundTimeOffset, setMinimumGroundTimeOffset] = useState(autoArrangerOptions.minimumGroundTimeOffset);

  const [viewState, setViewState] = useState<ViewState>({
    timeLineLocaltime: persistant.rpaUserSetting?.timeline?.localtime ?? false,
    flightRequirementLocaltime: persistant.rpaUserSetting?.flightRequirement?.localTime ?? false
  });
  const classes = useStyles();

  return (
    <SideBarContainer
      label="Settings"
      onApply={() => {
        onApply({ flightRequirement: { localTime: viewState.flightRequirementLocaltime }, timeline: { localtime: viewState.timeLineLocaltime } } as RpaUserSettingModel);
      }}
    >
      {/* <Typography variant="body1">Minimum Ground Time</Typography>
      <FormControl fullWidth className={classes.formControl}>
        <InputLabel htmlFor="age-native-simple">Mode</InputLabel>
        <Select
          classes={{ select: classes.selectStyle }}
          native
          variant="outlined"
          value={minimumGroundTimeMode}
          onChange={e => setMinimumGroundTimeMode(e.target.value as MinimumGroundTimeMode)}
        >
          {minimumGroundTimeModes.map(mode => (
            <option key={mode.value} value={mode.value}>
              {mode.label}
            </option>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth className={classes.formControl}>
        <TextField
          type="number"
          label="Offset"
          value={minimumGroundTimeOffset}
          onChange={e => setMinimumGroundTimeOffset(Number(e.target.value))}
          InputProps={{
            className: classes.textFieldStyle
          }}
        />
      </FormControl> */}

      <div className={classes.root}>
        <ExpansionPanel defaultExpanded>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Timeline:</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <div className={classes.column} />
            <FormControlLabel
              control={
                <Checkbox
                  checked={viewState.timeLineLocaltime}
                  onChange={({ target: { checked: timeLineLocaltime } }) => setViewState({ ...viewState, timeLineLocaltime })}
                  color="primary"
                />
              }
              label="Local time"
            />
          </ExpansionPanelDetails>
        </ExpansionPanel>

        <ExpansionPanel defaultExpanded>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Flight requirement:</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <div className={classes.column} />
            <FormControlLabel
              control={
                <Checkbox
                  checked={viewState.flightRequirementLocaltime}
                  onChange={({ target: { checked: flightRequirementLocaltime } }) => setViewState({ ...viewState, flightRequirementLocaltime })}
                  color="primary"
                />
              }
              label="Local time"
            />
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </div>
    </SideBarContainer>
  );
};

export default SettingsSideBar;
