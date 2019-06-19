import React, { FC, useState } from 'react';
import { Theme, Typography, FormControl, Select, TextField, InputLabel } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import SideBarContainer from './SideBarContainer';

const useStyles = makeStyles((theme: Theme) => ({
  formControl: {
    marginTop: theme.spacing(2)
  },
  selectStyle: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(5)
  },
  textFieldStyle: {
    paddingLeft: theme.spacing(1)
  }
}));

export interface SettingsSideBarProps {
  mode?: 'Average' | 'Maximum' | 'Minimum';
  offset?: number;
}

const allMode = ['Average', 'Maximum', 'Minimum'];

const SettingsSideBar: FC<SettingsSideBarProps> = (mode, offset) => {
  const [selectedMgtMode, setSelectedMgtMode] = useState('Average');
  const [selectedOffset, setSelectedOffset] = useState(0);
  const classes = useStyles();
  return (
    <SideBarContainer
      onApply={() => {
        console.log(selectedMgtMode);
        console.log(selectedOffset);
        alert('TODO: Data Model Must save in database...');
      }}
      label="Auto-Arranger Options"
    >
      <Typography variant="body1"> Minimum Ground Time </Typography>

      <FormControl fullWidth className={classes.formControl}>
        <InputLabel htmlFor="age-native-simple">Mode</InputLabel>
        <Select
          classes={{ select: classes.selectStyle }}
          native
          variant="outlined"
          value={selectedMgtMode}
          // input={<Input disabled={mode !== 'add'} />}
          onChange={e => {
            setSelectedMgtMode(e.target.value as string);
          }}
        >
          {allMode.map((s, i) => {
            return (
              <option key={i} value={s}>
                {s}
              </option>
            );
          })}
        </Select>
      </FormControl>
      <FormControl fullWidth className={classes.formControl}>
        <TextField
          type="number"
          label="Offset"
          value={selectedOffset}
          onChange={e => {
            setSelectedOffset(parseInt(e.target.value));
          }}
          InputProps={{
            className: classes.textFieldStyle
          }}
        />
      </FormControl>
    </SideBarContainer>
  );
};

export default SettingsSideBar;
