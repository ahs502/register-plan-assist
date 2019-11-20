import React, { FC, useState, Fragment, useContext } from 'react';
import { Theme, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import Search, { filterOnProperties } from 'src/components/Search';
import { PreplanContext } from 'src/pages/preplan';
import SideBarContainer from 'src/components/preplan/timeline/SideBarContainer';
import ObjectionStatus from 'src/components/preplan/ObjectionStatus';
import ObjectionList from 'src/components/preplan/ObjectionList';
import Objectionable from 'src/business/constraints/Objectionable';

const useStyles = makeStyles((theme: Theme) => ({
  content: {
    height: `calc(100%)`
  },
  body: {
    height: `calc(100% - 85px)`,
    overflow: 'auto'
  }
}));

export interface ObjectionsSideBarProps {
  initialSearch?: string;
  onClick(target: Objectionable): void;
}

const ObjectionsSideBar: FC<ObjectionsSideBarProps> = ({ initialSearch, onClick }) => {
  const preplan = useContext(PreplanContext);

  const [filteredObjections, setFilteredObjections] = useState(preplan.constraintSystem.objections);

  const classes = useStyles();

  return (
    <SideBarContainer label="Errors and Warnings">
      {preplan.constraintSystem.objections.length > 0 ? (
        <div className={classes.content}>
          <Search initialSearch={initialSearch} onQueryChange={query => setFilteredObjections(filterOnProperties(preplan.constraintSystem.objections, query, 'message'))} />
          <br />
          <ObjectionStatus objections={preplan.constraintSystem.objections} filteredObjections={filteredObjections} />
          <br />
          <div className={classes.body}>
            <ObjectionList objections={filteredObjections} onClick={onClick} />
          </div>
        </div>
      ) : (
        <Typography variant="subtitle1">Nothing!</Typography>
      )}
    </SideBarContainer>
  );
};

export default ObjectionsSideBar;
