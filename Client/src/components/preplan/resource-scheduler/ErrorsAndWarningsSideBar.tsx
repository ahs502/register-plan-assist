import React, { FC, useState } from 'react';
import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import Search, { filterOnProperties } from '../../../components/Search';
import SideBarContainer from './SideBarContainer';
import ErrorsAndWarningsList from './ErrorsAndWarningsList';
import Objection, { ObjectionType } from '../../../business/Objection';

const useStyles = makeStyles((theme: Theme) => ({
  error: {
    color: theme.palette.extraColors.erroredFlight
  },
  warning: {
    color: theme.palette.extraColors.warnedFlight
  }
}));

export interface ErrorsAndWarningsSideBarProps {
  objections: ReadonlyArray<Readonly<Objection>>;
  initialSearch?: string;
}

const ErrorsAndWarningsSideBar: FC<ErrorsAndWarningsSideBarProps> = ({ objections, initialSearch }) => {
  const [filteredObjections, setFilteredObjections] = useState(objections);

  const classes = useStyles();

  let totalErrorCount = 0,
    totalWarningCount = 0,
    filteredErrorCount = 0,
    filteredWarningCount = 0;

  objections.forEach(objection => {
    objection.type === ObjectionType.Error && totalErrorCount++;
    objection.type === ObjectionType.Warning && totalWarningCount++;
  });
  filteredObjections.forEach(objection => {
    objection.type === ObjectionType.Error && filteredErrorCount++;
    objection.type === ObjectionType.Warning && filteredWarningCount++;
  });

  return (
    <SideBarContainer label="Errors and Warnings">
      <Search initialSearch={initialSearch} onQueryChange={query => setFilteredObjections(filterOnProperties(objections, query, ['message']))} />
      <div>
        <span>
          <span className={classes.error}>ErrorIcon</span>
          {filteredErrorCount !== totalErrorCount && <span>{filteredErrorCount} of </span>}
          {totalErrorCount} Errors
        </span>
        <span>
          <span className={classes.warning}>WarningIcon</span>
          {filteredWarningCount !== totalWarningCount && <span>{filteredWarningCount} of </span>}
          {totalErrorCount} Warnings
        </span>
      </div>
      <ErrorsAndWarningsList objections={filteredObjections} />
    </SideBarContainer>
  );
};

export default ErrorsAndWarningsSideBar;
