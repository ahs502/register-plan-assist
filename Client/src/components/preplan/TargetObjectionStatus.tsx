import React, { FC, Fragment } from 'react';
import { Theme, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import MahanIcon, { MahanIconType } from 'src/components/MahanIcon';
import Objectionable from 'src/business/constraints/Objectionable';
import Objection from 'src/business/constraints/Objection';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    cursor: 'pointer'
  },
  errorIcon: {
    color: theme.palette.extraColors.erroredFlight
  },
  warningIcon: {
    color: theme.palette.extraColors.warnedFlight
  }
}));

export interface TargetObjectionStatusProps {
  target: Objectionable;
  onClick(): void;
}

const TargetObjectionComponenet: FC<TargetObjectionStatusProps> = ({ target, onClick }) => {
  const objections: readonly Objection[] = []; //TODO: Get objections by target...
  const errorsCount = objections.filter(o => o.type === 'ERROR').length;
  const warningsCount = objections.length - errorsCount;

  const classes = useStyles();

  return (
    <div className={classes.root} onClick={onClick}>
      {errorsCount && (
        <Fragment>
          <Typography variant="body2" display="inline">
            <MahanIcon type={MahanIconType.CancelButton} className={classes.errorIcon} fontSize="small"></MahanIcon>
            &nbsp;
            {errorsCount}
          </Typography>
          {warningsCount && <span>&nbsp;&nbsp;&nbsp;</span>}
        </Fragment>
      )}
      {warningsCount && (
        <Typography variant="body2" display="inline">
          <MahanIcon type={MahanIconType.Alert} className={classes.warningIcon} fontSize="small"></MahanIcon>
          &nbsp;
          {warningsCount}
        </Typography>
      )}
    </div>
  );
};

export default TargetObjectionComponenet;
