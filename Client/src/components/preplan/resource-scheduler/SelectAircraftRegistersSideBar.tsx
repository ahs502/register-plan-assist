import React, { FC, useState, Fragment } from 'react';
import { Theme, Table, TableHead, TableBody, TableCell, TableRow, Typography, MenuItem } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import SideBarContainer from './SideBarContainer';
import Search, { filterOnProperties } from '../../Search';
import MasterData from '../../../business/master-data';
import MasterDataItem from '../../../business/master-data/MasterDataItem';
import AutoComplete from '../../AutoComplete';
import Airport from '../../../business/master-data/Airport';

const useStyles = makeStyles((theme: Theme) => ({
  search: {
    margin: theme.spacing(0, 2)
  }
}));

export interface SelectAircraftRegistersSideBarProps {
  initialSearch?: string;
}

interface DummyData extends MasterDataItem {
  type: string;
  base: Airport;
  group: string;
  state: string;
}

const registers = MasterData.all.aircraftRegisters.items;
const aircraftTypes = MasterData.all.aircraftTypes.items;
const allAirports = MasterData.all.airports.items;
enum groupTypes {
  'GPS',
  'RJ',
  'ACT'
}

enum state {
  'Include',
  'Backup',
  'Ignore'
}
const ika = allAirports.find(a => a.name === 'IKA');
const collection = registers
  .map(r => {
    const type = aircraftTypes.find(t => t.id === r.aircraftTypeId);
    return {
      name: r.name,
      id: r.id,
      type: type ? type.name : '',
      base: ika,
      group: groupTypes[Math.floor(Math.random() * 3)],
      state: state[Math.floor(Math.random() * 3)]
    } as DummyData;
  })
  .sortBy('type');

const SelectAircraftRegistersSideBar: FC<SelectAircraftRegistersSideBarProps> = ({ initialSearch }) => {
  debugger;

  const [filteredItems, setFilteredItems] = useState(collection as ReadonlyArray<DummyData>);
  var temp = Array.range(0, registers.length).map(r => ika);
  const [selectedAirport, setSelectedAirport] = useState(temp);
  const classes = useStyles();
  return (
    <SideBarContainer
      onAction={() => {
        alert('TODO: Data Model Must save in database...');
      }}
      label="Select Aircraft Registers"
    >
      <div className={classes.search}>
        <Search
          onQueryChange={query => {
            const f = filterOnProperties(collection as ReadonlyArray<DummyData>, query, ['name']);
            //onItemUnselect && onItemUnselect();
            setFilteredItems(f as ReadonlyArray<DummyData>);
          }}
        />
      </div>

      <div>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography variant="body2">Register</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">Type</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">Group</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">Base</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">State</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredItems.map((item, i) => {
              return (
                <Fragment key={item.id}>
                  {i > 0 && item.type !== filteredItems[i - 1].type ? (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <br />
                        <br />
                      </TableCell>
                    </TableRow>
                  ) : (
                    <Fragment />
                  )}
                  <TableRow>
                    <TableCell>
                      <Typography variant="body2">{item.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{item.type}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{item.group}</Typography>
                    </TableCell>
                    <TableCell>
                      {/* <AutoComplete
                        key={item.id}
                        options={allAirports}
                        variant="outlined"
                        value={selectedAirport[i]}
                        getOptionLabel={r => r.name}
                        getOptionValue={r => r.id}
                        onChange={(newValue, action) => {
                          const newSelectedAirport = [...selectedAirport];
                          newSelectedAirport[i] = newValue as Airport;
                          setSelectedAirport(newSelectedAirport);
                          console.log(newValue, item.id);
                        }}
                      /> */}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{item.state}</Typography>
                    </TableCell>
                  </TableRow>
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </SideBarContainer>
  );
};

export default SelectAircraftRegistersSideBar;
