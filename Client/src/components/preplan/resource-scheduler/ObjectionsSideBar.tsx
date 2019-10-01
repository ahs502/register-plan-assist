import React, { FC, useState, Fragment } from 'react';
import { Theme, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import Search, { filterOnProperties } from 'src/components/Search';
import SideBarContainer from './SideBarContainer';
import ObjectionList from './ObjectionList';
import Objection from 'src/business/constraints/Objection';
import MahanIcon, { MahanIconType } from 'src/components/MahanIcon';

const useStyles = makeStyles((theme: Theme) => ({
  errorIcon: {
    color: theme.palette.extraColors.erroredFlight
  },
  warningIcon: {
    color: theme.palette.extraColors.warnedFlight
  },
  content: {
    height: `calc(100% - 24px)`
  },
  body: {
    height: `calc(100% - 72px)`,
    overflow: 'auto'
  }
}));

export interface ObjectionsSideBarProps {
  objections: readonly Objection[];
  initialSearch?: string;
}

const ObjectionsSideBar: FC<ObjectionsSideBarProps> = ({ objections, initialSearch }) => {
  const [filteredObjections, setFilteredObjections] = useState(objections);

  const classes = useStyles();

  let totalErrorCount = 0,
    totalWarningCount = 0,
    filteredErrorCount = 0,
    filteredWarningCount = 0;

  objections.forEach(objection => {
    objection.type === 'ERROR' && totalErrorCount++;
    objection.type === 'WARNING' && totalWarningCount++;
  });
  filteredObjections.forEach(objection => {
    objection.type === 'ERROR' && filteredErrorCount++;
    objection.type === 'WARNING' && filteredWarningCount++;
  });

  return (
    <SideBarContainer label="Errors and Warnings">
      {totalErrorCount + totalWarningCount > 0 ? (
        <div className={classes.content}>
          <Search
            initialSearch={initialSearch}
            onQueryChange={query => setFilteredObjections(filterOnProperties(objections as readonly { message: string }[], query, 'message') as any)}
          />

          <br />

          {!!totalErrorCount && (
            <Fragment>
              <Typography variant="body2" display="inline">
                <MahanIcon type={MahanIconType.CancelButton} className={classes.errorIcon} fontSize="small"></MahanIcon>
                &nbsp;
                {filteredErrorCount !== totalErrorCount && <span>{filteredErrorCount} of </span>}
                {totalErrorCount} Errors
              </Typography>
              &nbsp;&nbsp;&nbsp;
            </Fragment>
          )}
          {!!totalWarningCount && (
            <Typography variant="body2" display="inline">
              <MahanIcon type={MahanIconType.Alert} className={classes.warningIcon} fontSize="small"></MahanIcon>
              &nbsp;
              {filteredWarningCount !== totalWarningCount && <span>{filteredWarningCount} of </span>}
              {totalWarningCount} Warnings
            </Typography>
          )}

          <br />
          <div className={classes.body}>
            <ObjectionList objections={filteredObjections} />
          </div>
        </div>
      ) : (
        <Typography variant="subtitle1">There are no objections!</Typography>
      )}
    </SideBarContainer>
  );
};

export default ObjectionsSideBar;
