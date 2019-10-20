import React, { FC, Fragment } from 'react';
import { Theme, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import MahanIcon, { MahanIconType } from 'src/components/MahanIcon';

const useStyles = makeStyles((theme: Theme) => ({
  errorIcon: {
    color: theme.palette.extraColors.erroredFlight
  },
  warningIcon: {
    color: theme.palette.extraColors.warnedFlight
  }
}));

export interface ObjectionStatusProps {
  errorsCount: number;
  filteredErrorsCount?: number;
  warningsCount: number;
  filteredWarningsCount?: number;
}

const ObjectionComponenet: FC<ObjectionStatusProps> = ({ errorsCount, filteredErrorsCount, warningsCount, filteredWarningsCount }) => {
  const classes = useStyles();

  return (
    <div>
      {errorsCount && (
        <Fragment>
          <Typography variant="body2" display="inline">
            <MahanIcon type={MahanIconType.CancelButton} className={classes.errorIcon} fontSize="small"></MahanIcon>
            &nbsp;
            {filteredErrorsCount !== undefined && <Fragment>{filteredErrorsCount} / </Fragment>}
            {errorsCount}
          </Typography>
          {warningsCount && <span>&nbsp;&nbsp;&nbsp;</span>}
        </Fragment>
      )}
      {warningsCount && (
        <Typography variant="body2" display="inline">
          <MahanIcon type={MahanIconType.Alert} className={classes.warningIcon} fontSize="small"></MahanIcon>
          &nbsp;
          {filteredWarningsCount !== undefined && <Fragment>{filteredWarningsCount} / </Fragment>}
          {warningsCount}
        </Typography>
      )}
    </div>
  );
};

export default ObjectionComponenet;
