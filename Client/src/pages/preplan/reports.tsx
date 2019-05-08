import React, { Component } from 'react';
import { Theme, createStyles, WithStyles, withStyles } from '@material-ui/core/styles';
import { RouteComponentProps } from 'react-router-dom';
import SectionList, { SectionItem } from '../../components/SectionList';
import ProposalReport from '../../components/preplan/reports/ProposalReport';
import ConnectionsReport from '../../components/preplan/reports/ConnectionsReport';

const styles = (theme: Theme) => createStyles({});

interface Props extends WithStyles<typeof styles>, RouteComponentProps<{ id?: string; report?: string }> {}

interface PreplanReport extends SectionItem {
  path: string;
}
const preplanReportProposal: PreplanReport = {
  title: 'Proposal',
  description: 'The list of all flights',
  path: 'proposal'
};
const preplanReportConnections: PreplanReport = {
  title: 'Connections',
  description: 'All existing connections between flights',
  path: 'connections'
};
const preplanReports = [preplanReportProposal, preplanReportConnections];

class Reports extends Component<Props> {
  componentDidMount() {
    this.checkUrlAcceptance(this.props);
  }
  shouldComponentUpdate(nextProps: Props) {
    return this.checkUrlAcceptance(nextProps);
  }

  private checkUrlAcceptance(props: Props): boolean {
    const report = this.getPreplanReport(props);
    if (!report && props.match.params.report) {
      props.history.push(props.match.url.slice(0, -props.match.params.report.length));
      return false;
    }
    return true;
  }

  getId = (props?: Props): number => Number((props || this.props).match.params.id);
  getPreplanReport = (props?: Props): PreplanReport | undefined => {
    const reportParam = (props || this.props).match.params.report;
    return preplanReports.find(p => p.path === reportParam);
  };

  sectionSelectHandler = (selectedSection: SectionItem) => {
    const selectedPreplanReport = selectedSection as PreplanReport;
    this.props.history.push(`/preplan/${this.props.match.params.id}/reports/${selectedPreplanReport.path}`);
  };

  render() {
    const selectedPreplanReport = this.getPreplanReport();

    return (
      <SectionList sections={preplanReports} selectedSection={selectedPreplanReport} onSectionSelect={this.sectionSelectHandler}>
        {selectedPreplanReport === preplanReportProposal && <ProposalReport />}
        {selectedPreplanReport === preplanReportConnections && <ConnectionsReport />}
      </SectionList>
    );
  }
}

export default withStyles(styles)(Reports);
