import React, { FC, useState, Fragment as div, Fragment, useContext } from 'react';
import { Theme, Table, TableHead, TableBody, TableCell, TableRow, Typography, TextField, IconButton, FormControl, Select, Divider, Grow, Collapse } from '@material-ui/core';
import { Clear as RemoveIcon, Check as CheckIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';
import classNames from 'classnames';
import MasterData, { AircraftType } from '@core/master-data';
import { PreplanAircraftRegisters } from 'src/business/preplan/PreplanAircraftRegister';
import Search, { filterOnProperties } from 'src/components/Search';
import useProperty from 'src/utils/useProperty';
import AircraftRegisterOptionsStatus from '@core/types/AircraftRegisterOptionsStatus';
import DummyAircraftRegisterModel from '@core/models/preplan/DummyAircraftRegisterModel';
import AircraftRegisterOptionsModel from '@core/models/preplan/AircraftRegisterOptionsModel';
import { PreplanContext } from 'src/pages/preplan';
import SideBarContainer from 'src/components/preplan/resource-scheduler/SideBarContainer';
import { formFields } from 'src/utils/FormField';

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
  },
  content: {
    height: `calc(100%)`
  },
  body: {
    height: `calc(100% - 82px)`,
    overflow: 'auto'
  },
  bodyWithAddDummy: {
    height: `calc(100% - 188px)`,
    overflow: 'auto'
  }
}));

interface AircraftRegister {
  id: string;
  name: string;
  groups: string[];
  baseAirport: string;
  status: AircraftRegisterOptionsStatus;
}
interface DummyAircraftRegister {
  id: string;
  name: string;
  baseAirport: string;
  status: AircraftRegisterOptionsStatus;
}
interface AircraftRegistersPerType {
  type: AircraftType;
  registers: AircraftRegister[];
  dummyRegisters: DummyAircraftRegister[];
}

interface AddDummyAircraftRegisterForm {
  show: boolean;
  name: string;
  aircraftType: string;
  baseAirport: string;
  status: AircraftRegisterOptionsStatus;
}

const aircraftRegisterOptionsStatusList: readonly { value: AircraftRegisterOptionsStatus; label: string }[] = [
  { value: 'IGNORED', label: 'Ignored' },
  { value: 'BACKUP', label: 'Backup' },
  { value: 'INCLUDED', label: 'Included' }
];

export interface SelectAircraftRegistersSideBarProps {
  initialSearch?: string;
  onApply(dummyAircraftRegisters: readonly DummyAircraftRegisterModel[], aircraftRegisterOptions: AircraftRegisterOptionsModel): void;
  loading?: boolean;
  errorMessage?: string;
}

const SelectAircraftRegistersSideBar: FC<SelectAircraftRegistersSideBarProps> = ({ initialSearch, onApply, loading, errorMessage }) => {
  const preplan = useContext(PreplanContext);

  const dummyAircraftRegisterIdCounter = useProperty(() => Math.max(0, ...preplan.aircraftRegisters.items.filter(r => r.dummy).map(r => Number(r.id.replace('dummy-', '')))));

  const [query, setQuery] = useState<readonly string[]>([]);
  const [list, setList] = useState<AircraftRegistersPerType[]>(() =>
    MasterData.all.aircraftTypes.items.orderBy('displayOrder').map<AircraftRegistersPerType>(t => ({
      type: t,
      registers: preplan.aircraftRegisters.items
        .filter(a => !a.dummy && a.aircraftType.id === t.id)
        .map<AircraftRegister>(a => ({
          id: a.id,
          name: a.name,
          groups: MasterData.all.aircraftRegisterGroups.items.filter(g => g.aircraftRegisters.filter(r => r.id === a.id)).map(g => g.name),
          baseAirport: a.options.baseAirport === undefined ? '' : formFields.airport.format(a.options.baseAirport),
          status: a.options.status
        })),
      dummyRegisters: preplan.aircraftRegisters.items
        .filter(a => a.dummy && a.aircraftType.id === t.id)
        .map<DummyAircraftRegister>(a => ({
          id: a.id,
          name: a.name,
          baseAirport: a.options.baseAirport === undefined ? '' : formFields.airport.format(a.options.baseAirport),
          status: a.options.status
        }))
    }))
  );
  const [addDummyRegisterFormState, setAddDummyRegisterFormState] = useState<AddDummyAircraftRegisterForm>(() => ({
    show: false,
    name: '',
    aircraftType: '',
    baseAirport: '',
    status: 'INCLUDED'
  }));

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
    const aircraftRegisterOptions: AircraftRegisterOptionsModel = { options: [] };
    list.forEach(t => {
      t.registers.forEach(r => {
        const airport = (r.baseAirport && MasterData.all.airports.items.find(a => a.name.toUpperCase() === r.baseAirport.toUpperCase())) || undefined;
        (aircraftRegisterOptions.options as AircraftRegisterOptionsModel['options'][number][]).push({
          aircraftRegisterId: r.id,
          status: r.status,
          baseAirportId: airport && airport.id
        });
      });
      t.dummyRegisters.forEach(r => {
        const airport = (r.baseAirport && MasterData.all.airports.items.find(a => a.name.toUpperCase() === r.baseAirport.toUpperCase())) || undefined;
        (aircraftRegisterOptions.options as AircraftRegisterOptionsModel['options'][number][]).push({
          aircraftRegisterId: r.id,
          status: r.status,
          baseAirportId: airport && airport.id
        });
      });
    });
    onApply(dummyAircraftRegisters, aircraftRegisterOptions);
  }

  const classes = useStyles();

  const addDummyRegisterForm = (
    <Collapse in={addDummyRegisterFormState.show}>
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
              [classes.backupRegister]: addDummyRegisterFormState.status === 'BACKUP',
              [classes.ignoredRegister]: addDummyRegisterFormState.status === 'IGNORED'
            })}
            hover={true}
          >
            <TableCell className={classes.nameCell}>
              <TextField value={addDummyRegisterFormState.name} onChange={event => setAddDummyRegisterFormState({ ...addDummyRegisterFormState, name: event.target.value })} />
            </TableCell>
            <TableCell>
              <TextField
                value={addDummyRegisterFormState.aircraftType}
                onChange={event => setAddDummyRegisterFormState({ ...addDummyRegisterFormState, aircraftType: event.target.value })}
              />
            </TableCell>
            <TableCell className={classes.baseAirportCell}>
              <TextField
                value={addDummyRegisterFormState.baseAirport}
                onChange={event => setAddDummyRegisterFormState({ ...addDummyRegisterFormState, baseAirport: event.target.value })}
              />
            </TableCell>
            <TableCell className={classes.stateCell}>
              <FormControl fullWidth>
                <Select
                  classes={{ select: classes.select }}
                  native
                  variant="outlined"
                  value={addDummyRegisterFormState.status}
                  onChange={event => setAddDummyRegisterFormState({ ...addDummyRegisterFormState, status: event.target.value as AircraftRegisterOptionsStatus })}
                >
                  {aircraftRegisterOptionsStatusList.map(a => (
                    <option key={a.value} value={a.value}>
                      {a.label}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </TableCell>
            <TableCell>
              <IconButton size="small" onClick={() => setAddDummyRegisterFormState({ ...addDummyRegisterFormState, show: false })}>
                <RemoveIcon />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => {
                  const type = MasterData.all.aircraftTypes.items.find(t => t.name.toUpperCase() === addDummyRegisterFormState.aircraftType!.toUpperCase())!;
                  list
                    .find(t => t.type === type)!
                    .dummyRegisters.push({
                      id: `dummy-${dummyAircraftRegisterIdCounter(x => x + 1)}`,
                      name: addDummyRegisterFormState.name!.toUpperCase(),
                      baseAirport: addDummyRegisterFormState.baseAirport!,
                      status: addDummyRegisterFormState.status!
                    });
                  setAddDummyRegisterFormState({ ...addDummyRegisterFormState, show: false });
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
          disabled={loading}
          value={r.baseAirport}
          onChange={event => {
            r.baseAirport = event.target.value;
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
            disabled={loading}
            value={r.status}
            onChange={event => {
              r.status = event.target.value as AircraftRegisterOptionsStatus;
              setList([...list]);
            }}
          >
            {aircraftRegisterOptionsStatusList.map(a => (
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
          disabled={loading}
          onChange={event => {
            r.name = event.target.value;
            setList([...list]);
          }}
        />
      </TableCell>
      <TableCell className={classes.baseAirportCell}>
        <TextField
          value={r.baseAirport}
          disabled={loading}
          onChange={event => {
            r.baseAirport = event.target.value;
            setList([...list]);
          }}
        />
      </TableCell>
      <TableCell className={classes.stateCell}>
        <FormControl fullWidth>
          <Select
            disabled={loading}
            classes={{ select: classes.select }}
            native
            variant="outlined"
            value={r.status}
            onChange={event => {
              r.status = event.target.value as AircraftRegisterOptionsStatus;
              setList([...list]);
            }}
          >
            {aircraftRegisterOptionsStatusList.map(a => (
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
      onAdd={() => setAddDummyRegisterFormState({ show: true, name: '', aircraftType: '', baseAirport: '', status: 'INCLUDED' })}
      label="Select Aircraft Registers"
      loading={loading}
      errorMessage={errorMessage}
    >
      <div className={classes.content}>
        <div className={classes.searchWrapper}>
          <Search disabled={loading} onQueryChange={query => setQuery(query)} />
        </div>

        {addDummyRegisterForm}
        <div className={addDummyRegisterFormState.show ? classes.bodyWithAddDummy : classes.body}>
          {list.map((t, index) => (
            <div key={t.type.id}>
              <Typography variant="h6" display="inline">
                Type: {t.type.name}
              </Typography>
              <Table size="small">
                {tableHead}
                <TableBody>
                  {filterOnProperties(t.registers, query, 'name').map(r => aircraftRegisterRow(t, r))}
                  {filterOnProperties(t.dummyRegisters, query, 'name').map(r => dummyAircraftRegisterRow(t, r))}
                </TableBody>
              </Table>
              {index !== list.length - 1 ? (
                <Fragment>
                  <br />
                  <br />
                </Fragment>
              ) : (
                <Fragment></Fragment>
              )}
            </div>
          ))}
        </div>
      </div>
    </SideBarContainer>
  );
};

export default SelectAircraftRegistersSideBar;
