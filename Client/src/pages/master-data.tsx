import React, { FC, Fragment, useEffect } from 'react';
import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import NavBar from 'src/components/NavBar';
import SectionList, { SectionItem } from 'src/components/SectionList';
import AircraftGroupsMasterData from 'src/components/master-data/AircraftGroupsMasterData';
import ConstraintsMasterData from 'src/components/master-data/ConstraintsMasterData';
import useRouter from 'src/utils/useRouter';

const useStyles = makeStyles((theme: Theme) => ({}));

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

const MasterDataPage: FC = () => {
  const classes = useStyles();

  const { match, history } = useRouter<{ table?: string }>();
  const masterDataTable = masterDataTables.find(t => t.path === match.params.table);

  useEffect(() => {
    if (!masterDataTable && match.params.table) {
      history.push('/master-data');
    }
  });

  return (
    <Fragment>
      <NavBar
        backLink="/preplan-list"
        navBarLinks={[{ title: 'Master Data', link: '/master-data' }, masterDataTable && { title: masterDataTable.title, link: `/master-data/${masterDataTable.path}` }]}
      />
      <SectionList
        sections={masterDataTables}
        selectedSection={masterDataTable}
        onSectionSelect={selectedSection => history.push(`/master-data/${(selectedSection as MasterDataTable).path}`)}
      >
        {masterDataTable === aircraftGroupsMasterDataTable && <AircraftGroupsMasterData />}
        {masterDataTable === constraintsMasterDataTable && <ConstraintsMasterData />}
      </SectionList>
    </Fragment>
  );
};

export default MasterDataPage;
