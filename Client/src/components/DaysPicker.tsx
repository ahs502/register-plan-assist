import React, { FC, useState, Fragment } from 'react';
import { Theme, Button, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import Weekday from '@core/types/Weekday';

const useStyles = makeStyles((theme: Theme) => ({
  button: {
    margin: theme.spacing(1, 1, 0, 0),
    padding: theme.spacing(0),
    minWidth: theme.spacing(6)
  },
  typographyLineHight: {
    lineHeight: 1.7
  }
}));

export interface DaysPickerProps {
  selectedDays?: boolean[];
  onItemClick?: (selectedDays: boolean[]) => void;
  disabled?: boolean;
  disabledDays?: boolean[];
}

const DaysPicker: FC<DaysPickerProps> = ({ selectedDays, onItemClick, disabled, disabledDays: disabledDays }) => {
  const [buttonsState, setButtonsState] = useState(selectedDays || Array.range(0, 6).map(d => false));

  const classes = useStyles();

  return (
    <Fragment>
      {Array.range(0, 6).map(d => (
        <Button
          disabled={disabled || (disabledDays && disabledDays[d])}
          size="small"
          key={d}
          variant={buttonsState[d] ? 'contained' : 'outlined'}
          color={buttonsState[d] ? 'primary' : 'default'}
          className={classes.button}
          onClick={() => {
            const weekday = [...buttonsState];
            weekday[d] = !weekday[d];
            setButtonsState(weekday);
            onItemClick && onItemClick(weekday);
          }}
        >
          <Typography className={classes.typographyLineHight} variant="overline">
            {Weekday[d].slice(0, 3)}
          </Typography>
        </Button>
      ))}
      <Button
        disabled={disabled}
        size="small"
        key="AllDay"
        variant="outlined"
        color="secondary"
        className={classes.button}
        onClick={() => {
          const weekday = [...buttonsState];
          const numberOfDisabled = disabledDays ? disabledDays.filter(d => d).length : 0;
          const numberOfSelected = buttonsState.filter(d => d).length - numberOfDisabled;
          const allAvaliableDay = 7 - numberOfDisabled;

          for (let index = 0; index < buttonsState.length; index++) {
            if (disabledDays && disabledDays[index]) continue;
            weekday[index] = (numberOfSelected > allAvaliableDay / 2 && numberOfSelected !== allAvaliableDay) || numberOfSelected === 0;
          }

          setButtonsState(weekday);
          onItemClick && onItemClick(weekday);
        }}
      >
        <Typography className={classes.typographyLineHight} variant="overline">
          All
        </Typography>
      </Button>
    </Fragment>
  );
};

export default DaysPicker;
