import React, { FC, Fragment } from 'react';
import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import classNames from 'classnames';
import Objection, { ObjectionType } from '../../../business/Objection';

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    border: '1px solid pink',
    margin: 0,
    padding: theme.spacing(1)
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
}));

export interface ErrorAndWarningListProps {
  objections: ReadonlyArray<Readonly<Objection>>;
}

const ErrorAndWarningList: FC<ErrorAndWarningListProps> = ({ objections }) => {
  const classes = useStyles();

  return (
    <Fragment>
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
    </Fragment>
  );
};

export default ErrorAndWarningList;
