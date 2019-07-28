import React, { FC, Fragment, useState, useEffect } from 'react';
import { Theme, InputLabel, TextField, TableHead, TableCell, Table, TableRow, TableBody, Button, Grid, FormControlLabel, Checkbox } from '@material-ui/core';
import { red } from '@material-ui/core/colors';
import { makeStyles } from '@material-ui/styles';
import MasterData, { Airport } from '@core/master-data';
import FlightRequirement from 'src/view-models/flight/FlightRequirement';
import { FiberManualRecord as BulletIcon } from '@material-ui/icons';
import Daytime from '@core/types/Daytime';
import { Publish as ExportToExcelIcon } from '@material-ui/icons';
import { ExcelExport, ExcelExportColumn, ExcelExportColumnGroup } from '@progress/kendo-react-excel-export';
import { CellOptions } from '@progress/kendo-react-excel-export/dist/npm/ooxml/CellOptionsInterface';
import classNames from 'classnames';
import AutoComplete from 'src/components/AutoComplete';
import Preplan from 'src/view-models/Preplan';

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
  }
}));

const allAirports = MasterData.all.airports.items.orderBy(a => a.name);
const ika = allAirports.find(a => a.name === 'IKA')!;
const thr = allAirports.find(a => a.name === 'THR')!;
const mhd = allAirports.find(a => a.name === 'MHD')!;
const ker = allAirports.find(a => a.name === 'KER')!;
const allBaseAirport = [ika, thr, mhd, ker];
const group = [{ field: 'category' }];

const allPreplan: Preplan[] = []; //TODO: Remove
allPreplan.sort((a, b) => {
  if (a.lastEditDateTime > b.lastEditDateTime) return -1;
  if (a.lastEditDateTime < b.lastEditDateTime) return -1;
  return 0;
});
allPreplan.unshift({} as Preplan);
const formatDate = (date: Date): string => {
  let day = '' + date.getDate(),
    year = date.getFullYear();
  const month = date.toLocaleString('default', { month: 'short' }).toUpperCase();

  day = day.padStart(2, '0');

  return [day, month, year].join('/');
};

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
  [index: string]: string | number | Airport | number[] | Daytime | boolean | FlattenFlightRequirment[];
  flightNumber: string;
  departureAirport: Airport;
  arrivalAirport: Airport;
  std: Daytime;
  sta: Daytime;
  blocktime: number;
  formatedBlockTime: string;
  days: number[];
  utcDays: number[];
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
  change: boolean;
  aircraftType: string;
  frequency: string;
  realFrequency: number;
  standbyFrequency: number;
  extraFrequency: number;
  internationalPermission: string;
  domensticPermission: string;
  category: string;
  nextFlights: FlattenFlightRequirment[];
  previousFlights: FlattenFlightRequirment[];
}

interface DataProvider {
  field: string;
  items: FlattenFlightRequirment[];
  value: string;
  aggregates: any;
}

const normalizeFlightNumber = (flightNumber: string): string => {
  if (flightNumber && flightNumber.toUpperCase().startsWith('W5')) return flightNumber.substring(2).trim();
  return flightNumber;
};

const formatMinuteToString = (minutes: number): string => {
  if (!minutes) return '';
  return (
    Math.floor(minutes / 60)
      .toString()
      .padStart(2, '0') +
    ':' +
    (minutes % 60).toString().padStart(2, '0')
  );
};

const formatDateToString = (date: Date): string => {
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
};

const compareFunction = (a: number, b: number): number => {
  if (a > b) return 1;
  if (a < b) return -1;
  return 0;
};

// const findNextFlight = (flights: FlattenFlightRequirment[], current: FlattenFlightRequirment) : FlattenFlightRequirment | undefined =>{
//   let result :FlattenFlightRequirment  ;

//   const returnFlights = flights.find(f => f.departureAirport.id === current.arrivalAirport.id && ((f.std.minutes )||()));
//   if(!returnFlights || returnFlights.length === 0) return undefined;

//   return result;
// }

const ProposalReport: FC<ProposalReportProps> = ({ flightRequirments: flightRequirments, preplanName, fromDate, toDate }) => {
  const [baseAirport, setBaseAirport] = useState<Airport>(ika);
  const [startDate, setStartDate] = useState<Date>(new Date(Date.parse('2019-07-06')));
  const [endDate, setEndDate] = useState<Date>(new Date(Date.parse('2019-07-14')));
  const [flightType, setFlightType] = useState<FlightType>(FlightType.International);
  const [flattenFlightRequirment, setFlattenFlightRequirment] = useState<FlattenFlightRequirment[]>([]);
  const [dataProvider, setDataProvider] = useState<DataProvider[]>([]);
  const [targetPreplan, setTargetPreplan] = useState<Preplan>();
  const [showType, setShowType] = useState(false);
  const [showFrequency, setShowFrequency] = useState(false);
  const [showNote, setShowNote] = useState(true);
  const [showSlot, setShowSlot] = useState(true);

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

  const generateReportDataModel = (): FlattenFlightRequirment[] => {
    const result: FlattenFlightRequirment[] = [];
    if (!baseAirport || !startDate || !endDate || startDate < fromDate || startDate > toDate || endDate < fromDate || endDate > toDate) return [];

    const labels = flightRequirments
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

    const baseDate = new Date(new Date((startDate.getTime() + endDate.getTime()) / 2));

    labels.forEach(m => {
      const temp: FlattenFlightRequirment[] = [];

      const flattenFlightRequirments = flightRequirments
        .filter(f => f.definition.label === m)
        .map(f => {
          return f.days.map(d => ({
            flightNumber: f.definition.flightNumber,
            arrivalAirport: f.definition.arrivalAirport,
            departureAirport: f.definition.departureAirport,
            blocktime: d.scope.blockTime,
            day: d.day,
            std: d.flight.std,
            note: d.scope.slotComment,
            aircraftType: d.flight.aircraftRegister && d.flight.aircraftRegister.aircraftType.name,
            category: f.definition.category
          }));
        })
        .flat();

      const flattenFlightRequirmentList = flattenFlightRequirments.reduce(
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
            const weekDay = (current.day + existFlatten.diffLocalStdandUtcStd + 7) % 7;
            existFlatten.days.indexOf(weekDay) === -1 && existFlatten.days.push(weekDay);
            existFlatten.utcDays.indexOf(current.day) === -1 && existFlatten.utcDays.push(current.day);
            existFlatten['weekDay' + weekDay.toString()] = Math.random() > 0.1 ? '●' : Math.random() > 0.5 ? 'STB' : 'EXT';
          } else {
            const utcStd = current.std.toDate(baseDate);
            const localStd = current.departureAirport.convertUtcToLocal(utcStd);
            const utcSta = current.std.toDate(baseDate);
            utcSta.addMinutes(current.blocktime);
            const localSta = current.arrivalAirport.convertUtcToLocal(utcSta);

            const diffLocalStdandUtcStd = localStd.getUTCDay() - utcStd.getUTCDay();
            const diffLocalStdandUtcSta = localStd.getUTCDay() - utcSta.getUTCDay();
            const diffLocalStdandLocalSta = localStd.getUTCDay() - localSta.getUTCDay();

            const weekDay = (current.day + diffLocalStdandUtcStd + 7) % 7;

            const flatten = {
              flightNumber: normalizeFlightNumber(current.flightNumber),
              arrivalAirport: current.arrivalAirport,
              departureAirport: current.departureAirport,
              blocktime: current.blocktime,
              formatedBlockTime: formatMinuteToString(current.blocktime),
              days: [weekDay],
              utcDays: [current.day],
              std: current.std,
              sta: new Daytime(utcSta),
              note: current.note,
              localStd: formatDateToString(localStd),
              localSta: formatDateToString(localSta) + (diffLocalStdandLocalSta < 0 ? '*' : diffLocalStdandLocalSta > 0 ? '#' : ''),
              utcStd: formatDateToString(utcStd) + (diffLocalStdandUtcStd < 0 ? '*' : diffLocalStdandUtcStd > 0 ? '#' : ''),
              utcSta: formatDateToString(utcSta) + (diffLocalStdandUtcSta < 0 ? '*' : diffLocalStdandUtcSta > 0 ? '#' : ''),
              diffLocalStdandUtcStd: diffLocalStdandUtcStd,
              diffLocalStdandLocalSta: diffLocalStdandLocalSta,
              diffLocalStdandUtcSta: diffLocalStdandUtcSta,
              route: current.departureAirport.name + '–' + current.arrivalAirport.name,
              aircraftType: current.aircraftType,
              internationalPermission: Math.random() > 0.5 ? 'OK' : 'NOT OK',
              domensticPermission: Math.random() > 0.5 ? 'OK' : 'NOT OK',
              label: m,
              category: current.category
            } as FlattenFlightRequirment;

            flatten['weekDay' + weekDay.toString()] = Math.random() > 0.1 ? '●' : Math.random() > 0.5 ? 'STB' : 'EXT';

            acc.push(flatten);
          }

          return acc;
        },
        [] as FlattenFlightRequirment[]
      );

      flattenFlightRequirmentList.sort((a, b) => compareFunction(a.std.minutes, b.std.minutes));

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

      flattenFlightRequirmentList.sort((a, b) => compareFunction(a.std.minutes, b.std.minutes));

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

      const route = temp
        .map(t => t.route)
        .reduce(
          (acc, current) => {
            if (acc.indexOf(current) === -1) acc.push(current);
            return acc;
          },
          [] as string[]
        )
        .join(',');

      const realFrequency = Math.floor(Math.random() * 6);
      const standbyFrequency = Math.floor(Math.random() * 3);
      const extraFrequency = Math.floor(Math.random() * 2);

      temp[0].realFrequency = realFrequency;
      temp[0].standbyFrequency = standbyFrequency;
      temp[0].extraFrequency = extraFrequency;

      temp.forEach(n => {
        n.parentRoute = route;
        result.push(n);
      });
    });

    const parentRoute = result
      .map(r => r.parentRoute)
      .reduce(
        (acc, current) => {
          if (acc.indexOf(current) === -1) acc.push(current);
          return acc;
        },
        [] as string[]
      );

    parentRoute.forEach(r => {
      const flatFlightRequirments = result.filter(f => f.parentRoute === r);
      const realFrequency = flatFlightRequirments
        .map(f => f.realFrequency)
        .reduce((acc, current) => {
          acc += +current ? +current : 0;
          return acc;
        }, 0);
      const standbyFrequency = flatFlightRequirments
        .map(f => f.standbyFrequency)
        .reduce((acc, current) => {
          acc += +current ? +current : 0;
          return acc;
        }, 0);
      const extraFrequency = flatFlightRequirments
        .map(f => f.extraFrequency)
        .reduce((acc, current) => {
          acc += +current ? +current : 0;
          return acc;
        }, 0);
      const frequency: number[] = [] as number[];
      realFrequency && frequency.push(realFrequency);
      standbyFrequency && frequency.push(standbyFrequency);
      extraFrequency && frequency.push(extraFrequency);
      flatFlightRequirments[0].frequency = frequency.join('+');
    });

    return result;
  };

  useEffect(() => {
    const flat = generateReportDataModel();
    setFlattenFlightRequirment(flat);
    const groupObject = flat.reduce(
      (acc, current) => {
        const category = current.category;
        acc[category] = acc[category] || [];
        acc[category].push(current);
        return acc;
      },
      {} as any
    );

    const result = Object.keys(groupObject).map(function(k) {
      if (groupObject.hasOwnProperty(k)) {
        return { field: 'category', items: groupObject[k], value: k, aggregates: {} } as DataProvider;
      }
    }) as DataProvider[];

    setDataProvider(result);
  }, [baseAirport, startDate, endDate, flightType, showType, showSlot, showFrequency]);

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
              setBaseAirport(allBaseAirport[+event.target.value]);
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
              setFlightType(event.target.value === 'Domestic' ? FlightType.Domestic : FlightType.International);

              setShowSlot(event.target.value !== 'Domestic');
              setShowNote(event.target.value !== 'Domestic');
              setShowType(event.target.value === 'Domestic');
              setShowFrequency(event.target.value === 'Domestic');
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
              if (ticks) setStartDate(new Date(ticks));
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
              if (ticks) setEndDate(new Date(ticks));
            }}
          />
        </Grid>

        <Grid item xs={6}>
          <FormControlLabel
            value="start"
            control={<Checkbox checked={showSlot} onChange={e => setShowSlot(e.target.checked)} color="primary" />}
            label="Show Slot"
            labelPlacement="start"
          />
        </Grid>

        <Grid item xs={6}>
          <FormControlLabel
            value="start"
            control={<Checkbox checked={showNote} onChange={e => setShowNote(e.target.checked)} color="primary" />}
            label="Show Note"
            labelPlacement="start"
          />
        </Grid>

        <Grid item xs={6}>
          <FormControlLabel
            value="start"
            control={<Checkbox checked={showType} onChange={e => setShowType(e.target.checked)} color="primary" />}
            label="Show Type"
            labelPlacement="start"
          />
        </Grid>

        <Grid item xs={6}>
          <FormControlLabel
            value="start"
            control={<Checkbox checked={showFrequency} onChange={e => setShowFrequency(e.target.checked)} color="primary" />}
            label="Show Frequency"
            labelPlacement="start"
          />
        </Grid>

        <Grid item xs={12}>
          <AutoComplete
            options={allPreplan}
            getOptionLabel={l => l.name}
            getOptionValue={l => l.id}
            onSelect={s => {
              setTargetPreplan(s);
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
            const options = proposalExporter.workbookOptions();
            const rows = options && options.sheets && options.sheets[0] && options.sheets[0].rows;

            if (rows) {
              rows[0] && (rows[0].height = 30);
              rows[1] && (rows[1].height = 30);
              if (rows[2]) {
                rows[2].height = 35;
                if (rows[2].cells) {
                  rows[2].cells[3].colSpan = 2;
                  rows[2].cells[5].colSpan = 2;
                  rows[2].cells.remove(rows[2].cells[6]);
                  rows[2].cells.remove(rows[2].cells[4]);

                  rows[2].cells.find(c => c.value && c.value.toString().startsWith('Sat'))!.fontFamily = 'Times New Roman';
                  rows[2].cells.find(c => c.value && c.value.toString().startsWith('Sun'))!.fontFamily = 'Times New Roman';
                  rows[2].cells.find(c => c.value && c.value.toString().startsWith('Mon'))!.fontFamily = 'Times New Roman';
                  rows[2].cells.find(c => c.value && c.value.toString().startsWith('Tue'))!.fontFamily = 'Times New Roman';
                  rows[2].cells.find(c => c.value && c.value.toString().startsWith('Wed'))!.fontFamily = 'Times New Roman';
                  rows[2].cells.find(c => c.value && c.value.toString().startsWith('Thu'))!.fontFamily = 'Times New Roman';
                  rows[2].cells.find(c => c.value && c.value.toString().startsWith('Fri'))!.fontFamily = 'Times New Roman';
                }
              }

              rows.forEach((r, index, self) => {
                if (!r.cells || r.cells.length === 0 || index <= 2) return;

                if (index > 0 && index < self.length - 1 && self && self[index - 1] && self[index - 1].cells) {
                  const previousFlightRequirment = self[index - 1] as any;
                  if (previousFlightRequirment.type === 'group-header') {
                    return;
                  }

                  if (previousFlightRequirment.cells) {
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
              });

              rows.forEach((r, index) => {
                if (index === 1 || index === 2 || !r.cells) return;
                const row = r as any;
                if (row.type === 'group-header') {
                  r.cells[0].colSpan = r.cells[0].colSpan! - 2;
                } else {
                  r.cells.remove(r.cells[r.cells.length - 1]);
                  r.cells.remove(r.cells[r.cells.length - 1]);
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
        fileName={"Proposal  '" + preplanName + "' " + new Date().format('~D$') + '.xlsx'}
        ref={exporter => {
          proposalExporter = exporter;
        }}
      >
        <ExcelExportColumnGroup
          title={'Propoal Schedule from ' + formatDate(startDate) + ' till ' + formatDate(endDate)}
          headerCellOptions={{ ...headerCellOptions, background: '#FFFFFF' }}
        >
          <ExcelExportColumnGroup title={'Base ' + baseAirport.name} headerCellOptions={{ ...headerCellOptions, background: '#F4B084' }}>
            <ExcelExportColumn
              title="F/N"
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
              width={35}
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
              width={35}
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
              width={35}
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
              width={35}
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
              width={22}
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
              width={22}
              cellOptions={{ ...detailCellOption }}
              headerCellOptions={{ ...headerCellOptions, wrap: true, background: '#F4B084', borderTop: { color: '#000000', size: 3 }, borderBottom: { color: '#000000', size: 3 } }}
            />

            <ExcelExportColumn
              title={['Mon', '1'].join('\r\n')}
              field="weekDay2"
              width={24}
              cellOptions={{ ...detailCellOption }}
              headerCellOptions={{ ...headerCellOptions, wrap: true, background: '#F4B084', borderTop: { color: '#000000', size: 3 }, borderBottom: { color: '#000000', size: 3 } }}
            />

            <ExcelExportColumn
              title={['Tue', '2'].join('\r\n')}
              field="weekDay3"
              width={22}
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
              width={22}
              cellOptions={{ ...detailCellOption }}
              headerCellOptions={{ ...headerCellOptions, wrap: true, background: '#F4B084', borderTop: { color: '#000000', size: 3 }, borderBottom: { color: '#000000', size: 3 } }}
            />

            <ExcelExportColumn
              title={['Fri', '5'].join('\r\n')}
              field="weekDay6"
              width={22}
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
              width={35}
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
            {/* <ExcelExportColumn field="category" title="Category" hidden={true} /> */}
            {showNote && (
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

            {showSlot && (
              <ExcelExportColumn
                title={['INTL.', 'SLOT(UTC)'].join('\r\n')}
                field="internationalPermission"
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
            {showSlot && (
              <ExcelExportColumn
                title={['DOM.', 'SLOT(LCL)'].join('\r\n')}
                field="domensticPermission"
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

            {showType && (
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

            {showFrequency && (
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
        <ExcelExportColumn title="Company" field="category" hidden={true} />
        <ExcelExportColumn title="parentRoute" field="parentRoute" />
        <ExcelExportColumn title="label" field="label" />
      </ExcelExport>

      <Table className={classNames(classes.marginBottom1, classes.marginRight1)}>
        <TableHead>
          <TableRow>
            <TableCell className={classes.boarder} align="center" colSpan={19}>
              {baseAirport ? 'Base ' + baseAirport.name : ''}
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
            {showNote && (
              <TableCell className={classes.boarder} align="center">
                <div>NOTE</div>
                <div>(base on domestic/lcl)</div>
              </TableCell>
            )}
            {showSlot && (
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
            {showType && (
              <TableCell className={classes.boarder} align="center">
                Type
              </TableCell>
            )}

            {showFrequency && (
              <TableCell className={classes.boarder} align="center">
                Fre
              </TableCell>
            )}
          </TableRow>
        </TableHead>

        <TableBody>
          {dataProvider.map(d => (
            <Fragment>
              {d.value && (
                <TableRow>
                  <TableCell>{d.value}</TableCell>
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
                  <TableCell align="center" className={classNames(classes.boarder, classes.rsx)}>
                    {/* {f.days.indexOf(0) !== -1 ? <BulletIcon className={classes.bullet} /> : undefined} */}
                    {f.weekDay0}
                  </TableCell>
                  <TableCell align="center" className={classNames(classes.boarder, classes.rsx)}>
                    {f.weekDay1}
                  </TableCell>
                  <TableCell align="center" className={classNames(classes.boarder, classes.rsx)}>
                    {f.weekDay2}
                  </TableCell>
                  <TableCell align="center" className={classNames(classes.boarder, classes.rsx)}>
                    {f.weekDay3}
                  </TableCell>
                  <TableCell align="center" className={classNames(classes.boarder, classes.rsx)}>
                    {f.weekDay4}
                  </TableCell>
                  <TableCell align="center" className={classNames(classes.boarder, classes.rsx)}>
                    {f.weekDay5}
                  </TableCell>
                  <TableCell align="center" className={classNames(classes.boarder, classes.rsx)}>
                    {f.weekDay6}
                  </TableCell>
                  <TableCell align="center" className={classes.boarder}>
                    {formatMinuteToString(f.blocktime)}
                  </TableCell>
                  {showNote && (
                    <TableCell align="center" className={classes.boarder}>
                      {f.note}
                    </TableCell>
                  )}

                  {showSlot && (
                    <Fragment>
                      <TableCell className={classes.boarder} align="center">
                        {f.internationalPermission}
                      </TableCell>

                      <TableCell className={classes.boarder} align="center">
                        {f.domensticPermission}
                      </TableCell>
                    </Fragment>
                  )}
                  {showType && (
                    <TableCell className={classes.boarder} align="center">
                      {f.aircraftType}
                    </TableCell>
                  )}

                  {showFrequency && (
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
