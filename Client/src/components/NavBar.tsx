import React, { PureComponent } from 'react';
import { WithStyles, createStyles, withStyles, Theme } from '@material-ui/core/styles';
import { Toolbar, Typography } from '@material-ui/core';
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
    tools: {
      float: 'right'
    },
    grow: {
      flexGrow: 1
    }
  });

export interface NavBarLink {
  title: string;
  link?: string;
}

interface Props extends WithStyles<typeof styles> {
  backLink?: string;
  navBarLinks: NavBarLink[];
}

class NavBar extends PureComponent<Props> {
  render() {
    const { classes, children, backLink, navBarLinks } = this.props;

    return (
      <Toolbar className={classes.root} variant="dense">
        {backLink && (
          <LinkIconButton to={backLink} color="inherit" title="sdkfjalksdjfklasdjf">
            <BackIcon />
          </LinkIconButton>
        )}
        {navBarLinks.map((navBarLink, index) => (
          <React.Fragment key={index}>
            {index > 0 && <NavigateNextIcon />}
            {navBarLink.link ? (
              <LinkTypography variant="h6" to={navBarLink.link as string}>
                {navBarLink.title}
              </LinkTypography>
            ) : (
              <Typography variant="h6">{navBarLink.title}</Typography>
            )}
          </React.Fragment>
        ))}
        <div className={classes.grow} />
        {children}
      </Toolbar>
    );
  }
}

export default withStyles(styles)(NavBar);
