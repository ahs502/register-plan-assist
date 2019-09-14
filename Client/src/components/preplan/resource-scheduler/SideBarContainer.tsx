import React, { FC } from 'react';
import { Theme, Typography, Button, Grid, CircularProgress, Paper } from '@material-ui/core';
import { Add as AddIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';
import classNames from 'classnames';

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
  },
  progress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12
  },
  disable: {
    opacity: 0.5
  },
  margin: {
    margin: theme.spacing(1)
  },
  error: {
    padding: theme.spacing(1.5, 1.5, 1.5, 3)
  },
  paperError: {
    boxShadow: '0px 1px 3px 0px rgba(255, 0, 0, 0.2), 0px 1px 1px 0px rgba(255, 0, 0, 0.14), 0px 2px 1px -1px rgba(255, 0, 0, 0.12);'
  }
}));

export interface SideBarContainerProps {
  label?: string;
  onApply?: () => void;
  onAdd?: () => void;
  loading?: boolean;
  errorMessage?: string;
}

const SideBarContainer: FC<SideBarContainerProps> = ({ label, onApply, onAdd, loading, errorMessage, children }) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      {loading && <CircularProgress size={24} className={classes.progress} />}
      <div className={classes.label}>
        <Grid container direction="row" justify="space-between" alignItems="center">
          <Grid>
            <Typography> {label}</Typography>
          </Grid>
          <Grid>
            <Grid container direction="row" justify="space-between" alignItems="center" spacing={1}>
              {onAdd && (
                <Grid item>
                  <Button disabled={loading} color="primary" variant="outlined" onClick={() => onAdd()}>
                    <AddIcon />
                  </Button>
                </Grid>
              )}
              {onApply && (
                <Grid item>
                  <Button disabled={loading} color="primary" variant="outlined" onClick={() => onApply()}>
                    Apply
                  </Button>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      </div>
      {errorMessage && (
        <Paper className={classNames(classes.paperError, classes.margin)}>
          <Typography className={classes.error} component="p" variant="body1" color="error">
            {errorMessage}
          </Typography>
        </Paper>
      )}
      <div className={classNames(classes.contents, { [classes.disable]: loading })}>{children}</div>
    </div>
  );
};

export default SideBarContainer;
