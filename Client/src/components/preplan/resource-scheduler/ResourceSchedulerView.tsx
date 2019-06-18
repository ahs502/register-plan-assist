import React, { FC } from 'react';
import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    // border: '1px solid red',
    width: '100%',
    height: 'calc(100vh - 159px)',
    backgroundColor: 'yellow'
  }
}));

export interface ResourceSchedulerViewProps {}

const ResourceSchedulerView: FC<ResourceSchedulerViewProps> = () => {
  const classes = useStyles();

  return <div className={classes.root}>vis.js</div>;
};

export default ResourceSchedulerView;
