import React, { PureComponent } from 'react';
import { WithStyles, createStyles, withStyles, Theme } from '@material-ui/core/styles';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      border: '1px solid green',
      backgroundColor: theme.palette.grey[300],
      margin: 0,
      padding: theme.spacing.unit * 2
    },
    tools: {
      float: 'right'
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
      <div className={classes.root}>
        {backLink && <strong title={backLink}>[Back]</strong>}
        {navBarLinks.map((navBarLink, index) => (
          <React.Fragment key={index}>
            {index > 0 && <strong>&gt;</strong>}
            <span title={navBarLink.link}>{navBarLink.title}</span>
          </React.Fragment>
        ))}
        <span className={classes.tools}>
          Nav Bar&nbsp;&nbsp;<strong>{children}</strong>
        </span>
      </div>
    );
  }
}

export default withStyles(styles)(NavBar);
