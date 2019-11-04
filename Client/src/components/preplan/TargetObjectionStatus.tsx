import React, { FC, Fragment, useContext } from 'react';
import { Theme, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import MahanIcon, { MahanIconType } from 'src/components/MahanIcon';
import Objectionable from 'src/business/constraints/Objectionable';
import { PreplanContext } from 'src/pages/preplan';
import ObjectionModal, { useObjectionModalState } from 'src/components/preplan/ObjectionModal';

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
}

const TargetObjectionStatus: FC<TargetObjectionStatusProps> = ({ target }) => {
  const preplan = useContext(PreplanContext);

  const [objectionModalState, openObjectionModal, closeObjectionModal] = useObjectionModalState();

  const objections = preplan.constraintSystem.getObjectionsByTarget(target);
  const errorsCount = objections.filter(o => o.type === 'ERROR').length;
  const warningsCount = objections.length - errorsCount;

  const classes = useStyles();

  return (
    <Fragment>
      <div className={classes.root} onClick={() => objections.length > 0 && openObjectionModal({ target })}>
        {errorsCount > 0 && (
          <Fragment>
            <Typography variant="body2" display="inline">
              <MahanIcon type={MahanIconType.CancelButton} className={classes.errorIcon} fontSize="small"></MahanIcon>
              &nbsp;
              {errorsCount}
            </Typography>
            {warningsCount && <span>&nbsp;&nbsp;&nbsp;</span>}
          </Fragment>
        )}
        {warningsCount > 0 && (
          <Typography variant="body2" display="inline">
            <MahanIcon type={MahanIconType.Alert} className={classes.warningIcon} fontSize="small"></MahanIcon>
            &nbsp;
            {warningsCount}
          </Typography>
        )}
      </div>

      <ObjectionModal state={objectionModalState} onClose={closeObjectionModal} />
    </Fragment>
  );
};

export default TargetObjectionStatus;
