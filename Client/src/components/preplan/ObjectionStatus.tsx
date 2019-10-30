import React, { FC, Fragment } from 'react';
import { Theme, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import MahanIcon, { MahanIconType } from 'src/components/MahanIcon';
import Objection from 'src/business/constraints/Objection';

const useStyles = makeStyles((theme: Theme) => ({
  errorIcon: {
    color: theme.palette.extraColors.erroredFlight
  },
  warningIcon: {
    color: theme.palette.extraColors.warnedFlight
  }
}));

export interface ObjectionStatusProps {
  objections: readonly Objection[];
  filteredObjections: readonly Objection[];
}

const ObjectionStatus: FC<ObjectionStatusProps> = ({ objections, filteredObjections }) => {
  const errorsCount = objections.filter(o => o.type === 'ERROR').length;
  const filteredErrorsCount = filteredObjections.filter(o => o.type === 'ERROR').length;
  const warningsCount = objections.length - errorsCount;
  const filteredWarningsCount = filteredObjections.length - filteredErrorsCount;

  const classes = useStyles();

  return (
    <div>
      {errorsCount > 0 && (
        <Fragment>
          <Typography variant="body2" display="inline">
            <MahanIcon type={MahanIconType.CancelButton} className={classes.errorIcon} fontSize="small"></MahanIcon>
            &nbsp;
            {filteredErrorsCount !== errorsCount && <Fragment>{filteredErrorsCount} / </Fragment>}
            {errorsCount}
          </Typography>
          {warningsCount > 0 && <span>&nbsp;&nbsp;&nbsp;</span>}
        </Fragment>
      )}
      {warningsCount > 0 && (
        <Typography variant="body2" display="inline">
          <MahanIcon type={MahanIconType.Alert} className={classes.warningIcon} fontSize="small"></MahanIcon>
          &nbsp;
          {filteredWarningsCount !== warningsCount && <Fragment>{filteredWarningsCount} / </Fragment>}
          {warningsCount}
        </Typography>
      )}
    </div>
  );
};

export default ObjectionStatus;
