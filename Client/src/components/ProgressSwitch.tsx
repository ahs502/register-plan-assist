import React, { FC, useEffect } from 'react';
import { Theme, CircularProgress, Switch } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { SwitchProps } from '@material-ui/core/Switch/Switch';
import classNames from 'classnames';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    position: 'relative',
    width: 58,
    height: 38
  },
  trueProgress: {
    position: 'absolute',
    top: 12,
    right: 12,
    pointerEvents: 'none',
    color: theme.palette.common.black
  },
  falseProgress: {
    position: 'absolute',
    zIndex: 1000,
    top: 12,
    left: 12,
    pointerEvents: 'none',
    color: theme.palette.common.black
  },
  trueProgressPrimary: {
    color: theme.palette.primary.main
  },
  falseProgressPrimary: {
    color: theme.palette.getContrastText(theme.palette.primary.main)
  },
  trueProgressSecondary: {
    color: theme.palette.secondary.main
  },
  falseProgressSecondary: {
    color: theme.palette.getContrastText(theme.palette.secondary.main)
  },
  progressDefault: {
    color: theme.palette.common.black
  },
  thumbPrimary: {
    color: theme.palette.primary.main
  },
  thumbSecondary: {
    color: theme.palette.secondary.main
  },
  thumbDefault: {
    color: theme.palette.grey[50]
  },
  trackPrimary: {
    backgroundColor: theme.palette.primary.main
  },
  trackSecondary: {
    backgroundColor: theme.palette.secondary.main
  },
  trackDefault: {
    backgroundColor: `${theme.palette.type === 'light' ? theme.palette.common.black : theme.palette.common.white} !important`
  }
}));

export interface ProgressSwitchProps extends SwitchProps {
  loading?: boolean;
  checked: boolean;
}

const ProgressSwitch: FC<ProgressSwitchProps> = ({ loading, checked, disabled, color, classes: propsClasses, ...other }) => {
  const classes = useStyles();

  const actuallyLoading = loading && !disabled && checked !== undefined;
  const actuallyChecked = actuallyLoading ? !checked : checked;

  return (
    <div className={classes.root}>
      <Switch
        classes={{
          thumb: classNames(
            !disabled && {
              [classes.thumbPrimary]: color === 'primary' && checked,
              [classes.thumbSecondary]: (!color || color === 'secondary') && checked,
              [classes.thumbDefault]: (color === 'primary' && !checked) || ((!color || color === 'secondary') && !checked)
            },
            propsClasses && propsClasses.thumb
          ),
          track: classNames(
            !disabled && {
              [classes.trackPrimary]: color === 'primary' && checked,
              [classes.trackSecondary]: (!color || color === 'secondary') && checked,
              [classes.trackDefault]: (color === 'primary' && !checked) || ((!color || color === 'secondary') && !checked)
            },
            propsClasses && propsClasses.track
          ),
          switchBase: classNames({}, propsClasses && propsClasses.switchBase),
          ...(propsClasses || {})
        }}
        checked={actuallyChecked}
        disabled={disabled}
        color={color}
        {...other}
      />
      {actuallyLoading && (
        <CircularProgress
          size={14}
          className={classNames(
            { [classes.trueProgress]: actuallyChecked, [classes.falseProgress]: !actuallyChecked },
            {
              [classes.trueProgressPrimary]: color === 'primary' && actuallyChecked,
              [classes.falseProgressPrimary]: color === 'primary' && !actuallyChecked,
              [classes.trueProgressSecondary]: (!color || color === 'secondary') && actuallyChecked,
              [classes.falseProgressSecondary]: (!color || color === 'secondary') && !actuallyChecked,
              [classes.progressDefault]: color === 'default'
            }
          )}
        />
      )}
    </div>
  );
};

export default ProgressSwitch;
