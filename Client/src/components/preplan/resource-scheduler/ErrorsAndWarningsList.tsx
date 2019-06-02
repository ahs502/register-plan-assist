import React, { FunctionComponent } from 'react';
import { WithStyles, Theme, createStyles, withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import Objection, { ObjectionType } from '../../../business/Objection';

const styles = (theme: Theme) =>
  createStyles({
    card: {
      border: '1px solid pink',
      margin: 0,
      padding: theme.spacing.unit
    },
    message: {
      display: 'inline-block',
      width: 'calc(100% - 100px'
    },
    icon: {
      display: 'inline-block',
      width: 100
    },
    error: {
      color: theme.palette.extraColors.erroredFlight
    },
    warning: {
      color: theme.palette.extraColors.warnedFlight
    }
  });

interface Props extends WithStyles<typeof styles> {
  objections: ReadonlyArray<Objection>;
}

const ErrorAndWarningList: FunctionComponent<Props> = props => {
  const { classes, objections } = props;

  return (
    <React.Fragment>
      {objections.orderBy('priority').map(objection => (
        <div className={classes.card} key={objection.message}>
          <div className={classes.message}>{objection.message}</div>
          <div
            className={classNames(classes.icon, {
              [classes.error]: objection.type === ObjectionType.Error,
              [classes.warning]: objection.type === ObjectionType.Warning
            })}
          >
            {objection.message}
          </div>
        </div>
      ))}
    </React.Fragment>
  );
};

export default withStyles(styles)(ErrorAndWarningList);
