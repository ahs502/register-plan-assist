import React, { FC, useState, Fragment } from 'react';
import { Theme, Table, TableHead, TableBody, TableCell, TableRow, Typography, TextField, IconButton, FormControl, Select, Divider, Grow, Collapse } from '@material-ui/core';
import { Clear as RemoveIcon, Check as CheckIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';
import SideBarContainer from './SideBarContainer';
import classNames from 'classnames';
import AircraftRegisterStatus from '@core/types/aircraft-register-options/AircraftRegisterStatus';
import DummyAircraftRegisterModel from '@core/models/DummyAircraftRegisterModel';
import { AircraftRegisterOptionsDictionaryModel } from '@core/models/AircraftRegisterOptionsModel';
import MasterData, { Airport, AircraftType } from '@core/master-data';
import { PreplanAircraftRegisters } from 'src/view-models/PreplanAircraftRegister';
import Search, { filterOnProperties } from 'src/components/Search';

const useStyles = makeStyles((theme: Theme) => ({
  searchWrapper: {
    margin: theme.spacing(0, 0, 5, 0)
  },
  nameCell: {
    width: 80
  },
  baseAirportCell: {
    width: 90
  },
  stateCell: {
    width: 130
  },
  select: {
    width: '100%',
    paddingRight: 0
  },
  backupRegister: {
    backgroundColor: theme.palette.extraColors.backupRegister
  },
  ignoredRegister: {
    backgroundColor: theme.palette.extraColors.ignoredRegister
  }
}));

interface AircraftRegister {
  id: string;
  name: string;
  groups: string[];
  baseAirport: string;
  status: AircraftRegisterStatus;
}
interface DummyAircraftRegister {
  id: string;
  name: string;
  baseAirport: string;
  status: AircraftRegisterStatus;
}
interface AircraftRegistersPerType {
  type: AircraftType;
  registers: AircraftRegister[];
  dummyRegisters: DummyAircraftRegister[];
}
type AircraftRegisters = AircraftRegistersPerType[];

interface AddDummyAircraftRegisterForm {
  show: boolean;
  name: string;
  aircraftType: string;
  baseAirport: string;
  status: AircraftRegisterStatus;
}

const aircraftRegisterStatusList: readonly { value: AircraftRegisterStatus; label: string }[] = [
  { value: 'IGNORED', label: 'Ignored' },
  { value: 'BACKUP', label: 'Backup' },
  { value: 'INCLUDED', label: 'Included' }
];

export interface SelectAircraftRegistersSideBarProps {
  initialSearch?: string;
  aircraftRegisters: PreplanAircraftRegisters;
  onApply(dummyAircraftRegisters: readonly DummyAircraftRegisterModel[], aircraftRegisterOptionsDictionary: AircraftRegisterOptionsDictionaryModel): void;
}

const SelectAircraftRegistersSideBar: FC<SelectAircraftRegistersSideBarProps> = ({ initialSearch, aircraftRegisters, onApply }) => {
  let dummyAircraftRegisterIdCounter: number = 1;

  const [query, setQuery] = useState<readonly string[]>([]);
  const [list, setList] = useState<AircraftRegisters>(() => {
    dummyAircraftRegisterIdCounter =
      (aircraftRegisters.items
        .filter(r => r.dummy)
        .map(r => Number(r.id.replace('dummy-', '')))
        .sort()
        .reverse()[0] || 0) + 1;

    return MasterData.all.aircraftTypes.items.orderBy('displayOrder').map(t => {
      const registers = aircraftRegisters.items
        .filter(a => !a.dummy && a.aircraftType.id === t.id)
        .map(a => ({
          id: a.id,
          name: a.name,
          groups: MasterData.all.aircraftGroups.items.filter(g => g.aircraftRegisters.filter(r => r.id === a.id)).map(g => g.name),
          baseAirport: a.options.startingAirport ? a.options.startingAirport.name : '',
          status: a.options.status
        }));
      const dummyRegisters = aircraftRegisters.items
        .filter(a => a.dummy && a.aircraftType.id === t.id)
        .map(a => ({
          id: a.id,
          name: a.name,
          baseAirport: a.options.startingAirport ? a.options.startingAirport.name : '',
          status: a.options.status
        }));
      return {
        type: t,
        registers,
        filteredRegisters: registers,
        dummyRegisters,
        filteredDummyRegisters: dummyRegisters
      };
    });
  });
  const [addDummyRegisterFormModel, setAddDummyRegisterFormModel] = useState<AddDummyAircraftRegisterForm>({
    show: false,
    name: '',
    aircraftType: '',
    baseAirport: '',
    status: 'INCLUDED'
  });

  function applyHandler() {
    const dummyAircraftRegisters: DummyAircraftRegisterModel[] = list
      .map(t =>
        t.dummyRegisters.map(r => ({
          id: r.id,
          name: r.name.toUpperCase(),
          aircraftTypeId: t.type.id
        }))
      )
      .reduce((a, l) => a.concat(l), [] as DummyAircraftRegisterModel[]);
    const aircraftRegisterOptionsDictionary: AircraftRegisterOptionsDictionaryModel = {};
    list.forEach(t => {
      t.registers.forEach(
        r =>
          ((aircraftRegisterOptionsDictionary[r.id] as any) = {
            status: r.status,
            startingAirportId: MasterData.all.airports.items.find(a => a.name.toUpperCase() === r.baseAirport.toUpperCase())!.id
          })
      );
      t.dummyRegisters.forEach(
        r =>
          ((aircraftRegisterOptionsDictionary[r.id] as any) = {
            status: r.status,
            startingAirportId: MasterData.all.airports.items.find(a => a.name.toUpperCase() === r.baseAirport.toUpperCase())!.id
          })
      );
    });
    //TODO: Validate those models...
    onApply(dummyAircraftRegisters, aircraftRegisterOptionsDictionary);
  }

  const classes = useStyles();

  const addDummyRegisterForm = (
    <Collapse in={addDummyRegisterFormModel.show}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>
              <Typography variant="body2">Reg.</Typography>
            </TableCell>
            <TableCell>
              <Typography variant="body2">Type</Typography>
            </TableCell>
            <TableCell>
              <Typography variant="body2" align="left">
                Base
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="body2">State</Typography>
            </TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow
            className={classNames({
              [classes.backupRegister]: addDummyRegisterFormModel.status === 'BACKUP',
              [classes.ignoredRegister]: addDummyRegisterFormModel.status === 'IGNORED'
            })}
            hover={true}
          >
            <TableCell className={classes.nameCell}>
              <TextField
                value={addDummyRegisterFormModel.name}
                onChange={e => {
                  setAddDummyRegisterFormModel({ ...addDummyRegisterFormModel, name: e.target.value });
                }}
              />
            </TableCell>
            <TableCell>
              <TextField
                value={addDummyRegisterFormModel.aircraftType}
                onChange={e => {
                  setAddDummyRegisterFormModel({ ...addDummyRegisterFormModel, aircraftType: e.target.value });
                }}
              />
            </TableCell>
            <TableCell className={classes.baseAirportCell}>
              <TextField
                value={addDummyRegisterFormModel.baseAirport}
                onChange={e => {
                  setAddDummyRegisterFormModel({ ...addDummyRegisterFormModel, baseAirport: e.target.value });
                }}
              />
            </TableCell>
            <TableCell className={classes.stateCell}>
              <FormControl fullWidth>
                <Select
                  classes={{ select: classes.select }}
                  native
                  variant="outlined"
                  value={addDummyRegisterFormModel.status}
                  onChange={e => {
                    setAddDummyRegisterFormModel({ ...addDummyRegisterFormModel, status: e.target.value as AircraftRegisterStatus });
                  }}
                >
                  {aircraftRegisterStatusList.map(a => (
                    <option key={a.value} value={a.value}>
                      {a.label}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </TableCell>
            <TableCell>
              <IconButton size="small" onClick={() => setAddDummyRegisterFormModel({ ...addDummyRegisterFormModel, show: false })}>
                <RemoveIcon />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => {
                  const type = MasterData.all.aircraftTypes.items.find(t => t.name.toUpperCase() === addDummyRegisterFormModel.aircraftType!.toUpperCase())!;
                  list
                    .find(t => t.type === type)!
                    .dummyRegisters.push({
                      id: `dummy-${dummyAircraftRegisterIdCounter++}`,
                      name: addDummyRegisterFormModel.name!.toUpperCase(),
                      baseAirport: addDummyRegisterFormModel.baseAirport!,
                      status: addDummyRegisterFormModel.status!
                    });
                  setAddDummyRegisterFormModel({ ...addDummyRegisterFormModel, show: false });
                }}
              >
                <CheckIcon />
              </IconButton>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Collapse>
  );
  const tableHead = (
    <TableHead>
      <TableRow>
        <TableCell>
          <Typography variant="body2">Reg.</Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2" align="left">
            Base
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2">State</Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2">Group</Typography>
        </TableCell>
        <TableCell />
      </TableRow>
    </TableHead>
  );
  const aircraftRegisterRow = (t: AircraftRegistersPerType, r: AircraftRegister) => (
    <TableRow key={r.id} hover={true} className={classNames({ [classes.backupRegister]: r.status === 'BACKUP', [classes.ignoredRegister]: r.status === 'IGNORED' })}>
      <TableCell className={classes.nameCell}>
        <Typography variant="body2">{r.name}</Typography>
      </TableCell>
      <TableCell className={classes.baseAirportCell}>
        <TextField
          value={r.baseAirport}
          onChange={e => {
            r.baseAirport = e.target.value;
            setList([...list]);
          }}
        />
      </TableCell>
      <TableCell className={classes.stateCell}>
        <FormControl fullWidth>
          <Select
            classes={{ select: classes.select }}
            native
            variant="outlined"
            value={r.status}
            onChange={e => {
              r.status = e.target.value as AircraftRegisterStatus;
              setList([...list]);
            }}
          >
            {aircraftRegisterStatusList.map(a => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </Select>
        </FormControl>
      </TableCell>
      <TableCell colSpan={2}>
        <Typography variant="body2">{r.groups.join(', ')}</Typography>
      </TableCell>
    </TableRow>
  );
  const dummyAircraftRegisterRow = (t: AircraftRegistersPerType, r: DummyAircraftRegister) => (
    <TableRow key={r.id} hover={true} className={classNames({ [classes.backupRegister]: r.status === 'BACKUP', [classes.ignoredRegister]: r.status === 'IGNORED' })}>
      <TableCell className={classes.nameCell}>
        <TextField
          value={r.name}
          onChange={e => {
            r.name = e.target.value;
            setList([...list]);
          }}
        />
      </TableCell>
      <TableCell className={classes.baseAirportCell}>
        <TextField
          value={r.baseAirport}
          onChange={e => {
            r.baseAirport = e.target.value;
            setList([...list]);
          }}
        />
      </TableCell>
      <TableCell className={classes.stateCell}>
        <FormControl fullWidth>
          <Select
            classes={{ select: classes.select }}
            native
            variant="outlined"
            value={r.status}
            onChange={e => {
              r.status = e.target.value as AircraftRegisterStatus;
              setList([...list]);
            }}
          >
            {aircraftRegisterStatusList.map(a => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </Select>
        </FormControl>
      </TableCell>
      <TableCell />
      <TableCell>
        <IconButton
          size="small"
          onClick={() => {
            t.dummyRegisters.remove(r);
            setList([...list]);
          }}
        >
          <RemoveIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );

  return (
    <SideBarContainer
      onApply={applyHandler}
      onAdd={() => setAddDummyRegisterFormModel({ show: true, name: '', aircraftType: '', baseAirport: '', status: 'INCLUDED' })}
      label="Select Aircraft Registers"
    >
      <div className={classes.searchWrapper}>
        <Search onQueryChange={query => setQuery(query)} />
      </div>

      {addDummyRegisterForm}
      {list.map(t => (
        <Fragment key={t.type.id}>
          <br />
          <br />
          <Typography variant="h6" display="inline">
            Type: {t.type.name}
          </Typography>
          <Table size="small">
            {tableHead}
            <TableBody>
              {filterOnProperties(t.registers, query, ['name']).map(r => aircraftRegisterRow(t, r))}
              {filterOnProperties(t.dummyRegisters, query, ['name']).map(r => dummyAircraftRegisterRow(t, r))}
            </TableBody>
          </Table>
        </Fragment>
      ))}
    </SideBarContainer>
  );
};

export default SelectAircraftRegistersSideBar;
