import React, { FC, useEffect, Fragment, useContext } from 'react';
import { Theme, Portal } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import SectionList, { SectionItem } from 'src/components/SectionList';
import { NavBarToolsContainerContext, PreplanContext } from 'src/pages/preplan';
import ProposalReport from 'src/components/preplan/reports/ProposalReport';
import ConnectionsReport from 'src/components/preplan/reports/ConnectionsReport';
import { useRouteMatch, useHistory } from 'react-router-dom';

const useStyles = makeStyles((theme: Theme) => ({}));

interface PreplanReport extends SectionItem {
  path: string;
}
const proposalPreplanReport: PreplanReport = {
  title: 'Proposal',
  description: 'The list of all flights',
  path: 'proposal'
};
const connectionsPpreplanReport: PreplanReport = {
  title: 'Connections',
  description: 'All existing connections between flights',
  path: 'connections'
};
const preplanReports = [proposalPreplanReport, connectionsPpreplanReport];

export interface ReportsPageProps {}

const ReportsPage: FC<ReportsPageProps> = ({}) => {
  const navBarToolsContainer = useContext(NavBarToolsContainerContext);
  const preplan = useContext(PreplanContext);

  const history = useHistory();
  const routeMatch = useRouteMatch<{ id: string; report: string }>()!;
  const preplanReport = preplanReports.find(r => r.path === routeMatch.params.report);

  const classes = useStyles();

  useEffect(() => {
    if (!preplanReport && routeMatch.params.report) {
      history.push(`/preplan/${routeMatch.params.id}/reports`);
    }
  });

  return (
    <Fragment>
      <Portal container={navBarToolsContainer}>
        <span />
      </Portal>
      <SectionList
        sections={preplanReports}
        selectedSection={preplanReport}
        onSectionSelect={selectedSection => history.push(`/preplan/${routeMatch.params.id}/reports/${(selectedSection as PreplanReport).path}`)}
      >
        {preplanReport === proposalPreplanReport && <ProposalReport flights={preplan.flights} preplanName={preplan.name} fromDate={preplan.startDate} toDate={preplan.endDate} />}
        {preplanReport === connectionsPpreplanReport && (
          <ConnectionsReport preplanName={preplan.name} flights={preplan.flightLegs} fromDate={preplan.startDate} toDate={preplan.endDate} />
        )}
      </SectionList>
    </Fragment>
  );
};

export default ReportsPage;
