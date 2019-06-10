import React, { FC } from 'react';
import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles((theme: Theme) => ({}));

interface ProposalReportProps {}

const ProposalReport: FC<ProposalReportProps> = () => {
  return <div>Proposal Report Content</div>;
};

export default ProposalReport;
