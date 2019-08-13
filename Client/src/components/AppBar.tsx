import React, { FC } from 'react';
import { Theme, AppBar as MaterialUiAppBar, Toolbar, IconButton, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import {
  ArrowBackIos as ArrowBackIcon,
  Sync as SyncIcon,
  PersonalVideo as ViewModuleIcon,
  Fullscreen as FullScreenIcon,
  FullscreenExit as ExitFullScreenIcon
} from '@material-ui/icons';
import classNames from 'classnames';
import persistant from 'src/utils/persistant';

const useStyles = makeStyles((theme: Theme) => ({
  textMargin: {
    marginLeft: theme.spacing(1.5),
    marginRight: theme.spacing(1.5)
  },
  grow: {
    flexGrow: 1
  },
  iconSize: {
    fontSize: 40
  },
  backIcon: {
    position: 'relative',
    left: 5
  },
  appBarStyle: {
    height: theme.spacing(6)
  }
}));

export interface AppBarProps {
  loading: boolean;
  fullScreen: boolean;
}

const AppBar: FC<AppBarProps> = ({ loading, fullScreen }) => {
  const classes = useStyles();

  return (
    <MaterialUiAppBar position="relative" className={classes.appBarStyle}>
      <Toolbar variant="dense">
        <IconButton color="inherit" title="Back To Other Module">
          <ArrowBackIcon classes={{ root: classes.backIcon }} />
        </IconButton>
        <IconButton color="inherit" title={loading ? 'Loading...' : 'Refresh Page'}>
          <SyncIcon classes={{ root: classNames({ 'animate-spin-reverse': loading }) }} />
        </IconButton>
        <Typography classes={{ root: classes.textMargin }} variant="h5" color="inherit">
          RPA
        </Typography>
        <Typography classes={{ root: classes.textMargin }} variant="h6" color="inherit">
          {persistant.authentication!.user.displayName}
        </Typography>
        <div className={classes.grow} />
        <IconButton color="inherit" title="Select Module">
          <ViewModuleIcon />
        </IconButton>
        <IconButton color="inherit" title={fullScreen ? 'Exit Full Screen' : 'Full Screen'}>
          {fullScreen ? <ExitFullScreenIcon /> : <FullScreenIcon />}
        </IconButton>
        <i className={classNames('icon-mahan-air-logo', classes.iconSize)} />
      </Toolbar>
    </MaterialUiAppBar>
  );
};

export default AppBar;
