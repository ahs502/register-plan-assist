import React, { FC, useRef, useState } from 'react';
import { Theme, AppBar as MaterialUiAppBar, Toolbar, IconButton, Typography, Menu, MenuItem, ButtonBase, Box } from '@material-ui/core';
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
import config from 'src/config';

const useStyles = makeStyles((theme: Theme) => ({
  textMargin: {
    marginLeft: theme.spacing(1.5),
    marginRight: theme.spacing(1.5)
  },
  notSelectable: {
    userSelect: 'none'
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

interface UserDisplayNameMenuModel {
  open?: boolean;
}

export interface AppBarProps {
  loading: boolean;
}

const AppBar: FC<AppBarProps> = ({ loading }) => {
  const [userDisplayNameMenuModel, setUserDisplayNameMenuModel] = useState<UserDisplayNameMenuModel>({});
  const [fullScreen, setFullScreen] = useState(false);

  const userDisplayNameRef = useRef(null);

  const classes = useStyles();

  return (
    <MaterialUiAppBar position="relative" className={classes.appBarStyle}>
      <Toolbar variant="dense">
        <Box display="block" displayPrint="none">
          <IconButton onClick={() => (window.location.href = 'http://apps.mahan.aero/')} color="inherit" title="Back To Other Module">
            <ArrowBackIcon classes={{ root: classes.backIcon }} />
          </IconButton>
          <IconButton color="inherit" onClick={() => window.location.reload()} title={loading ? 'Loading...' : 'Refresh Page'}>
            <SyncIcon classes={{ root: classNames({ 'animate-spin-reverse': loading }) }} />
          </IconButton>
        </Box>
        <Typography classes={{ root: classNames(classes.textMargin, classes.notSelectable) }} variant="h5" color="inherit" title={config.version}>
          RPA
        </Typography>

        {!!persistant.user && (
          <ButtonBase>
            <Typography classes={{ root: classes.textMargin }} variant="h6" color="inherit" ref={userDisplayNameRef} onClick={() => setUserDisplayNameMenuModel({ open: true })}>
              {persistant.user!.displayName}
            </Typography>
          </ButtonBase>
        )}
        <Menu id="user-display-name-menu" anchorEl={userDisplayNameRef.current} open={!!userDisplayNameMenuModel.open} onClose={() => setUserDisplayNameMenuModel({ open: false })}>
          <MenuItem
            onClick={() => {
              setUserDisplayNameMenuModel({ open: false });
              delete persistant.oauthCode;
              delete persistant.refreshToken;
              delete persistant.user;
              delete persistant.userSettings;
              delete persistant.encodedAuthenticationHeader;
              window.location.reload(); //TODO: Call logout API instead.
            }}
          >
            Logout
          </MenuItem>
        </Menu>

        <div className={classes.grow} />
        <Box display="block" displayPrint="none">
          <IconButton color="inherit" title="Select Module">
            <ViewModuleIcon />
          </IconButton>
          <IconButton color="inherit" title={fullScreen ? 'Exit Full Screen' : 'Full Screen'} onClick={() => toggleFullScreen()}>
            {fullScreen ? <ExitFullScreenIcon /> : <FullScreenIcon />}
          </IconButton>
        </Box>
        <i className={classNames('rpa-icon-mahan-air-logo', classes.iconSize)} title="Mahan Air" />
      </Toolbar>
    </MaterialUiAppBar>
  );

  function toggleFullScreen() {
    let doc: any = document;
    let isInFullScreen =
      (doc.fullscreenElement && doc.fullscreenElement !== null) ||
      (doc.webkitFullscreenElement && doc.webkitFullscreenElement !== null) ||
      (doc.mozFullScreenElement && doc.mozFullScreenElement !== null) ||
      (doc.msFullscreenElement && doc.msFullscreenElement !== null);

    let docElm: any = document.documentElement;
    if (!isInFullScreen) {
      setFullScreen(true);
      if (docElm.requestFullscreen) {
        docElm.requestFullscreen();
      } else if (docElm.mozRequestFullScreen) {
        docElm.mozRequestFullScreen();
      } else if (docElm.webkitRequestFullScreen) {
        docElm.webkitRequestFullScreen();
      } else if (docElm.msRequestFullscreen) {
        docElm.msRequestFullscreen();
      }
    } else {
      if (doc.exitFullscreen) {
        setFullScreen(false);
        doc.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      } else if (doc.mozCancelFullScreen) {
        doc.mozCancelFullScreen();
      } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen();
      }
    }
  }
};

export default AppBar;
