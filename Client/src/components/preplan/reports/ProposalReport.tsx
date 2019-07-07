import React, { FC } from 'react';
import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import Flight from 'src/view-models/flight/Flight';

const useStyles = makeStyles((theme: Theme) => ({}));

interface ProposalReportProps {
  flights: readonly Flight[];
}

const ProposalReport: FC<ProposalReportProps> = () => {
  return <div>Proposal Report Content</div>;
};

export default ProposalReport;
