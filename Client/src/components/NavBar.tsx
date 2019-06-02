import React, { PureComponent, Fragment } from 'react';
import { WithStyles, createStyles, withStyles, Theme } from '@material-ui/core/styles';
import { Toolbar, Typography, IconButton } from '@material-ui/core';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { NavigateNext as NavigateNextIcon, KeyboardBackspace as BackIcon } from '@material-ui/icons';
import LinkTypography from './LinkTypography';
import LinkIconButton from './LinkIconButton';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      border: '1px solid green',
      backgroundColor: theme.palette.grey[300],
      margin: 0,
      padding: theme.spacing.unit * 0.5,
      paddingRight: theme.spacing.unit * 3,
      paddingLeft: theme.spacing.unit * 3
    },
    navigation: {
      position: 'absolute',
      left: 86
    },
    tools: {
      float: 'right'
    },
    grow: {
      flexGrow: 1
    }
  });

export interface NavBarLink {
  readonly title: string;
  readonly link?: string;
}

interface Props extends WithStyles<typeof styles>, RouteComponentProps<{}> {
  backLink?: string;
  backTitle?: string;
  navBarLinks: ReadonlyArray<NavBarLink | undefined>;
}

class NavBar extends PureComponent<Props> {
  goBackHandler = () => {
    const { history, backLink } = this.props;
    history.goBack();
    // history.push(backLink);
  };

  render() {
    const { classes, children, backLink, navBarLinks, backTitle } = this.props;

    return (
      <Toolbar className={classes.root} variant="dense">
        {backLink && (
          // <LinkIconButton to={backLink} color="inherit" title={backTitle}>
          //   <BackIcon />
          // </LinkIconButton>
          <IconButton color="inherit" title={backTitle} onClick={this.goBackHandler}>
            <BackIcon />
          </IconButton>
        )}
        <div className={classes.navigation}>
          {(navBarLinks.filter(Boolean) as NavBarLink[]).map((navBarLink, index) => (
            <Fragment key={index}>
              {index > 0 && <NavigateNextIcon />}
              {navBarLink.link ? (
                <LinkTypography variant="h6" inline to={navBarLink.link as string}>
                  {navBarLink.title}
                </LinkTypography>
              ) : (
                <Typography variant="h6" inline>
                  {navBarLink.title}
                </Typography>
              )}
            </Fragment>
          ))}
        </div>
        <div className={classes.grow} />
        {children}
      </Toolbar>
    );
  }
}

export default withStyles(styles)(withRouter(NavBar));
