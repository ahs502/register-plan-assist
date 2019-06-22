import React, { FC, useState, Fragment } from 'react';
import { Theme, Table, TableHead, TableBody, TableCell, TableRow, Typography, MenuItem, TextField, IconButton, FormControl, Select, InputLabel } from '@material-ui/core';
import { Clear as RemoveIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';
import SideBarContainer from './SideBarContainer';
import Search, { filterOnProperties } from '../../Search';
import MasterData from '../../../business/master-data';
import MasterDataItem from '../../../business/master-data/MasterDataItem';
import Airport from '../../../business/master-data/Airport';
import ItemPicker from '../../ItemPicker';
import AircraftType from '../../../business/master-data/AircraftType';
import classNames from 'classnames';

const useStyles = makeStyles((theme: Theme) => ({
  search: {
    margin: theme.spacing(0, 0, 5, 0)
  },
  formControl: {
    marginTop: theme.spacing(1)
  },
  selectStyle: {
    paddingTop: theme.spacing(0),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(5)
  },
  backupColor: {
    backgroundColor: theme.palette.extraColors.backupRegister
  },
  ignoreColor: {
    backgroundColor: theme.palette.extraColors.excludedRegister
  },
  padding: {
    padding: theme.spacing(1, 2, 0, 0)
  },
  baseColumnStyle: {
    width: theme.spacing(2),
    marginTop: theme.spacing(0.25)
  },
  stateColumnStyle: {
    width: theme.spacing(14.5)
  },
  registerColumnStyle: {
    width: theme.spacing(2),
    paddingLeft: theme.spacing(1)
  },
  typeColumnStyle: {
    width: theme.spacing(2)
  }
}));

export interface SelectAircraftRegistersSideBarProps {
  initialSearch?: string;
}

interface DummyData extends MasterDataItem {
  type: AircraftType;
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

type IfEquals<X, Y, A = X, B = never> = (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? A : B;

type WritableKeys<T> = { [P in keyof T]-?: IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, P> }[keyof T];

type ReadonlyKeys<T> = { [P in keyof T]-?: IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, never, P> }[keyof T];

const ika = allAirports.find(a => a.name === 'IKA');
const collection = registers
  .map(r => {
    const type = aircraftTypes.find(t => t.id === r.aircraftTypeId);
    return {
      name: r.name,
      id: r.id,
      type: type,
      base: ika,
      group: groupTypes[Math.floor(Math.random() * 3)],
      state: state[Math.floor(Math.random() * 3)]
    } as DummyData;
  })
  .sortBy(i => {
    return i.type.name;
  });

const SelectAircraftRegistersSideBar: FC<SelectAircraftRegistersSideBarProps> = ({ initialSearch }) => {
  const [filteredItems, setFilteredItems] = useState(collection as ReadonlyArray<DummyData>);
  const [dummyRegisterList, setDummyRegisterList] = useState([] as ReadonlyArray<DummyData>);

  const handelRemoveDummyRegister = (index: number) => {
    const tempDummyRegisterList = [...dummyRegisterList];
    tempDummyRegisterList.splice(index, 1);
    setDummyRegisterList(tempDummyRegisterList);
  };

  const handleChange = <T extends {}>(
    list: ReadonlyArray<T>,
    index: number,
    propertyName: WritableKeys<T>,
    newValue: any,
    settter: (value: React.SetStateAction<ReadonlyArray<T>>) => void
  ) => {
    const tempList = [...list];
    tempList[index][propertyName] = newValue;

    settter(tempList);
  };

  const classes = useStyles();
  return (
    <SideBarContainer
      onApply={() => {
        alert('TODO: Data Model Must save in database...');
      }}
      onAdd={() => {
        const tempDummyRegisterList = [...dummyRegisterList];
        tempDummyRegisterList.push({
          id: Date.now().toString(),
          name: '',

          base: ika,
          group: '',
          state: ''
        } as DummyData);
        setDummyRegisterList(tempDummyRegisterList);
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
              <TableCell className={classNames(classes.padding, classes.registerColumnStyle)}>
                <Typography variant="body2">Register</Typography>
              </TableCell>
              <TableCell className={classNames(classes.padding, classes.typeColumnStyle)}>
                <Typography variant="body2">Type</Typography>
              </TableCell>
              <TableCell className={classNames(classes.padding, classes.baseColumnStyle)}>
                <Typography variant="body2" align="left">
                  Base
                </Typography>
              </TableCell>
              <TableCell className={classes.padding}>
                <Typography variant="body2">State</Typography>
              </TableCell>
              <TableCell className={classes.padding}>
                <Typography variant="body2">Group</Typography>
              </TableCell>
              <TableCell className={classes.padding} />
            </TableRow>
          </TableHead>
          <TableBody>
            {dummyRegisterList.map((item, i) => {
              return (
                <TableRow key={item.id} className={item.state === 'Backup' ? classes.backupColor : item.state === 'Ignore' ? classes.ignoreColor : ''}>
                  <TableCell className={classNames(classes.padding, classes.registerColumnStyle)}>
                    <TextField />
                  </TableCell>
                  <TableCell className={classNames(classes.padding, classes.typeColumnStyle)}>
                    <ItemPicker
                      sources={aircraftTypes}
                      fieldName="name"
                      defaultValue={item.type}
                      onItemSelect={newValue => {
                        handleChange(filteredItems, i, 'type', newValue, setFilteredItems);
                      }}
                    />
                  </TableCell>
                  <TableCell className={classNames(classes.padding, classes.baseColumnStyle)}>
                    <ItemPicker
                      sources={allAirports}
                      fieldName="name"
                      defaultValue={item.base}
                      onItemSelect={newValue => {
                        handleChange(dummyRegisterList, i, 'base', newValue, setDummyRegisterList);
                      }}
                    />
                  </TableCell>
                  <TableCell className={classNames(classes.padding, classes.stateColumnStyle)}>
                    <FormControl fullWidth className={classes.formControl}>
                      <Select
                        classes={{ select: classes.selectStyle }}
                        native
                        variant="outlined"
                        value={item.state}
                        onChange={(event, child) => {
                          handleChange(dummyRegisterList, i, 'state', event.target.value, setDummyRegisterList);
                        }}
                      >
                        {Array.range(0, 2).map(i => {
                          return (
                            <option key={i} value={state[i]}>
                              {state[i]}
                            </option>
                          );
                        })}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell className={classes.padding} />
                  <TableCell className={classes.padding}>
                    <IconButton
                      size="small"
                      onClick={() => {
                        // console.log(i);
                        handelRemoveDummyRegister(i);
                      }}
                    >
                      <RemoveIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
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
                  <TableRow className={item.state === 'Backup' ? classes.backupColor : item.state === 'Ignore' ? classes.ignoreColor : ''}>
                    <TableCell className={classNames(classes.padding, classes.registerColumnStyle)}>
                      <Typography variant="body2">{item.name}</Typography>
                    </TableCell>
                    <TableCell className={classNames(classes.padding, classes.typeColumnStyle)}>
                      <Typography variant="body2">{item.type.name}</Typography>
                    </TableCell>

                    <TableCell className={classNames(classes.padding, classes.baseColumnStyle)}>
                      <ItemPicker
                        className={classes.baseColumnStyle}
                        sources={allAirports}
                        fieldName="name"
                        defaultValue={item.base}
                        onItemSelect={newValue => {
                          handleChange(filteredItems, i, 'base', newValue, setFilteredItems);
                        }}
                      />
                    </TableCell>
                    <TableCell className={classNames(classes.padding, classes.stateColumnStyle)}>
                      <FormControl fullWidth className={classes.formControl}>
                        <Select
                          classes={{ select: classes.selectStyle }}
                          native
                          variant="outlined"
                          value={item.state}
                          onChange={(event, child) => {
                            handleChange(filteredItems, i, 'state', event.target.value, setFilteredItems);
                          }}
                        >
                          {Array.range(0, 2).map(i => {
                            return (
                              <option key={i} value={state[i]}>
                                {state[i]}
                              </option>
                            );
                          })}
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell className={classes.padding}>
                      <Typography variant="body2">{item.group}</Typography>
                    </TableCell>
                    <TableCell className={classes.padding} />
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
