import React, { FC } from 'react';
import { Theme, Typography, Button, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    margin: 0,
    width: theme.spacing(60)
  },
  label: {
    border: 'solid',
    borderleft: '1px',
    borderTopWidth: '1px',
    borderBottomWidth: '1px',
    borderLeftWidth: '0px',
    borderRightWidth: '0px',
    borderColor: theme.palette.grey[400],
    backgroundColor: theme.palette.grey[200],
    margin: 0,
    padding: theme.spacing(2)
  },
  contents: {
    margin: 0,
    padding: theme.spacing(2)
  }
}));

export interface SideBarContainerProps {
  label?: string;
  onAction?: () => void;
}

const SideBarContainer: FC<SideBarContainerProps> = ({ label, onAction, children }) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.label}>
        <Grid container direction="row" justify="space-between" alignItems="center">
          <Typography> {label}</Typography>
          {onAction && (
            <Button variant="contained" onClick={() => onAction()}>
              Apply
            </Button>
          )}
        </Grid>
      </div>
      <div className={classes.contents}>{children}</div>
    </div>
  );
};

export default SideBarContainer;
