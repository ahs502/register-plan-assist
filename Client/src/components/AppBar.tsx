import React, { PureComponent } from 'react';
import { WithStyles, createStyles, withStyles, Theme } from '@material-ui/core/styles';
import { AppBar as MaterialUiAppBar, Toolbar, IconButton, Typography } from '@material-ui/core';
import { ArrowBackIos as ArrowBackIcon, Sync as SyncIcon, PersonalVideo as ViewModuleIcon, Fullscreen as FullScreenIcon, FullscreenExit as ExitFullScreenIcon } from '@material-ui/icons';
import User from '../business/User';
import classNames from 'classnames';

const styles = (theme: Theme) =>
  createStyles({
    textMargin: {
      marginLeft: theme.spacing.unit * 1.5,
      marginRight: theme.spacing.unit * 1.5
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
  });

interface Props extends WithStyles<typeof styles> {
  user: User;
}

interface State {
  isFullScreen: boolean;
}

class AppBar extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isFullScreen: false
    };
  }

  toggleFullScreen = () => {
    this.setState({ ...this.state, isFullScreen: !this.state.isFullScreen });
  };
  render() {
    const { classes, user } = this.props;
    const { isFullScreen } = this.state;

    return (
      <MaterialUiAppBar position="relative">
        <Toolbar variant="dense">
          <IconButton color="inherit">
            <ArrowBackIcon classes={{ root: classes.backIcon }} />
          </IconButton>
          <IconButton color="inherit">
            <SyncIcon />
          </IconButton>
          <Typography classes={{ root: classes.textMargin }} variant="h5" color="inherit">
            PA
          </Typography>
          <Typography classes={{ root: classes.textMargin }} variant="h6" color="inherit">
            {user.displayName}
          </Typography>
          <div className={classes.grow} />
          <IconButton color="inherit">
            <ViewModuleIcon />
          </IconButton>
          <IconButton color="inherit" onClick={this.toggleFullScreen}>
            {isFullScreen ? <FullScreenIcon /> : <ExitFullScreenIcon />}
          </IconButton>
          <i className={classNames('icon-mahan-air-logo', classes.iconSize)} />
        </Toolbar>
      </MaterialUiAppBar>
    );
  }
}

export default withStyles(styles)(AppBar);
