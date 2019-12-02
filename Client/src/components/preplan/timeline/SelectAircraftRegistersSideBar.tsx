import React, { FC, useState, Fragment, useContext } from 'react';
import { Theme, Table, TableHead, TableBody, TableCell, TableRow, Typography, TextField, IconButton, FormControl, Select, Collapse } from '@material-ui/core';
import { Clear as RemoveIcon, Check as CheckIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';
import classNames from 'classnames';
import MasterData, { AircraftType } from '@core/master-data';
import Search, { filterOnProperties } from 'src/components/Search';
import useProperty from 'src/utils/useProperty';
import AircraftRegisterOptionsStatus from '@core/types/AircraftRegisterOptionsStatus';
import DummyAircraftRegisterModel from '@core/models/preplan/DummyAircraftRegisterModel';
import AircraftRegisterOptionsModel from '@core/models/preplan/AircraftRegisterOptionsModel';
import { PreplanContext } from 'src/pages/preplan';
import SideBarContainer from 'src/components/preplan/timeline/SideBarContainer';
import { dataTypes } from 'src/utils/DataType';
import RefiningTextField from 'src/components/RefiningTextField';
import {
  AircraftRegisterViewState,
  ViewState,
  DummyAircraftRegisterViewState,
  AddDummyAircraftRegisterFormState,
  AircraftRegistersPerTypeViewState,
  AddDummyAircraftRegisterFormStateValidation,
  ViewStateValidation
} from 'src/components/preplan/timeline/SelectAircraftRegistersSideBar.types';
import Id from '@core/types/Id';

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
  const [list, setList] = useState<ViewState>(() =>
    MasterData.all.aircraftTypes.items.orderBy('displayOrder').map<AircraftRegistersPerTypeViewState>(t => ({
      type: t,
      registers: preplan.aircraftRegisters.items
        .filter(a => !a.dummy && a.aircraftType.id === t.id)
        .map<AircraftRegisterViewState>(a => ({
          id: a.id,
          name: dataTypes.name.convertBusinessToView(a.name),
          groups: MasterData.all.aircraftRegisterGroups.items.filter(g => g.aircraftRegisters.filter(r => r.id === a.id)).map(g => g.name),
          baseAirport: dataTypes.airport.convertBusinessToViewOptional(a.options.baseAirport),
          status: a.options.status
        })),
      dummyRegisters: preplan.aircraftRegisters.items
        .filter(a => a.dummy && a.aircraftType.id === t.id)
        .map<DummyAircraftRegisterViewState>(a => ({
          id: a.id,
          name: dataTypes.name.convertBusinessToView(a.name),
          baseAirport: dataTypes.airport.convertBusinessToViewOptional(a.options.baseAirport),
          status: a.options.status
        }))
    }))
  );
  const [addDummyRegisterFormState, setAddDummyRegisterFormState] = useState<AddDummyAircraftRegisterFormState>(() => ({
    bypassValidation: true,
    show: false,
    name: '',
    aircraftType: '',
    baseAirport: '',
    status: 'INCLUDED'
  }));

  const classes = useStyles();

  const validation = new ViewStateValidation(list);
  interface Errors {
    [typeId: string]: {
      registers: { [registerId: string]: { baseAirport?: string } };
      dummyRegisters: { [dummyRegisterId: string]: { name?: string; baseAirport?: string } };
    };
  }
  const errors: Errors = list.reduce<Errors>((a, t) => {
    a[t.type.id] = {
      registers: t.registers.reduce<Errors[Id]['registers']>((a, r) => {
        a[r.id] = {
          baseAirport: validation.$.aircraftRegistersPerTypeViewStateValidations[t.type.id].$.registerValidations[r.id].message('BASE_AIRPORT_*')
        };
        return a;
      }, {}),
      dummyRegisters: t.dummyRegisters.reduce<Errors[Id]['dummyRegisters']>((a, r) => {
        a[r.id] = {
          name: validation.$.aircraftRegistersPerTypeViewStateValidations[t.type.id].$.dummyRegisterValidations[r.id].message('NAME_*'),
          baseAirport: validation.$.aircraftRegistersPerTypeViewStateValidations[t.type.id].$.dummyRegisterValidations[r.id].message('BASE_AIRPORT_*')
        };
        return a;
      }, {})
    };
    return a;
  }, {});

  const dummyRegisterFormValidation = new AddDummyAircraftRegisterFormStateValidation(addDummyRegisterFormState, list);
  const dummyRegistewrFromErrors = {
    register: addDummyRegisterFormState.bypassValidation ? undefined : dummyRegisterFormValidation.message('NAME_*'),
    type: addDummyRegisterFormState.bypassValidation ? undefined : dummyRegisterFormValidation.message('AIRCRAFT_TYPE_*'),
    baseAirport: addDummyRegisterFormState.bypassValidation ? undefined : dummyRegisterFormValidation.message('BASE_AIRPORT_*')
  };

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
              <RefiningTextField
                dataType={dataTypes.label}
                value={addDummyRegisterFormState.name}
                onChange={({ target: { value: name } }) => setAddDummyRegisterFormState({ ...addDummyRegisterFormState, name })}
                error={dummyRegistewrFromErrors.register !== undefined}
                helperText={dummyRegistewrFromErrors.register}
              />
            </TableCell>
            <TableCell>
              <RefiningTextField
                dataType={dataTypes.aircraftType}
                value={addDummyRegisterFormState.aircraftType}
                onChange={({ target: { value: aircraftType } }) => setAddDummyRegisterFormState({ ...addDummyRegisterFormState, aircraftType })}
                error={dummyRegistewrFromErrors.type !== undefined}
                helperText={dummyRegistewrFromErrors.type}
              />
            </TableCell>
            <TableCell className={classes.baseAirportCell}>
              <RefiningTextField
                dataType={dataTypes.airport}
                value={addDummyRegisterFormState.baseAirport}
                onChange={({ target: { value: baseAirport } }) => setAddDummyRegisterFormState({ ...addDummyRegisterFormState, baseAirport })}
                error={dummyRegistewrFromErrors.baseAirport !== undefined}
                helperText={dummyRegistewrFromErrors.baseAirport}
              />
            </TableCell>
            <TableCell className={classes.stateCell}>
              <FormControl fullWidth>
                <Select
                  classes={{ select: classes.select }}
                  native
                  variant="outlined"
                  value={addDummyRegisterFormState.status}
                  onChange={({ target: { value: status } }) => setAddDummyRegisterFormState({ ...addDummyRegisterFormState, status: status as AircraftRegisterOptionsStatus })}
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
                  //TODO: Validate addDummyRegisterFormState...
                  addDummyRegisterFormState.bypassValidation && setAddDummyRegisterFormState({ ...addDummyRegisterFormState, bypassValidation: false });

                  if (!dummyRegisterFormValidation.ok) throw 'Invalid form fields.';

                  const type = MasterData.all.aircraftTypes.id[dataTypes.aircraftType.convertViewToModel(addDummyRegisterFormState.aircraftType)];
                  list
                    .find(t => t.type === type)!
                    .dummyRegisters.push({
                      id: `dummy-${dummyAircraftRegisterIdCounter(x => x + 1)}`,
                      name: addDummyRegisterFormState.name.toUpperCase(),
                      baseAirport: addDummyRegisterFormState.baseAirport,
                      status: addDummyRegisterFormState.status
                    });
                  setAddDummyRegisterFormState({ ...addDummyRegisterFormState, show: false });
                }}
                disabled={!addDummyRegisterFormState.bypassValidation && !dummyRegisterFormValidation.ok}
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

  const aircraftRegisterRow = (t: AircraftRegistersPerTypeViewState, r: AircraftRegisterViewState, e: Errors[Id]['registers'][Id]) => (
    <TableRow key={r.id} hover={true} className={classNames({ [classes.backupRegister]: r.status === 'BACKUP', [classes.ignoredRegister]: r.status === 'IGNORED' })}>
      <TableCell className={classes.nameCell}>
        <Typography variant="body2">{r.name}</Typography>
      </TableCell>
      <TableCell className={classes.baseAirportCell}>
        <RefiningTextField
          dataType={dataTypes.airport}
          disabled={loading}
          value={r.baseAirport}
          onChange={event => {
            r.baseAirport = event.target.value;
            setList([...list]);
          }}
          error={e.baseAirport !== undefined}
          helperText={e.baseAirport}
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

  const dummyAircraftRegisterRow = (t: AircraftRegistersPerTypeViewState, r: DummyAircraftRegisterViewState, e: Errors[Id]['dummyRegisters'][Id]) => (
    <TableRow key={r.id} hover={true} className={classNames({ [classes.backupRegister]: r.status === 'BACKUP', [classes.ignoredRegister]: r.status === 'IGNORED' })}>
      <TableCell className={classes.nameCell}>
        <RefiningTextField
          dataType={dataTypes.label}
          value={r.name}
          disabled={loading}
          onChange={event => {
            r.name = event.target.value;
            setList([...list]);
          }}
          error={e.name !== undefined}
          helperText={e.name}
        />
      </TableCell>
      <TableCell className={classes.baseAirportCell}>
        <RefiningTextField
          dataType={dataTypes.airport}
          value={r.baseAirport}
          disabled={loading}
          onChange={event => {
            r.baseAirport = event.target.value;
            setList([...list]);
          }}
          error={e.baseAirport !== undefined}
          helperText={e.baseAirport}
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
      onApply={() => {
        if (!validation.ok || addDummyRegisterFormState.show) return;

        const dummyAircraftRegisters: DummyAircraftRegisterModel[] = list
          .map(t =>
            t.dummyRegisters.map<DummyAircraftRegisterModel>(r => ({
              id: r.id,
              name: dataTypes.label.convertViewToModel(r.name),
              aircraftTypeId: dataTypes.aircraftType.convertBusinessToModel(t.type)
            }))
          )
          .flatten();
        const aircraftRegisterOptions: AircraftRegisterOptionsModel = {
          options: list.flatMap<AircraftRegisterOptionsModel['options'][number]>(t =>
            [...t.registers, ...t.dummyRegisters].map<AircraftRegisterOptionsModel['options'][number]>(r => ({
              aircraftRegisterId: r.id,
              status: r.status,
              baseAirportId: dataTypes.airport.convertViewToModelOptional(r.baseAirport)
            }))
          )
        };
        onApply(dummyAircraftRegisters, aircraftRegisterOptions);
      }}
      onAdd={() => setAddDummyRegisterFormState({ bypassValidation: true, show: true, name: '', aircraftType: '', baseAirport: '', status: 'INCLUDED' })}
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
          {list
            .filter(t => filterOnProperties(t.registers, query, 'name').length + filterOnProperties(t.dummyRegisters, query, 'name').length > 0)
            .map((t, index) => (
              <div key={t.type.id}>
                <Typography variant="h6" display="inline">
                  Type: {t.type.name}
                </Typography>
                <Table size="small">
                  {tableHead}
                  <TableBody>
                    {filterOnProperties(t.registers, query, 'name').map(r => aircraftRegisterRow(t, r, errors[t.type.id].registers[r.id]))}
                    {filterOnProperties(t.dummyRegisters, query, 'name').map(r => dummyAircraftRegisterRow(t, r, errors[t.type.id].dummyRegisters[r.id]))}
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
