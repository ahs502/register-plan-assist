import React, { FC, Fragment, useState, useEffect } from 'react';
import { Theme, InputLabel, TextField, TableHead, TableCell, Table, TableRow, TableBody, Button, Grid, FormControlLabel, Checkbox } from '@material-ui/core';
import { red } from '@material-ui/core/colors';
import { makeStyles } from '@material-ui/styles';
import MasterData, { Airport } from '@core/master-data';
import FlightRequirement from 'src/view-models/flights/FlightRequirement';
import Daytime from '@core/types/Daytime';
import { Publish as ExportToExcelIcon } from '@material-ui/icons';
import { ExcelExport, ExcelExportColumn, ExcelExportColumnGroup } from '@progress/kendo-react-excel-export';
import { CellOptions } from '@progress/kendo-react-excel-export/dist/npm/ooxml/CellOptionsInterface';
import classNames from 'classnames';
import AutoComplete from 'src/components/AutoComplete';
import Preplan, { PreplanHeader } from 'src/view-models/Preplan';
import Weekday from '@core/types/Weekday';
import Rsx, { Rsxes } from '@core/types/flight-requirement/Rsx';

const useStyles = makeStyles((theme: Theme) => ({
  marginBottom1: {
    marginBottom: theme.spacing(1)
  },
  marginBottom2: {
    marginBottom: theme.spacing(2)
  },
  marginRight1: {
    marginRight: theme.spacing(1)
  },
  borderTopThick: {
    borderTopColor: theme.palette.common.black,
    borderTopStyle: 'solid',
    borderTopWidth: 'thick'
  },
  borderTopThin: {
    borderTopColor: '#C660CE',
    borderTopStyle: 'solid',
    borderTopWidth: 'medium'
  },
  borderBottom: {
    borderBottomColor: theme.palette.common.black,
    borderBottomStyle: 'solid',
    borderBottomWidth: 'thick'
  },
  boarder: {
    borderColor: theme.palette.grey[400],
    borderStyle: 'solid',
    borderWidth: 1
  },
  bullet: {
    position: 'relative',
    top: 5,
    left: 10
  },
  utc: {
    color: red[500]
  },
  diffFont: {
    bottom: 4,
    position: 'relative',
    fontSize: 20
  },
  diffContainer: {
    position: 'relative',
    bottom: 3
  },
  transform180: {
    transform: 'rotate(180deg)'
  },
  rsx: {
    padding: 0,
    fontSize: 40
  },
  category: {
    fontFamily: '"Segoe UI","Tahoma"',
    backgroundColor: theme.palette.grey[300]
  },
  noPermission: {
    color: red[600]
  },
  halfPermission: {
    position: 'relative',
    top: 2,
    fontSize: 26
  }
}));

const allAirports = MasterData.all.airports.items.orderBy(a => a.name);
const ika = allAirports.find(a => a.name === 'IKA')!;
const thr = allAirports.find(a => a.name === 'THR')!;
const mhd = allAirports.find(a => a.name === 'MHD')!;
const ker = allAirports.find(a => a.name === 'KER')!;
const allBaseAirport = [ika, thr, mhd, ker];
const group = [{ field: 'category' }];
const circle = '●';
const emptyCircle = '○';
const leftHalfBlackCircle = '◐';
const rightHalfBlackCircle = '◑';

enum FlightType {
  'Domestic',
  'International'
}

interface ProposalReportProps {
  flightRequirments: readonly FlightRequirement[];
  preplanName: string;
  fromDate: Date;
  toDate: Date;
}

interface FlattenFlightRequirment {
  [index: string]: string | number | Airport | number[] | Daytime | boolean | FlattenFlightRequirment[] | string[];
  id: string;
  flightNumber: string;
  departureAirport: Airport;
  arrivalAirport: Airport;
  std: Daytime;
  sta: Daytime;
  blocktime: number;
  formatedBlockTime: string;
  days: number[];
  utcDays: number[];
  notes: string[];
  note: string;
  localStd: string;
  localSta: string;
  utcStd: string;
  utcSta: string;
  diffLocalStdandUtcStd: number;
  diffLocalStdandLocalSta: number;
  diffLocalStdandUtcSta: number;
  route: string;
  parentRoute: string;
  label: string;
  weekDay0: string;
  weekDay1: string;
  weekDay2: string;
  weekDay3: string;
  weekDay4: string;
  weekDay5: string;
  weekDay6: string;
  rsxWeekDay0: Rsx;
  rsxWeekDay1: Rsx;
  rsxWeekDay2: Rsx;
  rsxWeekDay3: Rsx;
  rsxWeekDay4: Rsx;
  rsxWeekDay5: Rsx;
  rsxWeekDay6: Rsx;
  change: boolean;
  aircraftType: string;
  frequency: string;
  realFrequency: number;
  standbyFrequency: number;
  extraFrequency: number;
  destinationNoPermissionsWeekDay: number[];
  destinationNoPermissions: string;
  domesticNoPermissionsWeekDay: number[];
  domesticNoPermissions: string;
  category: string;
  nextFlights: FlattenFlightRequirment[];
  previousFlights: FlattenFlightRequirment[];
}

interface DailyFlightRequirment {
  flightNumber: string;
  arrivalAirport: Airport;
  departureAirport: Airport;
  blocktime: number;
  day: number;
  std: Daytime;
  note: string;
  aircraftType: string;
  category: string;
  arrivalPermission: boolean;
  departurePermission: boolean;
  rsx: Rsx;
}

interface DataProvider {
  field: string;
  items: FlattenFlightRequirment[];
  value: string;
  aggregates: any;
}

interface FliterModel {
  baseAirport: Airport;
  startDate: Date;
  endDate: Date;
  flightType: FlightType;
  showType: boolean;
  showSlot: boolean;
  showNote: boolean;
  showFrequency: boolean;
  showReal: boolean;
  showSTB1: boolean;
  showSTB2: boolean;
  showExtra: boolean;
}

const ProposalReport: FC<ProposalReportProps> = ({ flightRequirments: flightRequirments, preplanName, fromDate, toDate }) => {
  const [dataProvider, setDataProvider] = useState<DataProvider[]>([]);
  const [preplanHeaders, setPreplanHeaders] = useState<ReadonlyArray<Readonly<PreplanHeader>>>([]);
  const [flattenFlightRequirments, setFlattenFlightRequirments] = useState<FlattenFlightRequirment[]>([]);
  const [targetPreplan, setTargetPreplan] = useState<Preplan>();
  const [filterModel, setFilterModel] = useState<FliterModel>({
    baseAirport: ika,
    startDate: fromDate,
    endDate: toDate,
    flightType: FlightType.International,
    showType: false,
    showSlot: true,
    showNote: true,
    showFrequency: false,
    showReal: true,
    showSTB1: true,
    showSTB2: false,
    showExtra: false
  } as FliterModel);

  if (!preplanHeaders.length) setPreplanHeaders(getDummyPreplanHeaders()); //TODO: Remove this line later.

  let proposalExporter: ExcelExport | null;

  const detailCellOption = {
    textAlign: 'center',
    verticalAlign: 'center',
    borderBottom: { color: '#BDBDBD', size: 1 },
    borderLeft: { color: '#BDBDBD', size: 1 },
    borderRight: { color: '#BDBDBD', size: 1 },
    borderTop: { color: '#BDBDBD', size: 1 },
    fontSize: 10,
    bold: true,
    wrap: true
  } as CellOptions;

  const headerCellOptions = {
    textAlign: 'center',
    verticalAlign: 'center',
    borderBottom: { color: '#BDBDBD', size: 1 },
    borderLeft: { color: '#BDBDBD', size: 1 },
    borderRight: { color: '#BDBDBD', size: 1 },
    borderTop: { color: '#BDBDBD', size: 1 },
    fontSize: 10,
    color: '#000000',
    bold: true
  } as CellOptions;

  const classes = useStyles();

  const generateReportDataModel = (
    { baseAirport, startDate, endDate, flightType, showReal, showSTB1, showSTB2, showExtra }: FliterModel,
    flightRequirments: readonly FlightRequirement[]
  ): FlattenFlightRequirment[] => {
    const result: FlattenFlightRequirment[] = [];

    if (!baseAirport || !startDate || !endDate || startDate < fromDate || startDate > toDate || endDate < fromDate || endDate > toDate) return [];

    let labels = getLabels(flightRequirments, baseAirport, flightType);

    const baseDate = new Date(new Date((startDate.getTime() + endDate.getTime()) / 2));

    labels.forEach(m => {
      let dailyFlightRequirments = createDailyFlightRequirment(flightRequirments, m);
      dailyFlightRequirments = fliterDailyFlightRequirmentByRSX(dailyFlightRequirments, showReal, showSTB1, showSTB2, showExtra);
      const flattenFlightRequirmentList = createFlattenFlightRequirmentsFromDailyFlightRequirment(dailyFlightRequirments, baseAirport, baseDate, m);
      flattenFlightRequirmentList.sort((a, b) => compareFunction(a.std.minutes, b.std.minutes));

      findNextAndPreviousFlightRequirment(flattenFlightRequirmentList);

      flattenFlightRequirmentList.sort((a, b) => compareFunction(a.std.minutes, b.std.minutes));

      const sortedFlattenFlightRequirments = sortFlattenFlightRequirment(flattenFlightRequirmentList, baseAirport);

      const parentRoute = sortedFlattenFlightRequirments
        .map(t => t.route)
        .reduce(
          (acc, current) => {
            if (acc.indexOf(current) === -1) acc.push(current);
            return acc;
          },
          [] as string[]
        )
        .join(',');

      geratePermissionMassage(sortedFlattenFlightRequirments, parentRoute, result);
    });

    calculateFrequency(result);

    return result;
  };

  useEffect(() => {
    const flat = generateReportDataModel(filterModel, flightRequirments);
    const groupObject = flat.reduce(
      (acc, current) => {
        const category = current.category;
        acc[category] = acc[category] || [];
        acc[category].push(current);
        return acc;
      },
      {} as any
    );

    setFlattenFlightRequirments(flat);
    const result = Object.keys(groupObject)
      .sort()
      .map(function(k) {
        if (groupObject.hasOwnProperty(k)) {
          return { field: 'category', items: groupObject[k], value: k, aggregates: {} } as DataProvider;
        }
      }) as DataProvider[];

    setDataProvider(result);
  }, [filterModel]);

  return (
    <Fragment>
      <Grid container spacing={1}>
        <Grid item xs={6}>
          <InputLabel htmlFor="base-airport" className={classes.marginBottom1}>
            Base Airport
          </InputLabel>
          <select
            id="base-airport"
            onChange={event => {
              setFilterModel({ ...filterModel, baseAirport: allBaseAirport[+event.target.value] });
            }}
            className={classes.marginBottom1}
          >
            {allBaseAirport.map((option, index) => (
              <option key={index} value={index}>
                {option.name}
              </option>
            ))}
          </select>
        </Grid>
        <Grid item xs={6}>
          <InputLabel htmlFor="flight-type" className={classes.marginBottom1}>
            Flight Type
          </InputLabel>
          <select
            id="flight-type"
            onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
              filterModel.flightType = event.target.value === 'Domestic' ? FlightType.Domestic : FlightType.International;
              filterModel.showSlot = event.target.value !== 'Domestic';
              filterModel.showNote = event.target.value !== 'Domestic';
              filterModel.showType = event.target.value === 'Domestic';
              filterModel.showFrequency = event.target.value === 'Domestic';
              setFilterModel({ ...filterModel });
            }}
            className={classes.marginBottom1}
          >
            <option value="International">International</option>
            <option value="Domestic">Domestic</option>
          </select>
        </Grid>
        <Grid item xs={6}>
          <TextField
            className={classNames(classes.marginRight1, classes.marginBottom2)}
            label=" Start Date"
            onChange={e => {
              const value = e.target.value;
              if (!value) return;
              const ticks = Date.parse(value);
              if (ticks) {
                setFilterModel({ ...filterModel, startDate: new Date(ticks) });
              }
            }}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            className={classNames(classes.marginRight1, classes.marginBottom2)}
            label="End Date"
            onChange={e => {
              const value = e.target.value;
              if (!value) return;
              const ticks = Date.parse(value);
              if (ticks) {
                setFilterModel({ ...filterModel, endDate: new Date(ticks) });
              }
            }}
          />
        </Grid>

        <Grid item xs={6}>
          <FormControlLabel
            value="start"
            control={<Checkbox checked={filterModel.showSlot} onChange={e => setFilterModel({ ...filterModel, showSlot: e.target.checked })} color="primary" />}
            label="Show Slot"
            labelPlacement="start"
          />
        </Grid>

        <Grid item xs={6}>
          <FormControlLabel
            value="start"
            control={<Checkbox checked={filterModel.showNote} onChange={e => setFilterModel({ ...filterModel, showNote: e.target.checked })} color="primary" />}
            label="Show Note"
            labelPlacement="start"
          />
        </Grid>

        <Grid item xs={6}>
          <FormControlLabel
            value="start"
            control={<Checkbox checked={filterModel.showType} onChange={e => setFilterModel({ ...filterModel, showType: e.target.checked })} color="primary" />}
            label="Show Type"
            labelPlacement="start"
          />
        </Grid>

        <Grid item xs={6}>
          <FormControlLabel
            value="start"
            control={<Checkbox checked={filterModel.showFrequency} onChange={e => setFilterModel({ ...filterModel, showFrequency: e.target.checked })} color="primary" />}
            label="Show Frequency"
            labelPlacement="start"
          />
        </Grid>

        <Grid item xs={6}>
          <FormControlLabel
            value="start"
            control={<Checkbox checked={filterModel.showReal} onChange={e => setFilterModel({ ...filterModel, showReal: e.target.checked })} color="primary" />}
            label="Show Real"
            labelPlacement="start"
          />
        </Grid>

        <Grid item xs={6}>
          <FormControlLabel
            value="start"
            control={<Checkbox checked={filterModel.showSTB1} onChange={e => setFilterModel({ ...filterModel, showSTB1: e.target.checked })} color="primary" />}
            label="Show STB1"
            labelPlacement="start"
          />
        </Grid>

        <Grid item xs={6}>
          <FormControlLabel
            value="start"
            control={<Checkbox checked={filterModel.showSTB2} onChange={e => setFilterModel({ ...filterModel, showSTB2: e.target.checked })} color="primary" />}
            label="Show STB2"
            labelPlacement="start"
          />
        </Grid>

        <Grid item xs={6}>
          <FormControlLabel
            value="start"
            control={<Checkbox checked={filterModel.showExtra} onChange={e => setFilterModel({ ...filterModel, showExtra: e.target.checked })} color="primary" />}
            label="Show EXT"
            labelPlacement="start"
          />
        </Grid>

        <Grid item xs={12}>
          <AutoComplete
            options={preplanHeaders}
            getOptionLabel={l => l.name}
            getOptionValue={l => l.id}
            onSelect={s => {
              //setTargetPreplan(s);
            }}
          />
        </Grid>
      </Grid>

      <br />
      <Button
        className={classes.marginBottom2}
        variant="outlined"
        color="primary"
        onClick={() => {
          if (proposalExporter) {
            const headerWeekDayCellNumbers = [5, 6, 7, 8, 9, 10, 11];
            const weekDaySaturdayCellNumber = 7;
            const numberOfHiddenColumn = 3;
            const options = proposalExporter.workbookOptions();
            const rows = options && options.sheets && options.sheets[0] && options.sheets[0].rows;

            if (rows && rows.length > 0) {
              let idColumnNumber = 0;
              for (let index = 0; index < rows[0].cells!.length; index++) {
                const element = rows[0].cells![index];
                if (element.value && element.colSpan) {
                  idColumnNumber += element.colSpan;
                  if (element.value === 'id') break;
                }
              }

              rows[0] && (rows[0].height = 30);
              rows[1] && (rows[1].height = 30);
              if (rows[2]) {
                rows[2].height = 35;
                if (rows[2].cells) {
                  rows[2].cells[3].colSpan = 2;
                  rows[2].cells[5].colSpan = 2;
                  rows[2].cells.remove(rows[2].cells[6]);
                  rows[2].cells.remove(rows[2].cells[4]);

                  headerWeekDayCellNumbers.forEach(c => {
                    if (rows && rows[2] && rows[2].cells && rows[2].cells[c]) rows[2].cells[c].fontFamily = 'Times New Roman';
                  });
                }
              }

              rows.forEach((r, index, self) => {
                if (!r.cells || r.cells.length === 0 || index <= 2) return;

                if (index > 0 && index < self.length - 1 && self && self[index - 1] && self[index - 1].cells) {
                  const previousFlightRequirment = self[index - 1] as any;

                  if (previousFlightRequirment.type === 'data' && previousFlightRequirment.cells) {
                    const currentLabel = r.cells[r.cells.length - 1].value;
                    const previousLabel = previousFlightRequirment.cells[previousFlightRequirment.cells.length - 1].value;

                    if (currentLabel !== previousLabel) {
                      const currenParentRoute = r.cells[r.cells.length - 2] && r.cells[r.cells.length - 2].value;
                      const previousParentRoute = previousFlightRequirment.cells[previousFlightRequirment.cells.length - 2].value;
                      if (currenParentRoute === previousParentRoute)
                        r.cells.forEach((c, index) => {
                          if (index === 0) return;
                          c.borderTop = { color: '#C660CE', size: 2 };
                        });
                      else {
                        r.cells.forEach((c, index) => {
                          if (index === 0) return;
                          c.borderTop = { color: '#000000', size: 3 };
                        });
                      }
                    }
                  }
                }

                if (index === self.length - 1)
                  r.cells.forEach((c, index) => {
                    if (index === 0) return;
                    c.borderBottom = { color: '#000000', size: 3 };
                  });

                const raw = r as any;
                if (raw.type === 'group-header') {
                  const previousFlightRequirment = self[index - 1]!;
                  previousFlightRequirment.cells!.forEach((c, index) => {
                    if (index === 0) return;
                    c.borderBottom = { color: '#000000', size: 3 };
                  });
                  const nextFlightRequirment = self[index + 1]!;
                  nextFlightRequirment.cells!.forEach((c, index) => {
                    if (index === 0) return;
                    c.borderTop = { color: '#000000', size: 3 };
                  });
                }

                if (raw.type === 'data') {
                  const id = r.cells![idColumnNumber].value;
                  const model = flattenFlightRequirments.find(f => f.id === id)!;
                  const weekdayWithoutPermission = model.domesticNoPermissionsWeekDay.concat(model.destinationNoPermissionsWeekDay).distinct();

                  weekdayWithoutPermission.forEach(c => {
                    r!.cells![weekDaySaturdayCellNumber + c].color = '#e53935';
                  });
                }
              });

              rows.forEach((r, index) => {
                if (index === 1 || index === 2 || !r.cells) return;
                const row = r as any;
                if (row.type === 'group-header') {
                  r.cells[0].colSpan = r.cells[0].colSpan! - numberOfHiddenColumn;
                } else {
                  for (let index = 0; index < numberOfHiddenColumn; index++) {
                    r.cells.remove(r.cells[r.cells.length - 1]);
                  }
                }
              });
            }

            proposalExporter.save(options);
          }
        }}
      >
        Export to Excel
        <ExportToExcelIcon className={classes.transform180} />
      </Button>

      <ExcelExport
        data={dataProvider}
        group={group}
        fileName={"Proposal  '" + preplanName + "'-" + filterModel.baseAirport.name + '-' + FlightType[filterModel.flightType] + '-' + new Date().format('~D$') + '.xlsx'}
        ref={exporter => {
          proposalExporter = exporter;
        }}
      >
        <ExcelExportColumnGroup
          title={'Propoal Schedule from ' + formatDate(filterModel.startDate) + ' till ' + formatDate(filterModel.endDate)}
          headerCellOptions={{ ...headerCellOptions, background: '#FFFFFF' }}
        >
          <ExcelExportColumnGroup title={'Base ' + filterModel.baseAirport.name} headerCellOptions={{ ...headerCellOptions, background: '#F4B084' }}>
            <ExcelExportColumn
              title={'F/N'}
              field="flightNumber"
              width={31}
              cellOptions={{ ...detailCellOption, borderLeft: { color: '#000000', size: 3 } }}
              headerCellOptions={{
                ...headerCellOptions,
                background: '#F4B084',
                borderLeft: { color: '#000000', size: 3 },
                borderTop: { color: '#000000', size: 3 },
                borderBottom: { color: '#000000', size: 3 }
              }}
            />
            <ExcelExportColumn
              title="ROUTE"
              field="route"
              width={55}
              cellOptions={{ ...detailCellOption, borderRight: { color: '#000000', size: 3 } }}
              headerCellOptions={{
                ...headerCellOptions,
                background: '#F4B084',
                borderRight: { color: '#000000', size: 3 },
                borderTop: { color: '#000000', size: 3 },
                borderBottom: { color: '#000000', size: 3 }
              }}
            />

            <ExcelExportColumn
              title="LCL"
              field="localStd"
              width={30}
              cellOptions={{ ...detailCellOption }}
              headerCellOptions={{
                ...headerCellOptions,
                background: '#F4B084',
                borderLeft: { color: '#000000', size: 3 },
                borderTop: { color: '#000000', size: 3 },
                borderBottom: { color: '#000000', size: 3 }
              }}
            />
            <ExcelExportColumn
              title="LCL"
              field="localSta"
              width={30}
              cellOptions={{ ...detailCellOption }}
              headerCellOptions={{
                ...headerCellOptions,
                background: '#F4B084',
                borderTop: { color: '#000000', size: 3 },
                borderBottom: { color: '#000000', size: 3 }
              }}
            />

            <ExcelExportColumn
              title="UTC"
              field="utcStd"
              width={30}
              cellOptions={{ ...detailCellOption, color: '#F44336' }}
              headerCellOptions={{
                ...headerCellOptions,
                background: '#F4B084',
                color: '#F44336',
                borderTop: { color: '#000000', size: 3 },
                borderBottom: { color: '#000000', size: 3 }
              }}
            />
            <ExcelExportColumn
              title="UTC"
              field="utcSta"
              width={30}
              cellOptions={{ ...detailCellOption, color: '#F44336', borderRight: { color: '#000000', size: 3 } }}
              headerCellOptions={{
                ...headerCellOptions,
                background: '#F4B084',
                color: '#F44336',
                borderRight: { color: '#000000', size: 3 },
                borderTop: { color: '#000000', size: 3 },
                borderBottom: { color: '#000000', size: 3 }
              }}
            />

            <ExcelExportColumn
              title={['Sat', '6'].join('\r\n')}
              field="weekDay0"
              width={26}
              cellOptions={{ ...detailCellOption, borderLeft: { color: '#000000', size: 3 } }}
              headerCellOptions={{
                ...headerCellOptions,
                wrap: true,
                background: '#F4B084',
                borderLeft: { color: '#000000', size: 3 },
                borderTop: { color: '#000000', size: 3 },
                borderBottom: { color: '#000000', size: 3 }
              }}
            />

            <ExcelExportColumn
              title={['Sun', '7'].join('\r\n')}
              field="weekDay1"
              width={26}
              cellOptions={{ ...detailCellOption }}
              headerCellOptions={{ ...headerCellOptions, wrap: true, background: '#F4B084', borderTop: { color: '#000000', size: 3 }, borderBottom: { color: '#000000', size: 3 } }}
            />

            <ExcelExportColumn
              title={['Mon', '1'].join('\r\n')}
              field="weekDay2"
              width={26}
              cellOptions={{ ...detailCellOption }}
              headerCellOptions={{ ...headerCellOptions, wrap: true, background: '#F4B084', borderTop: { color: '#000000', size: 3 }, borderBottom: { color: '#000000', size: 3 } }}
            />

            <ExcelExportColumn
              title={['Tue', '2'].join('\r\n')}
              field="weekDay3"
              width={26}
              cellOptions={{ ...detailCellOption }}
              headerCellOptions={{ ...headerCellOptions, wrap: true, background: '#F4B084', borderTop: { color: '#000000', size: 3 }, borderBottom: { color: '#000000', size: 3 } }}
            />

            <ExcelExportColumn
              title={['Wed', '3'].join('\r\n')}
              field="weekDay4"
              width={26}
              cellOptions={{ ...detailCellOption }}
              headerCellOptions={{ ...headerCellOptions, wrap: true, background: '#F4B084', borderTop: { color: '#000000', size: 3 }, borderBottom: { color: '#000000', size: 3 } }}
            />

            <ExcelExportColumn
              title={['Thu', '4'].join('\r\n')}
              field="weekDay5"
              width={26}
              cellOptions={{ ...detailCellOption }}
              headerCellOptions={{ ...headerCellOptions, wrap: true, background: '#F4B084', borderTop: { color: '#000000', size: 3 }, borderBottom: { color: '#000000', size: 3 } }}
            />

            <ExcelExportColumn
              title={['Fri', '5'].join('\r\n')}
              field="weekDay6"
              width={26}
              cellOptions={{ ...detailCellOption, borderRight: { color: '#000000', size: 3 } }}
              headerCellOptions={{
                ...headerCellOptions,
                wrap: true,
                background: '#F4B084',
                borderRight: { color: '#000000', size: 3 },
                borderTop: { color: '#000000', size: 3 },
                borderBottom: { color: '#000000', size: 3 }
              }}
            />

            <ExcelExportColumn
              title="DUR."
              field="formatedBlockTime"
              width={30}
              cellOptions={{ ...detailCellOption, borderRight: { color: '#000000', size: 3 }, borderLeft: { color: '#000000', size: 3 } }}
              headerCellOptions={{
                ...headerCellOptions,
                background: '#F4B084',
                borderRight: { color: '#000000', size: 3 },
                borderLeft: { color: '#000000', size: 3 },
                borderTop: { color: '#000000', size: 3 },
                borderBottom: { color: '#000000', size: 3 }
              }}
            />
            {filterModel.showNote && (
              <ExcelExportColumn
                title={['NOTE', '(base on domestic/lcl)'].join('\r\n')}
                field="note"
                width={100}
                cellOptions={{ ...detailCellOption, borderRight: { color: '#000000', size: 3 }, borderLeft: { color: '#000000', size: 3 } }}
                headerCellOptions={{
                  ...headerCellOptions,
                  wrap: true,
                  background: '#F4B084',
                  borderRight: { color: '#000000', size: 3 },
                  borderLeft: { color: '#000000', size: 3 },
                  borderTop: { color: '#000000', size: 3 },
                  borderBottom: { color: '#000000', size: 3 }
                }}
              />
            )}

            {filterModel.showSlot && (
              <ExcelExportColumn
                title={['INTL.', 'SLOT(UTC)'].join('\r\n')}
                field="destinationNoPermissions"
                width={85}
                cellOptions={{ ...detailCellOption, borderRight: { color: '#000000', size: 3 }, borderLeft: { color: '#000000', size: 3 } }}
                headerCellOptions={{
                  ...headerCellOptions,
                  wrap: true,
                  background: '#F4B084',
                  borderRight: { color: '#000000', size: 3 },
                  borderLeft: { color: '#000000', size: 3 },
                  borderTop: { color: '#000000', size: 3 },
                  borderBottom: { color: '#000000', size: 3 }
                }}
              />
            )}
            {filterModel.showSlot && (
              <ExcelExportColumn
                title={['DOM.', 'SLOT(LCL)'].join('\r\n')}
                field="domesticNoPermissions"
                width={70}
                cellOptions={{ ...detailCellOption, borderRight: { color: '#000000', size: 3 }, borderLeft: { color: '#000000', size: 3 } }}
                headerCellOptions={{
                  ...headerCellOptions,
                  wrap: true,
                  background: '#F4B084',
                  borderRight: { color: '#000000', size: 3 },
                  borderLeft: { color: '#000000', size: 3 },
                  borderTop: { color: '#000000', size: 3 },
                  borderBottom: { color: '#000000', size: 3 }
                }}
              />
            )}

            {filterModel.showType && (
              <ExcelExportColumn
                title="Type"
                field="aircraftType"
                width={40}
                cellOptions={{ ...detailCellOption, borderRight: { color: '#000000', size: 3 }, borderLeft: { color: '#000000', size: 3 } }}
                headerCellOptions={{
                  ...headerCellOptions,
                  wrap: true,
                  background: '#F4B084',
                  borderRight: { color: '#000000', size: 3 },
                  borderLeft: { color: '#000000', size: 3 },
                  borderTop: { color: '#000000', size: 3 },
                  borderBottom: { color: '#000000', size: 3 }
                }}
              />
            )}

            {filterModel.showFrequency && (
              <ExcelExportColumn
                title="Fre"
                field="frequency"
                width={40}
                cellOptions={{ ...detailCellOption, borderRight: { color: '#000000', size: 3 }, borderLeft: { color: '#000000', size: 3 } }}
                headerCellOptions={{
                  ...headerCellOptions,
                  wrap: true,
                  background: '#F4B084',
                  borderRight: { color: '#000000', size: 3 },
                  borderLeft: { color: '#000000', size: 3 },
                  borderTop: { color: '#000000', size: 3 },
                  borderBottom: { color: '#000000', size: 3 }
                }}
              />
            )}
          </ExcelExportColumnGroup>
        </ExcelExportColumnGroup>
        <ExcelExportColumn title="Category" field="category" hidden={true} />
        <ExcelExportColumn title="id" field="id" />
        <ExcelExportColumn title="parentRoute" field="parentRoute" />
        <ExcelExportColumn title="label" field="label" />
      </ExcelExport>

      <Table className={classNames(classes.marginBottom1, classes.marginRight1)}>
        <TableHead>
          <TableRow>
            <TableCell className={classes.boarder} align="center" colSpan={19}>
              {filterModel.baseAirport ? 'Base ' + filterModel.baseAirport.name : ''}
            </TableCell>
          </TableRow>
          <TableRow className={classes.borderBottom}>
            <TableCell className={classes.boarder} rowSpan={2}>
              F/N
            </TableCell>
            <TableCell className={classes.boarder} rowSpan={2}>
              ROUTE
            </TableCell>
            <TableCell className={classes.boarder} align="center" colSpan={2} rowSpan={2}>
              LCL
            </TableCell>
            <TableCell className={classNames(classes.boarder, classes.utc)} align="center" colSpan={2} rowSpan={2}>
              UTC
            </TableCell>
            <TableCell className={classes.boarder} align="center">
              <div>Sat</div>
              <div>6</div>
            </TableCell>
            <TableCell className={classes.boarder} align="center">
              <div>Sun</div>
              <div>7</div>
            </TableCell>
            <TableCell className={classes.boarder} align="center">
              <div>Mon</div>
              <div>1</div>
            </TableCell>
            <TableCell className={classes.boarder} align="center">
              <div>Tue</div>
              <div>2</div>
            </TableCell>
            <TableCell className={classes.boarder} align="center">
              <div>Wed</div>
              <div>3</div>
            </TableCell>
            <TableCell className={classes.boarder} align="center">
              <div>Thu</div>
              <div>4</div>
            </TableCell>
            <TableCell className={classes.boarder} align="center">
              <div>Fri</div>
              <div>5</div>
            </TableCell>
            <TableCell className={classes.boarder} align="center">
              DUR.
            </TableCell>
            {filterModel.showNote && (
              <TableCell className={classes.boarder} align="center">
                <div>NOTE</div>
                <div>(base on domestic/lcl)</div>
              </TableCell>
            )}
            {filterModel.showSlot && (
              <Fragment>
                <TableCell className={classes.boarder} align="center">
                  <div>INTL.</div>
                  <div>SLOT (UTC)</div>
                </TableCell>

                <TableCell className={classes.boarder} align="center">
                  <div>DOM.</div>
                  <div>SLOT (LCL)</div>
                </TableCell>
              </Fragment>
            )}
            {filterModel.showType && (
              <TableCell className={classes.boarder} align="center">
                Type
              </TableCell>
            )}

            {filterModel.showFrequency && (
              <TableCell className={classes.boarder} align="center">
                Fre
              </TableCell>
            )}
          </TableRow>
        </TableHead>

        <TableBody>
          {dataProvider.map(d => (
            <Fragment key={d.value}>
              {d.value && (
                <TableRow>
                  <TableCell className={classes.category} colSpan={19}>
                    Category: {d.value}
                  </TableCell>
                </TableRow>
              )}
              {d.items.map((f, index, self) => (
                <TableRow
                  key={index.toString() + f.label + f.flightNumber}
                  className={
                    index > 0 && self[index - 1].label !== f.label ? (self[index - 1].parentRoute !== f.parentRoute ? classes.borderTopThick : classes.borderTopThin) : undefined
                  }
                >
                  <TableCell className={classes.boarder}>{f.flightNumber}</TableCell>
                  <TableCell className={classes.boarder}>{f.route}</TableCell>
                  <TableCell className={classes.boarder} align="center">
                    {f.localStd}
                  </TableCell>
                  <TableCell className={classes.boarder} align="center">
                    <div className={f.diffLocalStdandLocalSta !== 0 ? classes.diffContainer : ''}>
                      <span>{f.localSta}</span>
                    </div>
                  </TableCell>
                  <TableCell className={classNames(classes.boarder, classes.utc)} align="center">
                    <div className={f.diffLocalStdandUtcStd !== 0 ? classes.diffContainer : ''}>
                      <span>{f.utcStd}</span>
                    </div>
                  </TableCell>
                  <TableCell className={classNames(classes.boarder, classes.utc)} align="center">
                    <div className={f.diffLocalStdandUtcSta !== 0 ? classes.diffContainer : ''}>
                      <span>{f.utcSta}</span>
                    </div>
                  </TableCell>
                  <TableCell align="center" className={classNames(classes.boarder, isRealFlight(f, 0) ? classes.rsx : '', noPermission(f, 0) ? classes.noPermission : '')}>
                    <div className={isRealFlight(f, 0) && halfPermission(f, 0) ? classes.halfPermission : ''}>{f.weekDay0}</div>
                  </TableCell>
                  <TableCell align="center" className={classNames(classes.boarder, isRealFlight(f, 1) ? classes.rsx : '', noPermission(f, 1) ? classes.noPermission : '')}>
                    <div className={isRealFlight(f, 1) && halfPermission(f, 1) ? classes.halfPermission : ''}>{f.weekDay1}</div>
                  </TableCell>
                  <TableCell align="center" className={classNames(classes.boarder, isRealFlight(f, 2) ? classes.rsx : '', noPermission(f, 2) ? classes.noPermission : '')}>
                    <div className={isRealFlight(f, 2) && halfPermission(f, 2) ? classes.halfPermission : ''}>{f.weekDay2}</div>
                  </TableCell>
                  <TableCell align="center" className={classNames(classes.boarder, isRealFlight(f, 3) ? classes.rsx : '', noPermission(f, 3) ? classes.noPermission : '')}>
                    <div className={isRealFlight(f, 3) && halfPermission(f, 3) ? classes.halfPermission : ''}>{f.weekDay3}</div>
                  </TableCell>
                  <TableCell align="center" className={classNames(classes.boarder, isRealFlight(f, 4) ? classes.rsx : '', noPermission(f, 4) ? classes.noPermission : '')}>
                    <div className={isRealFlight(f, 4) && halfPermission(f, 4) ? classes.halfPermission : ''}>{f.weekDay4}</div>
                  </TableCell>
                  <TableCell align="center" className={classNames(classes.boarder, isRealFlight(f, 5) ? classes.rsx : '', noPermission(f, 5) ? classes.noPermission : '')}>
                    <div className={isRealFlight(f, 5) && halfPermission(f, 5) ? classes.halfPermission : ''}>{f.weekDay5}</div>
                  </TableCell>
                  <TableCell align="center" className={classNames(classes.boarder, isRealFlight(f, 6) ? classes.rsx : '', noPermission(f, 6) ? classes.noPermission : '')}>
                    <div className={isRealFlight(f, 6) && halfPermission(f, 6) ? classes.halfPermission : ''}>{f.weekDay6}</div>
                  </TableCell>
                  <TableCell align="center" className={classes.boarder}>
                    {formatMinuteToString(f.blocktime)}
                  </TableCell>
                  {filterModel.showNote && (
                    <TableCell align="center" className={classes.boarder}>
                      {f.note}
                    </TableCell>
                  )}

                  {filterModel.showSlot && (
                    <Fragment>
                      <TableCell className={classes.boarder} align="center">
                        {f.destinationNoPermissions}
                      </TableCell>

                      <TableCell className={classes.boarder} align="center">
                        {f.domesticNoPermissions}
                      </TableCell>
                    </Fragment>
                  )}
                  {filterModel.showType && (
                    <TableCell className={classes.boarder} align="center">
                      {f.aircraftType}
                    </TableCell>
                  )}

                  {filterModel.showFrequency && (
                    <TableCell className={classes.boarder} align="center">
                      {f.frequency}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </Fragment>
          ))}
        </TableBody>
      </Table>
    </Fragment>
  );
};

export default ProposalReport;

function calculateFrequency(result: FlattenFlightRequirment[]) {
  const parentRoutes = result
    .map(r => r.parentRoute)
    .reduce(
      (acc, current) => {
        if (acc.indexOf(current) === -1) acc.push(current);
        return acc;
      },
      [] as string[]
    );
  parentRoutes.forEach(r => {
    const flatFlightRequirments = result.filter(f => f.parentRoute === r);
    const realFrequency = flatFlightRequirments
      .map(f => f.realFrequency)
      .reduce((acc, current) => {
        acc += +current ? +current / 2 : 0;
        return acc;
      }, 0);
    const standbyFrequency = flatFlightRequirments
      .map(f => f.standbyFrequency)
      .reduce((acc, current) => {
        acc += +current ? +current / 2 : 0;
        return acc;
      }, 0);
    const extraFrequency = flatFlightRequirments
      .map(f => f.extraFrequency)
      .reduce((acc, current) => {
        acc += +current ? +current / 2 : 0;
        return acc;
      }, 0);
    const frequency: number[] = [] as number[];
    realFrequency && frequency.push(realFrequency);
    standbyFrequency && frequency.push(standbyFrequency);
    extraFrequency && frequency.push(extraFrequency);
    flatFlightRequirments[0].frequency = frequency.join('+');
  });
}

function geratePermissionMassage(sortedFlattenFlightRequirments: FlattenFlightRequirment[], parentRoute: string, result: FlattenFlightRequirment[]) {
  sortedFlattenFlightRequirments.forEach(n => {
    n.parentRoute = parentRoute;
    n.note = n.notes.join(',');
    n.destinationNoPermissions =
      n.destinationNoPermissionsWeekDay.length === 0
        ? 'OK'
        : n.destinationNoPermissionsWeekDay.length === n.days.length
        ? 'NOT OK'
        : 'NOT OK for: ' + n.destinationNoPermissionsWeekDay.map(w => Weekday[w].substring(0, 3)).join(',');
    n.domesticNoPermissions =
      n.domesticNoPermissionsWeekDay.length === 0
        ? 'OK'
        : n.domesticNoPermissionsWeekDay.length === n.days.length
        ? 'NOT OK'
        : 'NOT OK for: ' + n.domesticNoPermissionsWeekDay.map(w => Weekday[w].substring(0, 3)).join(',');
    result.push(n);
  });
}

function findNextAndPreviousFlightRequirment(flattenFlightRequirmentList: FlattenFlightRequirment[]) {
  flattenFlightRequirmentList.forEach(f => {
    f.nextFlights = [];
    f.previousFlights = [];
  });

  flattenFlightRequirmentList.forEach((current, i, self) => {
    current.utcDays.forEach(d => {
      const arrivalDay = (d + (current.std.minutes > current.sta.minutes ? 1 : 0)) % 7;
      let nextFlight = self.find(f => {
        return f.departureAirport.id === current.arrivalAirport.id && (f.std.minutes > current.sta.minutes && f.utcDays.some(dd => dd === arrivalDay));
      });
      let dayDiff = 1;
      if (!nextFlight) {
        for (dayDiff = 1; dayDiff < 7; dayDiff++) {
          nextFlight = self.find(f => {
            return f.departureAirport.id === current.arrivalAirport.id && f.utcDays.some(dd => dd === (arrivalDay + dayDiff) % 7);
          });
          if (nextFlight) {
            nextFlight.utcDays.remove((arrivalDay + dayDiff) % 7);
            break;
          }
        }
      } else {
        nextFlight.utcDays.remove(arrivalDay);
      }
      if (nextFlight) {
        if (dayDiff <= 3) {
          if (current.nextFlights.indexOf(nextFlight) === -1) current.nextFlights.push(nextFlight);
          if (nextFlight.previousFlights.indexOf(current) === -1) nextFlight.previousFlights.push(current);
        } else {
          if (current.previousFlights.indexOf(nextFlight) === -1) current.previousFlights.push(nextFlight);
          if (nextFlight.nextFlights.indexOf(current) === -1) nextFlight.nextFlights.push(current);
        }
      }
    });
  });
}

function createDailyFlightRequirment(flightRequirments: readonly FlightRequirement[], m: string) {
  return flightRequirments
    .filter(f => f.definition.label === m)
    .map(f => {
      return f.days.map(
        d =>
          ({
            flightNumber: f.definition.flightNumber,
            arrivalAirport: f.definition.arrivalAirport,
            departureAirport: f.definition.departureAirport,
            blocktime: d.scope.blockTime,
            day: d.day,
            std: d.flight.std,
            note: d.notes,
            aircraftType: d.flight.aircraftRegister && d.flight.aircraftRegister.aircraftType.name,
            category: f.definition.category,
            arrivalPermission: Math.random() > 0.25 ? d.scope.arrivalPermission : !d.scope.arrivalPermission,
            departurePermission: Math.random() > 0.25 ? d.scope.departurePermission : !d.scope.departurePermission,
            rsx: d.scope.rsx
          } as DailyFlightRequirment)
      );
    })
    .flat();
}

function sortFlattenFlightRequirment(flattenFlightRequirmentList: FlattenFlightRequirment[], baseAirport: Airport) {
  const temp: FlattenFlightRequirment[] = [];

  while (flattenFlightRequirmentList.length > 0) {
    let flightRequirment = flattenFlightRequirmentList.find(f => f.departureAirport.id === baseAirport.id);
    let minIndex = flattenFlightRequirmentList.length;
    if (flightRequirment) {
      const insertedPreviousFlight = temp.filter(f => f.previousFlights.some(n => n === flightRequirment));
      if (insertedPreviousFlight && insertedPreviousFlight.length > 0) {
        const x = insertedPreviousFlight.map(f => temp.indexOf(f));
        minIndex = Math.min(...x);
      }
      temp.splice(minIndex, 0, flightRequirment);

      flattenFlightRequirmentList.remove(flightRequirment);

      flightRequirment.nextFlights.forEach(f => {
        if (temp.indexOf(f) > 0) return;
        minIndex++;
        temp.splice(minIndex, 0, f);
        flattenFlightRequirmentList.remove(f);
      });
    } else {
      flattenFlightRequirmentList.forEach(n => temp.push(n));
      break;
    }
  }
  return temp;
}

function createFlattenFlightRequirmentsFromDailyFlightRequirment(dailyFlightRequirments: DailyFlightRequirment[], baseAirport: Airport, baseDate: Date, label: string) {
  return dailyFlightRequirments.reduce(
    (acc, current) => {
      const existFlatten = acc.find(
        f =>
          f.arrivalAirport.id === current.arrivalAirport.id &&
          f.departureAirport.id === current.departureAirport.id &&
          f.blocktime === current.blocktime &&
          f.flightNumber === normalizeFlightNumber(current.flightNumber) &&
          f.std.minutes === current.std.minutes
      );
      if (existFlatten) {
        updateFlattenFlightRequirment(existFlatten, current, baseAirport);
      } else {
        const flatten = createFlattenFlightRequirment(current, baseDate, baseAirport, label);

        acc.push(flatten);
      }

      return acc;
    },
    [] as FlattenFlightRequirment[]
  );
}

function getLabels(flightRequirments: readonly FlightRequirement[], baseAirport: Airport, flightType: FlightType) {
  return flightRequirments
    .filter(f => {
      return (
        (f.definition.departureAirport.id === baseAirport.id || f.definition.arrivalAirport.id === baseAirport.id) &&
        ((f.definition.departureAirport.id === baseAirport.id && f.definition.arrivalAirport.international === (flightType === FlightType.International)) ||
          (f.definition.arrivalAirport.id === baseAirport.id && f.definition.departureAirport.international === (flightType === FlightType.International)))
      );
    })
    .sort((first, second) => {
      const firstLabel = first.definition.label;
      const secondLabel = second.definition.label;
      return firstLabel > secondLabel ? 1 : firstLabel < secondLabel ? -1 : 0;
    })
    .map(f => f.definition.label)
    .filter((value, index, self) => {
      return self.indexOf(value) === index;
    });
}

function createFlattenFlightRequirment(dailyFlightRequirment: DailyFlightRequirment, date: Date, baseAirport: Airport, label: string) {
  const utcStd = dailyFlightRequirment.std.toDate(date);
  const localStd = dailyFlightRequirment.departureAirport.convertUtcToLocal(utcStd);
  const utcSta = dailyFlightRequirment.std.toDate(date);
  utcSta.addMinutes(dailyFlightRequirment.blocktime);
  const localSta = dailyFlightRequirment.arrivalAirport.convertUtcToLocal(utcSta);
  let diffLocalStdandUtcStd = localStd.getUTCDay() - utcStd.getUTCDay();
  let diffLocalStdandUtcSta = localStd.getUTCDay() - utcSta.getUTCDay();
  let diffLocalStdandLocalSta = localStd.getUTCDay() - localSta.getUTCDay();

  if (diffLocalStdandUtcStd > 1) diffLocalStdandUtcStd = -1;
  if (diffLocalStdandUtcStd < -1) diffLocalStdandUtcStd = 1;

  if (diffLocalStdandUtcSta > 1) diffLocalStdandUtcSta = -1;
  if (diffLocalStdandUtcSta < -1) diffLocalStdandUtcSta = 1;

  if (diffLocalStdandLocalSta > 1) diffLocalStdandLocalSta = -1;
  if (diffLocalStdandLocalSta < -1) diffLocalStdandLocalSta = 1;

  const flatten = {
    id:
      Math.random()
        .toString(36)
        .substring(2) + Date.now().toString(36),
    flightNumber: normalizeFlightNumber(dailyFlightRequirment.flightNumber),
    arrivalAirport: dailyFlightRequirment.arrivalAirport,
    departureAirport: dailyFlightRequirment.departureAirport,
    blocktime: dailyFlightRequirment.blocktime,
    formatedBlockTime: formatMinuteToString(dailyFlightRequirment.blocktime),
    days: [] as number[],
    utcDays: [] as number[],
    std: dailyFlightRequirment.std,
    sta: new Daytime(utcSta),
    notes: [] as string[],
    localStd: formatDateToString(localStd),
    localSta: formatDateToString(localSta) + (diffLocalStdandLocalSta < 0 ? '*' : ''),
    utcStd: formatDateToString(utcStd) + (diffLocalStdandUtcStd < 0 ? '*' : diffLocalStdandUtcStd > 0 ? '#' : ''),
    utcSta: formatDateToString(utcSta) + (diffLocalStdandUtcSta < 0 ? '*' : diffLocalStdandUtcSta > 0 ? '#' : ''),
    diffLocalStdandUtcStd: diffLocalStdandUtcStd,
    diffLocalStdandLocalSta: diffLocalStdandLocalSta,
    diffLocalStdandUtcSta: diffLocalStdandUtcSta,
    route: dailyFlightRequirment.departureAirport.name + '–' + dailyFlightRequirment.arrivalAirport.name,
    aircraftType: dailyFlightRequirment.aircraftType,
    domesticNoPermissionsWeekDay: [] as number[],
    destinationNoPermissionsWeekDay: [] as number[],
    label: label,
    category: dailyFlightRequirment.category,
    realFrequency: 0,
    extraFrequency: 0,
    standbyFrequency: 0
  } as FlattenFlightRequirment;

  updateFlattenFlightRequirment(flatten, dailyFlightRequirment, baseAirport);
  return flatten;
}

function updateFlattenFlightRequirment(flattenFlight: FlattenFlightRequirment, dialyFlightRequirment: DailyFlightRequirment, baseAirport: Airport) {
  const weekDay = (dialyFlightRequirment.day + flattenFlight.diffLocalStdandUtcStd + 7) % 7;

  let domesticToDestination = dialyFlightRequirment.departureAirport.id === baseAirport.id;
  if (!domesticToDestination) {
    domesticToDestination = !dialyFlightRequirment.departureAirport.international;
  }

  if (flattenFlight.days.indexOf(weekDay) === -1) {
    flattenFlight.days.push(weekDay);

    if (!dialyFlightRequirment.departurePermission) {
      domesticToDestination ? flattenFlight.domesticNoPermissionsWeekDay.push(weekDay) : flattenFlight.destinationNoPermissionsWeekDay.push(weekDay);
    }

    if (!dialyFlightRequirment.arrivalPermission) {
      const arrivalWeekDay = flattenFlight.diffLocalStdandLocalSta > 0 ? (weekDay + 1) % 7 : weekDay;
      domesticToDestination ? flattenFlight.destinationNoPermissionsWeekDay.push(arrivalWeekDay) : flattenFlight.domesticNoPermissionsWeekDay.push(arrivalWeekDay);
    }
  }

  flattenFlight.utcDays.indexOf(dialyFlightRequirment.day) === -1 && flattenFlight.utcDays.push(dialyFlightRequirment.day);
  flattenFlight.notes.indexOf(dialyFlightRequirment.note) === -1 && flattenFlight.notes.push(dialyFlightRequirment.note);
  flattenFlight['weekDay' + weekDay.toString()] = calculateDayCharacter();
  flattenFlight['rswWeekDay' + weekDay.toString()] = dialyFlightRequirment.rsx;
  switch (dialyFlightRequirment.rsx) {
    case 'REAL':
      flattenFlight.realFrequency++;
      break;
    case 'EXT':
      flattenFlight.extraFrequency++;
      break;
    case 'STB1':
    case 'STB2':
      flattenFlight.standbyFrequency++;
      break;
  }

  return flattenFlight;

  function calculateDayCharacter(): string | number | boolean | Airport | number[] | Daytime | FlattenFlightRequirment[] | string[] {
    if (dialyFlightRequirment.rsx === 'REAL') {
      if (dialyFlightRequirment.departurePermission && dialyFlightRequirment.arrivalPermission) return circle;
      if (!dialyFlightRequirment.departurePermission && !dialyFlightRequirment.arrivalPermission) return emptyCircle;
      if (!dialyFlightRequirment.departurePermission) return domesticToDestination ? leftHalfBlackCircle : rightHalfBlackCircle;
      return domesticToDestination ? rightHalfBlackCircle : leftHalfBlackCircle;
    } else {
      return dialyFlightRequirment.rsx.toString();
    }
  }
}

function fliterDailyFlightRequirmentByRSX(dailyFlightRequirment: readonly DailyFlightRequirment[], showReal: boolean, showSTB1: boolean, showSTB2: boolean, showExtra: boolean) {
  return dailyFlightRequirment.filter(f => {
    return (showReal && f.rsx === 'REAL') || (showSTB1 && f.rsx === 'STB1') || (showSTB2 && f.rsx === 'STB2') || (showExtra && f.rsx === 'EXT');
  });
}

function normalizeFlightNumber(flightNumber: string) {
  if (flightNumber && flightNumber.toUpperCase().startsWith('W5 ')) {
    const flightNumberWithOutW5 = flightNumber.substring(3);
    if (flightNumberWithOutW5.startsWith('0')) return flightNumberWithOutW5.substring(1);
    return flightNumberWithOutW5;
  }

  return flightNumber;
}

function formatMinuteToString(minutes: number) {
  if (!minutes) return '';
  return (
    Math.floor(minutes / 60)
      .toString()
      .padStart(2, '0') +
    ':' +
    (minutes % 60).toString().padStart(2, '0')
  );
}

function formatDateToString(date: Date) {
  if (!date) return '';
  return (
    date
      .getUTCHours()
      .toString()
      .padStart(2, '0') +
    date
      .getUTCMinutes()
      .toString()
      .padStart(2, '0')
  );
}

function compareFunction(a: number, b: number) {
  if (a > b) return 1;
  if (a < b) return -1;
  return 0;
}

function noPermission(flattenFlightRequirment: FlattenFlightRequirment, day: number) {
  return flattenFlightRequirment.destinationNoPermissionsWeekDay.some(a => a === day) || flattenFlightRequirment.domesticNoPermissionsWeekDay.some(a => a === day);
}

function halfPermission(flattenFlightRequirment: FlattenFlightRequirment, day: number) {
  const destinationPermission = flattenFlightRequirment.destinationNoPermissionsWeekDay.some(a => a === day);
  const domesticPermission = flattenFlightRequirment.domesticNoPermissionsWeekDay.some(a => a === day);
  return (destinationPermission && !domesticPermission) || (!destinationPermission && domesticPermission);
}

function isRealFlight(flattenFlightRequirment: FlattenFlightRequirment, day: number) {
  return flattenFlightRequirment['rswWeekDay' + day.toString()] === 'REAL';
}

function formatDate(date: Date) {
  let day = '' + date.getDate(),
    year = date.getFullYear();
  const month = date.toLocaleString('default', { month: 'short' }).toUpperCase();

  day = day.padStart(2, '0');

  return [day, month, year].join('/');
}

function getDummyPreplanHeaders(): PreplanHeader[] {
  return [
    {
      id: '123',
      name: 'S20 International Final',
      published: true,
      finalized: false,
      userId: '1001',
      userName: 'MAHANAIR961234',
      userDisplayName: 'Moradi',
      parentPreplanId: '122',
      parentPreplanName: 'S19 International Default',
      creationDateTime: new Date(),
      lastEditDateTime: new Date(),
      startDate: new Date(2019, 1, 1),
      endDate: new Date(2019, 7, 1),
      simulationId: '32847321984',
      simulationName: 'S19 International Simulation'
    },
    {
      id: '124',
      name: 'S21 International Final',
      published: false,
      finalized: true,
      userId: '1001',
      userName: 'MAHANAIR961234',
      userDisplayName: 'Moradi',
      parentPreplanId: '122',
      parentPreplanName: 'S19 International Default',
      creationDateTime: new Date(),
      lastEditDateTime: new Date(),
      startDate: new Date(2019, 1, 1),
      endDate: new Date(2019, 7, 1),
      simulationId: '32847321984',
      simulationName: 'S19 International Simulation'
    },
    {
      id: '125',
      name: 'S19 International Final',
      published: true,
      finalized: false,
      userId: '1002',
      userName: 'MAHANAIR961234',
      userDisplayName: 'Moradi',
      parentPreplanId: '122',
      parentPreplanName: 'S19 International Default',
      creationDateTime: new Date(),
      lastEditDateTime: new Date(),
      startDate: new Date(2019, 1, 1),
      endDate: new Date(2019, 7, 1),
      simulationId: '32847321984',
      simulationName: 'S19 International Simulation'
    },
    {
      id: '126',
      name: 'S19 International Final',
      published: true,
      finalized: true,
      userId: '1002',
      userName: 'MAHANAIR961234',
      userDisplayName: 'Moradi',
      parentPreplanId: '122',
      parentPreplanName: 'S19 International Default',
      creationDateTime: new Date(),
      lastEditDateTime: new Date(),
      startDate: new Date(2019, 1, 1),
      endDate: new Date(2019, 7, 1),
      simulationId: '32847321984',
      simulationName: 'S19 International Simulation'
    },
    {
      id: '127',
      name: 'S19 International Final',
      published: true,
      finalized: true,
      userId: '1003',
      userName: 'MAHANAIR961234',
      userDisplayName: 'Moradi',
      parentPreplanId: '122',
      parentPreplanName: 'S19 International Default',
      creationDateTime: new Date(),
      lastEditDateTime: new Date(),
      startDate: new Date(2019, 1, 1),
      endDate: new Date(2019, 7, 1),
      simulationId: '32847321984',
      simulationName: 'S19 International Simulation'
    },
    {
      id: '128',
      name: 'S19 International Final',
      published: true,
      finalized: true,
      userId: '1003',
      userName: 'MAHANAIR961234',
      userDisplayName: 'Moradi',
      parentPreplanId: '122',
      parentPreplanName: 'S19 International Default',
      creationDateTime: new Date(),
      lastEditDateTime: new Date(),
      startDate: new Date(2019, 1, 1),
      endDate: new Date(2019, 7, 1),
      simulationId: '32847321984',
      simulationName: 'S19 International Simulation'
    }
  ];
}
