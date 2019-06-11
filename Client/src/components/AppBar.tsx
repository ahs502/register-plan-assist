import React, { FC, useState } from 'react';
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
import User from '../business/User';

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
  }
}));

export interface AppBarProps {
  user: User;
}

const AppBar: FC<AppBarProps> = ({ user }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  const classes = useStyles();

  return (
    <MaterialUiAppBar position="relative">
      <Toolbar variant="dense">
        <IconButton color="inherit" title="Back To Other Module">
          <ArrowBackIcon classes={{ root: classes.backIcon }} />
        </IconButton>
        <IconButton color="inherit" title="Refresh Page">
          <SyncIcon />
        </IconButton>
        <Typography classes={{ root: classes.textMargin }} variant="h5" color="inherit">
          PA
        </Typography>
        <Typography classes={{ root: classes.textMargin }} variant="h6" color="inherit">
          {user.displayName}
        </Typography>
        <div className={classes.grow} />
        <IconButton color="inherit" title="Select Module">
          <ViewModuleIcon />
        </IconButton>
        <IconButton color="inherit" onClick={() => setIsFullScreen(!isFullScreen)} title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}>
          {isFullScreen ? <ExitFullScreenIcon /> : <FullScreenIcon />}
        </IconButton>
        <i className={classNames('icon-mahan-air-logo', classes.iconSize)} />
      </Toolbar>
    </MaterialUiAppBar>
  );
};

export default AppBar;
