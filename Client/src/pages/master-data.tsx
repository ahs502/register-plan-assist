import React, { Component, Fragment } from 'react';
import { WithStyles, createStyles, withStyles, Theme } from '@material-ui/core/styles';
import { RouteComponentProps } from 'react-router-dom';
import NavBar from '../components/NavBar';
import SectionList, { SectionItem } from '../components/SectionList';
import AircraftGroupsMasterData from '../components/master-data/AircraftGroupsMasterData';
import ConstraintsMasterData from '../components/master-data/ConstraintsMasterData';

const styles = (theme: Theme) => createStyles({});

interface Props extends WithStyles<typeof styles>, RouteComponentProps<{ table?: string }> {}

interface MasterDataTable extends SectionItem {
  path: string;
}

const aircraftGroupsMasterDataTable: MasterDataTable = {
  title: 'Aircraft Groups',
  description: 'All defined groups of aircrafts',
  path: 'aircraft-groups'
};
const constraintsMasterDataTable: MasterDataTable = {
  title: 'Constraints',
  description: 'All existing constraints in the organization',
  path: 'constraints'
};
const masterDataTables = [aircraftGroupsMasterDataTable, constraintsMasterDataTable];

class MasterDataPage extends Component<Props> {
  componentDidMount() {
    this.checkUrlAcceptance(this.props);
  }
  shouldComponentUpdate(nextProps: Props) {
    if (!this.checkUrlAcceptance(nextProps)) return false;
    //TODO: update master data table in state from next props
    return true;
  }

  private checkUrlAcceptance(props: Props): boolean {
    const table = this.getMasterDataTable(props);
    if (!table && props.match.params.table) {
      props.history.push(props.match.url.slice(0, -props.match.params.table.length));
      return false;
    }
    return true;
  }

  getMasterDataTable = (props?: Props): MasterDataTable | undefined => {
    const tableParam = (props || this.props).match.params.table;
    return masterDataTables.find(t => t.path === tableParam);
  };

  sectionSelectHandler = (selectedSection: SectionItem) => {
    const selectedMasterDataTable = selectedSection as MasterDataTable;
    this.props.history.push(`/master-data/${selectedMasterDataTable.path}`);
  };

  render() {
    const selectedMasterDataTable = this.getMasterDataTable();

    return (
      <Fragment>
        <NavBar
          backLink="/preplan-list"
          navBarLinks={[
            { title: 'Master Data', link: '/master-data' },
            selectedMasterDataTable && { title: selectedMasterDataTable.title, link: `/master-data/${selectedMasterDataTable.path}` }
          ]}
        />
        <SectionList sections={masterDataTables} selectedSection={selectedMasterDataTable} onSectionSelect={this.sectionSelectHandler}>
          {selectedMasterDataTable === aircraftGroupsMasterDataTable && <AircraftGroupsMasterData />}
          {selectedMasterDataTable === constraintsMasterDataTable && <ConstraintsMasterData />}
        </SectionList>
      </Fragment>
    );
  }
}

export default withStyles(styles)(MasterDataPage);
