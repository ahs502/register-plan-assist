import React, { FC } from 'react';
import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles((theme: Theme) => ({}));

interface ConnectionsReportProps {}

const ConnectionsReport: FC<ConnectionsReportProps> = () => {
  return <div>Connections Report Content</div>;
};

export default ConnectionsReport;
