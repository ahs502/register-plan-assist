import React, { Fragment, FC } from 'react';
import { Theme, Toolbar, Typography, IconButton, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { NavigateNext as NavigateNextIcon, KeyboardBackspace as BackIcon } from '@material-ui/icons';
import LinkTypography from './LinkTypography';
import LinkIconButton from './LinkIconButton';
import { useHistory } from 'react-router-dom';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    borderBottom: '1px solid',
    borderBottomColor: theme.palette.grey[500],
    backgroundColor: theme.palette.grey[300],
    margin: 0,
    padding: theme.spacing(0.5),
    paddingRight: theme.spacing(3),
    paddingLeft: theme.spacing(3)
  },
  navigation: {
    position: 'absolute',
    left: 86
  },
  navigationNextIcon: {
    position: 'relative',
    top: '6px',
    margin: theme.spacing(0, 0.5)
  },
  tools: {
    float: 'right'
  },
  grow: {
    flexGrow: 1
  }
}));

export interface NavBarLink {
  readonly title: string;
  readonly link?: string;
}

export interface NavBarProps {
  backLink?: string;
  backTitle?: string;
  navBarLinks: readonly (NavBarLink | false | null | undefined)[];
}

const NavBar: FC<NavBarProps> = ({ children, backLink, navBarLinks, backTitle }) => {
  const history = useHistory();
  const classes = useStyles();

  return (
    <Box display="block" displayPrint="none">
      <Toolbar className={classes.root} variant="dense">
        {backLink && (
          <LinkIconButton to={backLink} color="inherit" title={backTitle}>
            <BackIcon />
          </LinkIconButton>
          // <IconButton color="inherit" title={backTitle} onClick={() => history.goBack() /* history.push(backLink) */}>
          //   <BackIcon />
          // </IconButton>
        )}
        <div className={classes.navigation}>
          {(navBarLinks.filter(Boolean) as NavBarLink[]).map((navBarLink, index) => (
            <Fragment key={index}>
              {index > 0 && <NavigateNextIcon classes={{ root: classes.navigationNextIcon }} />}
              {navBarLink.link ? (
                <LinkTypography variant="h6" display="inline" to={navBarLink.link as string}>
                  {navBarLink.title}
                </LinkTypography>
              ) : (
                <Typography variant="h6" display="inline">
                  {navBarLink.title}
                </Typography>
              )}
            </Fragment>
          ))}
        </div>
        <div className={classes.grow} />
        {children}
      </Toolbar>
    </Box>
  );
};

export default NavBar;
