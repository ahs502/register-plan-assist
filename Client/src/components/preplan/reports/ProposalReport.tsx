import React, { FC, Fragment, useState, useEffect } from 'react';
import { Theme, InputLabel, TextField, TableHead, TableCell, Table, TableRow, TableBody, Button, Grid, FormControlLabel, Checkbox } from '@material-ui/core';
import { red, grey } from '@material-ui/core/colors';
import { makeStyles } from '@material-ui/styles';
import MasterData, { Airport } from '@core/master-data';
import FlightRequirement from 'src/business/flights/FlightRequirement';
import Daytime from '@core/types/Daytime';
import { Publish as ExportToExcelIcon } from '@material-ui/icons';
import { ExcelExport, ExcelExportColumn, ExcelExportColumnGroup } from '@progress/kendo-react-excel-export';
import { CellOptions } from '@progress/kendo-react-excel-export/dist/npm/ooxml/CellOptionsInterface';
import classNames from 'classnames';
import AutoComplete from 'src/components/AutoComplete';
import Preplan, { PreplanHeader } from 'src/business/Preplan';
import Weekday from '@core/types/Weekday';
import Rsx from '@core/types/flight-requirement/Rsx';
import AircraftIdentityType from '@core/types/aircraft-identity/AircraftIdentityType';
import { WorkbookSheetRow } from '@progress/kendo-ooxml';
import { parseMinute } from 'src/utils/model-parsers';
import PreplanService from 'src/services/PreplanService';

const makeColor = () => ({
  changeStatus: { background: '#FFFFCC' },
  realBoarder: { backgroundColor: '#FFC7CE' },
  noPermission: { color: red[600] },
  utc: { color: red[500] },
  internalPreplanDevider: { color: '#C660CE' },
  border: { color: grey[400] },
  excelHeader: { backgroundColor: '#F4B084' }
});

const useStyles = makeStyles((theme: Theme) => {
  const color = makeColor();
  return {
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
    internalPreplanDevider: {
      borderTopColor: color.internalPreplanDevider.color,
      borderTopStyle: 'solid',
      borderTopWidth: 'medium'
    },
    borderBottom: {
      borderBottomColor: theme.palette.common.black,
      borderBottomStyle: 'solid',
      borderBottomWidth: 'thick'
    },
    border: {
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
      color: color.utc.color
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
      color: color.noPermission.color
    },
    halfPermission: {
      position: 'relative',
      top: 2,
      fontSize: 26
    },
    changeStatus: {
      backgroundColor: color.changeStatus.background
    },
    realBoarder: {
      backgroundColor: color.realBoarder.backgroundColor
    },
    datePosition: {
      marginTop: theme.spacing(1)
    }
  };
});

const flightType = [{ label: 'International', value: 'International' }, { label: 'Domestic', value: 'Domestic' }];
const group = [{ field: 'category' }];

const character = {
  circle: '●',
  emptyCircle: '○',
  leftHalfBlackCircle: '◐',
  rightHalfBlackCircle: '◑'
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
  id: string;
  flightNumber: string;
  fullFlightNumber: string;
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
  originNoPermissionsWeekDay: number[];
  originNoPermissions: string;
  category: string;
  nextFlights: FlattenFlightRequirment[];
  previousFlights: FlattenFlightRequirment[];
  status: FlattenFlightRequirmentStatus;
}

interface FlattenFlightRequirmentStatus {
  isDeleted: boolean;
  isNew: boolean;
  routeChange: boolean;
  weekDay0: WeekDayStatus;
  weekDay1: WeekDayStatus;
  weekDay2: WeekDayStatus;
  weekDay3: WeekDayStatus;
  weekDay4: WeekDayStatus;
  weekDay5: WeekDayStatus;
  weekDay6: WeekDayStatus;
  localStd: TimeStatus;
  localSta: TimeStatus;
  utcStd: TimeStatus;
  utcSta: TimeStatus;
  duration: DurationStatus;
  note: NoteStatus;
}

interface WeekDayStatus {
  hasPermission: boolean;
  hasHalfPermission: boolean;
  isChange: boolean;
  isDeleted: boolean;
}

interface TimeStatus {
  isChange: boolean;
}

interface DurationStatus {
  isChange: boolean;
}

interface NoteStatus {
  isChange: boolean;
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
  destinationPermission: boolean;
  originPermission: boolean;
  rsx: Rsx;
}

interface DataProvider {
  field: string;
  items: FlattenFlightRequirment[];
  value: string;
  aggregates: any;
  countOfRealFlight: number;
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
  preplanHeader: PreplanHeader;
  compareMode: boolean;
}

const ProposalReport: FC<ProposalReportProps> = ({ flightRequirments: flightRequirments, preplanName, fromDate, toDate }) => {
  const allAirports = MasterData.all.airports.items.orderBy(a => a.name);
  const ika = allAirports.find(a => a.name === 'IKA')!;
  const thr = allAirports.find(a => a.name === 'THR')!;
  const mhd = allAirports.find(a => a.name === 'MHD')!;
  const ker = allAirports.find(a => a.name === 'KER')!;
  const allBaseAirport = [ika, thr, mhd, ker];
  const [dataProvider, setDataProvider] = useState<DataProvider[]>([]);
  const [preplanHeaders, setPreplanHeaders] = useState<ReadonlyArray<Readonly<PreplanHeader>>>([]);
  const [flattenFlightRequirments, setFlattenFlightRequirments] = useState<FlattenFlightRequirment[]>([]);
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
    showSTB2: true,
    showExtra: true,
    preplanHeader: {} as PreplanHeader,
    compareMode: false
  } as FliterModel);

  if (!preplanHeaders.length) {
    PreplanService.getAllHeaders().then(result => {
      if (result.message) {
        //TODO: handle error
      } else {
        const preplanHeader = result.value!.map(p => new PreplanHeader(p));
        preplanHeader.unshift({} as PreplanHeader);
        setPreplanHeaders(preplanHeader); //TODO: Remove this line later.
      }
    });
  }

  let proposalExporter: ExcelExport | null;

  const detailCellOption = {
    textAlign: 'center',
    verticalAlign: 'center',
    borderBottom: { color: grey[400], size: 1 },
    borderLeft: { color: grey[400], size: 1 },
    borderRight: { color: grey[400], size: 1 },
    borderTop: { color: grey[400], size: 1 },
    fontSize: 10,
    bold: true,
    wrap: true
  } as CellOptions;

  const headerCellOptions = {
    textAlign: 'center',
    verticalAlign: 'center',
    borderBottom: { color: grey[400], size: 1 },
    borderLeft: { color: grey[400], size: 1 },
    borderRight: { color: grey[400], size: 1 },
    borderTop: { color: grey[400], size: 1 },
    fontSize: 10,
    color: '#000000',
    bold: true
  } as CellOptions;

  const color = makeColor();
  const classes = useStyles();

  const generateReportDataModel = (
    { baseAirport, startDate, endDate, flightType, showReal, showSTB1, showSTB2, showExtra }: FliterModel,
    flightRequirments: readonly FlightRequirement[],
    generateRealFlight: boolean
  ): FlattenFlightRequirment[] => {
    const result: FlattenFlightRequirment[] = [];

    if (!baseAirport || !startDate || !endDate) return [];

    let labels = getLabels(flightRequirments, baseAirport, flightType);

    const baseDate = new Date(new Date((startDate.getTime() + endDate.getTime()) / 2));

    labels.forEach(m => {
      let dailyFlightRequirments = createDailyFlightRequirment(flightRequirments, m);

      // randomize(dailyFlightRequirments); //TODO: remove

      dailyFlightRequirments = fliterDailyFlightRequirmentByRSX(
        dailyFlightRequirments,
        generateRealFlight && showReal,
        generateRealFlight && showSTB1,
        !generateRealFlight && showSTB2,
        !generateRealFlight && showExtra
      );
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
    const realFlatModel = generateReportDataModel(filterModel, flightRequirments, true);
    const reserveFlatModel = generateReportDataModel(filterModel, flightRequirments, false);

    setFlattenFlightRequirmentsStatus(realFlatModel);
    setFlattenFlightRequirmentsStatus(reserveFlatModel);

    if (filterModel.compareMode) {
      const targetPreplan = filterModel.preplanHeader;
      const targetRealFlatModel = generateReportDataModel(filterModel, getPreplanFlightRequirments(targetPreplan.id), true);
      const targetReserveFlatModel = generateReportDataModel(filterModel, getPreplanFlightRequirments(targetPreplan.id), false);

      compareFlattenFlightRequirment(realFlatModel, targetRealFlatModel);
      realFlatModel.sort((first, second) => {
        const firstLabel = first.label;
        const secondLabel = second.label;
        return firstLabel > secondLabel ? 1 : firstLabel < secondLabel ? -1 : 0;
      });

      compareFlattenFlightRequirment(reserveFlatModel, targetReserveFlatModel);
      reserveFlatModel.sort((first, second) => {
        const firstLabel = first.label;
        const secondLabel = second.label;
        return firstLabel > secondLabel ? 1 : firstLabel < secondLabel ? -1 : 0;
      });
    }

    const realGroup = groupFlattenFlightRequirmentbyCategory(realFlatModel);
    const reserveGroup = groupFlattenFlightRequirmentbyCategory(reserveFlatModel);

    realGroup.forEach(d => {
      const groupInReserve = reserveGroup.find(r => r.value === d.value);
      if (groupInReserve) {
        d.countOfRealFlight = d.items.length;
        d.items = d.items.concat(groupInReserve.items);
        reserveGroup.remove(groupInReserve);
      }
    });

    setDataProvider(realGroup.concat(reserveGroup));
    setFlattenFlightRequirments(realFlatModel.concat(reserveFlatModel));
  }, [filterModel]);

  const exportToExcel = () => {
    if (!proposalExporter) return;
    const headerWeekDayCellNumbers = [5, 6, 7, 8, 9, 10, 11];
    const weekDaySaturdayCellNumber = 7;
    const numberOfHiddenColumn = 3;
    const options = proposalExporter.workbookOptions();
    const rows = options && options.sheets && options.sheets[0] && options.sheets[0].rows;

    if (!rows || rows.length === 0) return;

    const idColumnNumber = getIdColumnNumber(rows);
    setRowHeight(rows);

    rows.forEach((r, index, self) => {
      if (!r.cells || r.cells.length === 0) return;
      const row = r as any;

      setExcelBoarder(index, self, r);

      if (row.type === 'group-header') {
        setBoarderForGroupHeader(self, index);
        r.cells[0].colSpan! -= numberOfHiddenColumn;
      }

      if (row.type === 'data') {
        const id = r.cells![idColumnNumber].value;
        const model = flattenFlightRequirments.find(f => f.id === id)!;
        const weekdayWithoutPermission = model.originNoPermissionsWeekDay.concat(model.destinationNoPermissionsWeekDay).distinct();

        weekdayWithoutPermission.forEach(c => {
          r!.cells![weekDaySaturdayCellNumber + c].color = color.noPermission.color;
        });

        setChangedBackgroundColor(model, r);
        setFontSizeForDayColumns(model, r);
      }
    });

    rows.forEach(r => {
      if (!r.cells || r.cells.length === 0) return;
      const row = r as any;
      if (row.type === 'data') {
        removeHiddenColumn(r);
      }
    });

    removeHiddenColumn(rows[0]);

    boarderBotoom(rows);
    rows && proposalExporter.props.data && insertDividerBetweenRealFlightAndStantbyFlight(proposalExporter.props.data, rows);

    proposalExporter.save(options);

    function setFontSizeForDayColumns(model: FlattenFlightRequirment, workbookSheetRow: WorkbookSheetRow) {
      Array.range(0, 6).forEach(d => {
        const weekDayStatus = (model.status as any)['weekDay' + d.toString()] as WeekDayStatus;
        if (!isRealFlight(model, d)) return;
        if (weekDayStatus.hasPermission) {
          workbookSheetRow!.cells![weekDaySaturdayCellNumber + d].fontSize = 16;
        } else if (!weekDayStatus.hasHalfPermission) {
          workbookSheetRow!.cells![weekDaySaturdayCellNumber + d].fontSize = 15;
        }
      });
    }

    function setChangedBackgroundColor(model: FlattenFlightRequirment, workbookSheetRow: WorkbookSheetRow) {
      if (!workbookSheetRow || !model || !workbookSheetRow.cells) return;

      Array.range(0, 6).forEach(d => {
        if (((model.status as any)['weekDay' + d.toString()] as WeekDayStatus).isChange)
          workbookSheetRow!.cells![weekDaySaturdayCellNumber + d].background = color.changeStatus.background;
      });

      if (model.status.routeChange) workbookSheetRow.cells![2].background = color.changeStatus.background;
      if (model.status.localStd && model.status.localStd.isChange) workbookSheetRow.cells[3].background = color.changeStatus.background;
      if (model.status.localSta && model.status.localSta.isChange) workbookSheetRow.cells[4].background = color.changeStatus.background;
      if (model.status.utcStd && model.status.utcStd.isChange) workbookSheetRow.cells[5].background = color.changeStatus.background;
      if (model.status.utcSta && model.status.utcSta.isChange) workbookSheetRow.cells[6].background = color.changeStatus.background;
      if (model.status.isNew) {
        workbookSheetRow.cells.forEach((c, index) => {
          if (index > 0) c.background = color.changeStatus.background;
        });
      }
    }

    function boarderBotoom(workbookSheetRows: WorkbookSheetRow[]) {
      if (!workbookSheetRows || workbookSheetRows.length === 0) return;
      const lastRow = workbookSheetRows[workbookSheetRows.length - 1]!;
      lastRow.cells!.forEach((c, index) => {
        if (index === 0) return;
        c.borderBottom = { color: '#000000', size: 3 };
      });
    }

    function removeHiddenColumn(workbookSheetRow: WorkbookSheetRow) {
      if (!workbookSheetRow || !workbookSheetRow.cells) return;
      for (let index = 0; index < numberOfHiddenColumn; index++) {
        workbookSheetRow.cells.remove(workbookSheetRow.cells[workbookSheetRow.cells.length - 1]);
      }
    }

    function getIdColumnNumber(rows: WorkbookSheetRow[]) {
      let idColumnNumber = 0;
      for (let index = 0; index < rows[0].cells!.length; index++) {
        const element = rows[0].cells![index];
        if (element.value && element.colSpan) {
          idColumnNumber += element.colSpan;
          if (element.value === 'id') break;
        }
      }

      return idColumnNumber;
    }

    function insertDividerBetweenRealFlightAndStantbyFlight(data: any[], workbookSheetRows: WorkbookSheetRow[]) {
      let countOfHeaderRow = workbookSheetRows.filter(w => (w as any).type === 'header').length;
      let numberOfGroupHeader = 1;
      let countOfAllPreviousRow = countOfHeaderRow;
      let groupHeader = workbookSheetRows.find(w => (w as any).type === 'group-header')!.cells![0];

      data.forEach(element => {
        const countOfRealFlightInCategory = element.countOfRealFlight;
        const countOfAllFlight = element.items.length;
        const insertIndex = countOfAllPreviousRow + countOfRealFlightInCategory + numberOfGroupHeader;
        numberOfGroupHeader++;
        countOfAllPreviousRow += countOfAllFlight;
        if (countOfRealFlightInCategory) {
          countOfAllPreviousRow++;
          workbookSheetRows.splice(insertIndex, 0, {
            cells: [
              { background: groupHeader.background },
              {
                value:
                  '‎' /**Left to right character dont remove it*/ +
                  element.value +
                  (element.value ? ': ' : '') +
                  (filterModel.showSTB2 ? 'STB2' : '') +
                  (filterModel.showExtra ? (filterModel.showSTB2 ? ' & EXT' : 'EXT') : ''),
                textAlign: 'left',
                borderLeft: { color: '#000000', size: 3 },
                borderRight: { color: '#000000', size: 3 },
                borderTop: { color: '#000000', size: 3 },
                borderBottom: { color: '#000000', size: 3 },
                background: color.realBoarder.backgroundColor,
                colSpan: groupHeader.colSpan! - 1
              }
            ],
            type: 'data'
          } as WorkbookSheetRow);
        }
      });
    }

    function setRowHeight(workbookSheetRows: WorkbookSheetRow[]) {
      workbookSheetRows[0] && (workbookSheetRows[0].height = 30);
      workbookSheetRows[1] && (workbookSheetRows[1].height = 30);
      if (workbookSheetRows[2]) {
        workbookSheetRows[2].height = 35;
        if (workbookSheetRows[2].cells) {
          workbookSheetRows[2].cells[3].colSpan = 2;
          workbookSheetRows[2].cells[5].colSpan = 2;
          workbookSheetRows[2].cells.remove(workbookSheetRows[2].cells[6]);
          workbookSheetRows[2].cells.remove(workbookSheetRows[2].cells[4]);

          headerWeekDayCellNumbers.forEach(c => {
            if (workbookSheetRows && workbookSheetRows[2] && workbookSheetRows[2].cells && workbookSheetRows[2].cells[c])
              workbookSheetRows[2].cells[c].fontFamily = 'Times New Roman';
          });
        }
      }
    }

    function setExcelBoarder(index: number, self: WorkbookSheetRow[], r: WorkbookSheetRow) {
      if (!r || !r.cells) return;
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
                c.borderTop = { color: color.internalPreplanDevider.color, size: 2 };
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
    }

    function setBoarderForGroupHeader(self: WorkbookSheetRow[], index: number) {
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
  };

  return (
    <Fragment>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Grid container spacing={1}>
            <Grid item xs={1}>
              <InputLabel htmlFor="base-airport" className={classes.marginBottom1}>
                Base Airport
              </InputLabel>
              <AutoComplete
                id="compare-preplan-base-airport"
                value={filterModel.baseAirport}
                options={allBaseAirport}
                getOptionLabel={l => l.name}
                getOptionValue={l => l.id}
                onSelect={s => {
                  setFilterModel({ ...filterModel, baseAirport: s });
                }}
              />
            </Grid>
            <Grid item xs={2}>
              <InputLabel htmlFor="flight-type" className={classes.marginBottom1}>
                Flight Type
              </InputLabel>

              <AutoComplete
                id="compare-preplan-flightType"
                options={flightType}
                value={filterModel.flightType === FlightType.International ? flightType.find(f => f.value === 'International') : flightType.find(f => f.value === 'Domestic')}
                onSelect={s => {
                  filterModel.flightType = s.value === 'Domestic' ? FlightType.Domestic : FlightType.International;
                  filterModel.showSlot = s.value !== 'Domestic';
                  filterModel.showNote = s.value !== 'Domestic';
                  filterModel.showType = s.value === 'Domestic';
                  filterModel.showFrequency = s.value === 'Domestic';
                  setFilterModel({ ...filterModel });
                }}
              />
            </Grid>
            <Grid item xs={3}>
              <InputLabel htmlFor="compare-preplan" className={classes.marginBottom1}>
                Compare with:
              </InputLabel>
              <AutoComplete
                id="compare-preplan"
                options={preplanHeaders}
                getOptionLabel={l => l.name}
                getOptionValue={l => l.id}
                onSelect={s => {
                  setFilterModel({ ...filterModel, preplanHeader: s, compareMode: !!s.id });
                }}
              />
            </Grid>
            <Grid item xs={1} className={classes.datePosition}>
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
            <Grid item xs={1} className={classes.datePosition}>
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
            <Grid item xs={4} />
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Grid container spacing={1}>
            <Grid item xs={1}>
              Columns:
            </Grid>
            <Grid item xs={2}>
              <FormControlLabel
                value="start"
                control={<Checkbox checked={filterModel.showSlot} onChange={e => setFilterModel({ ...filterModel, showSlot: e.target.checked })} color="primary" />}
                label="Show Slot"
                labelPlacement="end"
              />
            </Grid>

            <Grid item xs={2}>
              <FormControlLabel
                value="start"
                control={<Checkbox checked={filterModel.showNote} onChange={e => setFilterModel({ ...filterModel, showNote: e.target.checked })} color="primary" />}
                label="Show Note"
                labelPlacement="end"
              />
            </Grid>

            <Grid item xs={2}>
              <FormControlLabel
                value="start"
                control={<Checkbox checked={filterModel.showType} onChange={e => setFilterModel({ ...filterModel, showType: e.target.checked })} color="primary" />}
                label="Show Type"
                labelPlacement="end"
              />
            </Grid>

            <Grid item xs={3}>
              <FormControlLabel
                value="start"
                control={<Checkbox checked={filterModel.showFrequency} onChange={e => setFilterModel({ ...filterModel, showFrequency: e.target.checked })} color="primary" />}
                label="Show Frequency"
                labelPlacement="end"
              />
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Grid container spacing={1}>
            <Grid item xs={1}>
              Filter:
            </Grid>
            <Grid item xs={2}>
              <FormControlLabel
                value="start"
                control={<Checkbox checked={filterModel.showReal} onChange={e => setFilterModel({ ...filterModel, showReal: e.target.checked })} color="primary" />}
                label="Show Real"
                labelPlacement="end"
              />
            </Grid>

            <Grid item xs={2}>
              <FormControlLabel
                value="start"
                control={<Checkbox checked={filterModel.showSTB1} onChange={e => setFilterModel({ ...filterModel, showSTB1: e.target.checked })} color="primary" />}
                label="Show STB1"
                labelPlacement="end"
              />
            </Grid>

            <Grid item xs={2}>
              <FormControlLabel
                value="start"
                control={<Checkbox checked={filterModel.showSTB2} onChange={e => setFilterModel({ ...filterModel, showSTB2: e.target.checked })} color="primary" />}
                label="Show STB2"
                labelPlacement="end"
              />
            </Grid>

            <Grid item xs={3}>
              <FormControlLabel
                value="start"
                control={<Checkbox checked={filterModel.showExtra} onChange={e => setFilterModel({ ...filterModel, showExtra: e.target.checked })} color="primary" />}
                label="Show EXT"
                labelPlacement="end"
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <br />
      <Button className={classes.marginBottom2} variant="outlined" color="primary" onClick={() => exportToExcel()}>
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
          title={'Propoal Schedule from ' + filterModel.startDate.format('d') + ' till ' + filterModel.endDate.format('d')}
          headerCellOptions={{ ...headerCellOptions, background: '#FFFFFF' }}
        >
          <ExcelExportColumnGroup title={'Base ' + filterModel.baseAirport.name} headerCellOptions={{ ...headerCellOptions, background: color.excelHeader.backgroundColor }}>
            <ExcelExportColumn
              title={'F/N'}
              field="flightNumber"
              width={31}
              cellOptions={{ ...detailCellOption, borderLeft: { color: '#000000', size: 3 } }}
              headerCellOptions={{
                ...headerCellOptions,
                background: color.excelHeader.backgroundColor,
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
                background: color.excelHeader.backgroundColor,
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
                background: color.excelHeader.backgroundColor,
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
                background: color.excelHeader.backgroundColor,
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
                background: color.excelHeader.backgroundColor,
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
                background: color.excelHeader.backgroundColor,
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
                background: color.excelHeader.backgroundColor,
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
              headerCellOptions={{
                ...headerCellOptions,
                wrap: true,
                background: color.excelHeader.backgroundColor,
                borderTop: { color: '#000000', size: 3 },
                borderBottom: { color: '#000000', size: 3 }
              }}
            />

            <ExcelExportColumn
              title={['Mon', '1'].join('\r\n')}
              field="weekDay2"
              width={26}
              cellOptions={{ ...detailCellOption }}
              headerCellOptions={{
                ...headerCellOptions,
                wrap: true,
                background: color.excelHeader.backgroundColor,
                borderTop: { color: '#000000', size: 3 },
                borderBottom: { color: '#000000', size: 3 }
              }}
            />

            <ExcelExportColumn
              title={['Tue', '2'].join('\r\n')}
              field="weekDay3"
              width={26}
              cellOptions={{ ...detailCellOption }}
              headerCellOptions={{
                ...headerCellOptions,
                wrap: true,
                background: color.excelHeader.backgroundColor,
                borderTop: { color: '#000000', size: 3 },
                borderBottom: { color: '#000000', size: 3 }
              }}
            />

            <ExcelExportColumn
              title={['Wed', '3'].join('\r\n')}
              field="weekDay4"
              width={26}
              cellOptions={{ ...detailCellOption }}
              headerCellOptions={{
                ...headerCellOptions,
                wrap: true,
                background: color.excelHeader.backgroundColor,
                borderTop: { color: '#000000', size: 3 },
                borderBottom: { color: '#000000', size: 3 }
              }}
            />

            <ExcelExportColumn
              title={['Thu', '4'].join('\r\n')}
              field="weekDay5"
              width={26}
              cellOptions={{ ...detailCellOption }}
              headerCellOptions={{
                ...headerCellOptions,
                wrap: true,
                background: color.excelHeader.backgroundColor,
                borderTop: { color: '#000000', size: 3 },
                borderBottom: { color: '#000000', size: 3 }
              }}
            />

            <ExcelExportColumn
              title={['Fri', '5'].join('\r\n')}
              field="weekDay6"
              width={26}
              cellOptions={{ ...detailCellOption, borderRight: { color: '#000000', size: 3 } }}
              headerCellOptions={{
                ...headerCellOptions,
                wrap: true,
                background: color.excelHeader.backgroundColor,
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
                background: color.excelHeader.backgroundColor,
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
                  background: color.excelHeader.backgroundColor,
                  borderRight: { color: '#000000', size: 3 },
                  borderLeft: { color: '#000000', size: 3 },
                  borderTop: { color: '#000000', size: 3 },
                  borderBottom: { color: '#000000', size: 3 }
                }}
              />
            )}

            {filterModel.showSlot && (
              <ExcelExportColumn
                title={['DESTINATION', 'SLOT (LCL)'].join('\r\n')}
                field="destinationNoPermissions"
                width={70}
                cellOptions={{ ...detailCellOption, borderRight: { color: '#000000', size: 3 }, borderLeft: { color: '#000000', size: 3 } }}
                headerCellOptions={{
                  ...headerCellOptions,
                  wrap: true,
                  background: color.excelHeader.backgroundColor,
                  borderRight: { color: '#000000', size: 3 },
                  borderLeft: { color: '#000000', size: 3 },
                  borderTop: { color: '#000000', size: 3 },
                  borderBottom: { color: '#000000', size: 3 }
                }}
              />
            )}

            {filterModel.showSlot && (
              <ExcelExportColumn
                title={['ORIGIN', 'SLOT (UTC)'].join('\r\n')}
                field="originNoPermissions"
                width={85}
                cellOptions={{ ...detailCellOption, borderRight: { color: '#000000', size: 3 }, borderLeft: { color: '#000000', size: 3 } }}
                headerCellOptions={{
                  ...headerCellOptions,
                  wrap: true,
                  background: color.excelHeader.backgroundColor,
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
                  background: color.excelHeader.backgroundColor,
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
                  background: color.excelHeader.backgroundColor,
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
            <TableCell className={classes.border} align="center" colSpan={19}>
              {filterModel.baseAirport ? 'Base ' + filterModel.baseAirport.name : ''}
            </TableCell>
          </TableRow>
          <TableRow className={classes.borderBottom}>
            <TableCell className={classes.border} rowSpan={2}>
              F/N
            </TableCell>
            <TableCell className={classes.border} rowSpan={2}>
              ROUTE
            </TableCell>
            <TableCell className={classes.border} align="center" colSpan={2} rowSpan={2}>
              LCL
            </TableCell>
            <TableCell className={classNames(classes.border, classes.utc)} align="center" colSpan={2} rowSpan={2}>
              UTC
            </TableCell>
            <TableCell className={classes.border} align="center">
              <div>Sat</div>
              <div>6</div>
            </TableCell>
            <TableCell className={classes.border} align="center">
              <div>Sun</div>
              <div>7</div>
            </TableCell>
            <TableCell className={classes.border} align="center">
              <div>Mon</div>
              <div>1</div>
            </TableCell>
            <TableCell className={classes.border} align="center">
              <div>Tue</div>
              <div>2</div>
            </TableCell>
            <TableCell className={classes.border} align="center">
              <div>Wed</div>
              <div>3</div>
            </TableCell>
            <TableCell className={classes.border} align="center">
              <div>Thu</div>
              <div>4</div>
            </TableCell>
            <TableCell className={classes.border} align="center">
              <div>Fri</div>
              <div>5</div>
            </TableCell>
            <TableCell className={classes.border} align="center">
              DUR.
            </TableCell>
            {filterModel.showNote && (
              <TableCell className={classes.border} align="center">
                <div>NOTE</div>
                <div>(base on domestic/lcl)</div>
              </TableCell>
            )}
            {filterModel.showSlot && (
              <Fragment>
                <TableCell className={classes.border} align="center">
                  <div>DESTINATION</div>
                  <div>SLOT (LCL)</div>
                </TableCell>

                <TableCell className={classes.border} align="center">
                  <div>ORIGIN </div>
                  <div>SLOT (UTC)</div>
                </TableCell>
              </Fragment>
            )}
            {filterModel.showType && (
              <TableCell className={classes.border} align="center">
                Type
              </TableCell>
            )}

            {filterModel.showFrequency && (
              <TableCell className={classes.border} align="center">
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
                  <TableCell className={classNames(classes.category, classes.border)} colSpan={19}>
                    Category: {d.value}
                  </TableCell>
                </TableRow>
              )}
              {d.items.map((f, index, self) => (
                <Fragment>
                  {d.countOfRealFlight === index ? (
                    <TableRow>
                      <TableCell className={classNames(classes.category, classes.realBoarder, classes.border)} colSpan={19}>
                        {'‎' /**Left to right character dont remove it*/ +
                          d.value +
                          (d.value ? ': ' : '') +
                          (filterModel.showSTB2 ? 'STB2' : '') +
                          (filterModel.showExtra ? (filterModel.showSTB2 ? ' & EXT' : 'EXT') : '')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    <Fragment />
                  )}
                  <TableRow
                    key={index.toString() + f.label + f.flightNumber}
                    className={classNames(
                      index > 0 && self[index - 1].label !== f.label
                        ? self[index - 1].parentRoute !== f.parentRoute
                          ? classes.borderTopThick
                          : classes.internalPreplanDevider
                        : '',
                      f.status.isNew ? classes.changeStatus : ''
                    )}
                  >
                    <TableCell className={classes.border}>{f.flightNumber}</TableCell>
                    <TableCell className={classNames(classes.border, f.status.routeChange ? classes.changeStatus : '')}>{f.route}</TableCell>
                    <TableCell className={classNames(classes.border, f.status.localStd && f.status.localStd.isChange ? classes.changeStatus : '')} align="center">
                      {f.localStd}
                    </TableCell>
                    <TableCell className={classNames(classes.border, f.status.localSta && f.status.localSta.isChange ? classes.changeStatus : '')} align="center">
                      <div className={f.diffLocalStdandLocalSta !== 0 ? classes.diffContainer : ''}>
                        <span>{f.localSta}</span>
                      </div>
                    </TableCell>
                    <TableCell className={classNames(classes.border, classes.utc, f.status.utcStd && f.status.utcStd.isChange ? classes.changeStatus : '')} align="center">
                      <div className={f.diffLocalStdandUtcStd !== 0 ? classes.diffContainer : ''}>
                        <span>{f.utcStd}</span>
                      </div>
                    </TableCell>
                    <TableCell className={classNames(classes.border, classes.utc, f.status.utcSta && f.status.utcSta.isChange ? classes.changeStatus : '')} align="center">
                      <div className={f.diffLocalStdandUtcSta !== 0 ? classes.diffContainer : ''}>
                        <span>{f.utcSta}</span>
                      </div>
                    </TableCell>
                    <TableCell
                      align="center"
                      className={classNames(
                        classes.border,
                        isRealFlight(f, 0) ? classes.rsx : '',
                        !f.status.weekDay0.hasPermission ? classes.noPermission : '',
                        f.status.weekDay0.isChange ? classes.changeStatus : ''
                      )}
                    >
                      <div className={isRealFlight(f, 0) && f.status.weekDay0.hasHalfPermission ? classes.halfPermission : ''}>{f.weekDay0}</div>
                    </TableCell>
                    <TableCell
                      align="center"
                      className={classNames(
                        classes.border,
                        isRealFlight(f, 1) ? classes.rsx : '',
                        !f.status.weekDay1.hasPermission ? classes.noPermission : '',
                        f.status.weekDay1.isChange ? classes.changeStatus : ''
                      )}
                    >
                      <div className={isRealFlight(f, 1) && f.status.weekDay1.hasHalfPermission ? classes.halfPermission : ''}>{f.weekDay1}</div>
                    </TableCell>
                    <TableCell
                      align="center"
                      className={classNames(
                        classes.border,
                        isRealFlight(f, 2) ? classes.rsx : '',
                        !f.status.weekDay2.hasPermission ? classes.noPermission : '',
                        f.status.weekDay2.isChange ? classes.changeStatus : ''
                      )}
                    >
                      <div className={isRealFlight(f, 2) && f.status.weekDay2.hasHalfPermission ? classes.halfPermission : ''}>{f.weekDay2}</div>
                    </TableCell>
                    <TableCell
                      align="center"
                      className={classNames(
                        classes.border,
                        isRealFlight(f, 3) ? classes.rsx : '',
                        !f.status.weekDay3.hasPermission ? classes.noPermission : '',
                        f.status.weekDay3.isChange ? classes.changeStatus : ''
                      )}
                    >
                      <div className={isRealFlight(f, 3) && f.status.weekDay3.hasHalfPermission ? classes.halfPermission : ''}>{f.weekDay3}</div>
                    </TableCell>
                    <TableCell
                      align="center"
                      className={classNames(
                        classes.border,
                        isRealFlight(f, 4) ? classes.rsx : '',
                        !f.status.weekDay4.hasPermission ? classes.noPermission : '',
                        f.status.weekDay4.isChange ? classes.changeStatus : ''
                      )}
                    >
                      <div className={isRealFlight(f, 4) && f.status.weekDay4.hasHalfPermission ? classes.halfPermission : ''}>{f.weekDay4}</div>
                    </TableCell>
                    <TableCell
                      align="center"
                      className={classNames(
                        classes.border,
                        isRealFlight(f, 5) ? classes.rsx : '',
                        !f.status.weekDay5.hasPermission ? classes.noPermission : '',
                        f.status.weekDay5.isChange ? classes.changeStatus : ''
                      )}
                    >
                      <div className={isRealFlight(f, 5) && f.status.weekDay5.hasHalfPermission ? classes.halfPermission : ''}>{f.weekDay5}</div>
                    </TableCell>
                    <TableCell
                      align="center"
                      className={classNames(
                        classes.border,
                        isRealFlight(f, 6) ? classes.rsx : '',
                        !f.status.weekDay6.hasPermission ? classes.noPermission : '',
                        f.status.weekDay6.isChange ? classes.changeStatus : ''
                      )}
                    >
                      <div className={isRealFlight(f, 6) && f.status.weekDay6.hasHalfPermission ? classes.halfPermission : ''}>{f.weekDay6}</div>
                    </TableCell>
                    <TableCell align="center" className={classes.border}>
                      {parseMinute(f.blocktime)}
                    </TableCell>
                    {filterModel.showNote && (
                      <TableCell align="center" className={classes.border}>
                        {f.note}
                      </TableCell>
                    )}

                    {filterModel.showSlot && (
                      <Fragment>
                        <TableCell className={classes.border} align="center">
                          {f.destinationNoPermissions}
                        </TableCell>

                        <TableCell className={classes.border} align="center">
                          {f.originNoPermissions}
                        </TableCell>
                      </Fragment>
                    )}
                    {filterModel.showType && (
                      <TableCell className={classes.border} align="center">
                        {f.aircraftType}
                      </TableCell>
                    )}

                    {filterModel.showFrequency && (
                      <TableCell className={classes.border} align="center">
                        {f.frequency}
                      </TableCell>
                    )}
                  </TableRow>
                </Fragment>
              ))}
            </Fragment>
          ))}
        </TableBody>
      </Table>
    </Fragment>
  );
};

export default ProposalReport;

function groupFlattenFlightRequirmentbyCategory(realFlatModel: FlattenFlightRequirment[]) {
  const groupObject = realFlatModel.reduce(
    (acc, current) => {
      const category = current.category || '';
      acc[category] = acc[category] || [];
      acc[category].push(current);
      return acc;
    },
    {} as any
  );
  const result = Object.keys(groupObject)
    .sort()
    .map(function(k) {
      if (groupObject.hasOwnProperty(k)) {
        return { field: 'category', items: groupObject[k], value: k, aggregates: {} } as DataProvider;
      }
    }) as DataProvider[];
  return result;
}

function compareFlattenFlightRequirment(sources: FlattenFlightRequirment[], targets: FlattenFlightRequirment[]) {
  const sourceFlightNumbers = sources.map(s => s.fullFlightNumber).distinct();

  sourceFlightNumbers.forEach(f => {
    const source = sources.filter(s => s.fullFlightNumber === f);
    const target = targets.filter(s => s.fullFlightNumber === f);
    source.forEach(s => {
      const checkDay = checkDayChangeBaseOnTimes(s, target.filter(t => t.route === s.route));
    });

    source.forEach(s => {
      checkTimeChange(s, target.filter(t => t.route === s.route));
      checkDayChange(s, target.filter(t => t.route === s.route));
    });

    source.forEach(s => {
      checkDayChangeBaseOnTarget(s, target.filter(t => t.route === s.route));
    });

    source.forEach(s => {
      checkRouteChange(s, target.filter(t => t.route !== s.route));
      checkDayChangeBaseOnTimes(s, target.filter(t => t.route !== s.route));
    });

    source.forEach(s => {
      checkTimeChange(s, target.filter(t => t.route !== s.route));
      checkDayChange(s, target.filter(t => t.route !== s.route));
    });

    source.forEach(s => {
      checkDayChangeBaseOnTarget(s, target.filter(t => t.route !== s.route));
    });
  });

  checkNewFlight(sources, targets);
  checkDeletedFlight(sources, targets);

  function checkDayChangeBaseOnTimes(source: FlattenFlightRequirment, target: FlattenFlightRequirment[]) {
    const ffrMatchWithRouteandTime = target.find(t => t.utcSta === source.utcSta && t.utcStd === source.utcStd);
    if (ffrMatchWithRouteandTime) {
      source.days.forEach(d => {
        ((source.status as any)['weekDay' + d.toString()] as WeekDayStatus).isChange =
          ffrMatchWithRouteandTime.days.indexOf(d) === -1 ||
          ((source as any)['rsxWeekDay' + d.toString()] as Rsx) !== ((ffrMatchWithRouteandTime as any)['rsxWeekDay' + d.toString()] as Rsx);
        ffrMatchWithRouteandTime.days.remove(d);
      });
      ffrMatchWithRouteandTime.days.forEach(d => {
        ((source.status as any)['weekDay' + d.toString()] as WeekDayStatus).isChange = true;
      });

      target.remove(ffrMatchWithRouteandTime);

      return true;
    }

    return false;
  }

  function checkTimeChange(source: FlattenFlightRequirment, target: FlattenFlightRequirment[]) {
    const ffrMatchWithRoute = target;
    if (ffrMatchWithRoute.length === 0) {
      return;
    }

    source.status.localSta = { isChange: !ffrMatchWithRoute.some(f => f.localSta === source.localSta) };
    source.status.localStd = { isChange: !ffrMatchWithRoute.some(f => f.localStd === source.localStd) };
    source.status.utcSta = { isChange: !ffrMatchWithRoute.some(f => f.utcSta === source.utcSta) };
    source.status.utcStd = { isChange: !ffrMatchWithRoute.some(f => f.utcStd === source.utcStd) };
  }

  function checkDayChange(source: FlattenFlightRequirment, target: FlattenFlightRequirment[]) {
    const ffrMatchs = target;
    if (ffrMatchs.length === 0) return;

    source.days.forEach(d => {
      if (!ffrMatchs.some(f => f.days && f.days.length > 0)) return;
      const existFfrWithDay = ffrMatchs.find(f => {
        return f.days.indexOf(d) !== -1 && ((source as any)['rsxWeekDay' + d.toString()] as Rsx) === ((f as any)['rsxWeekDay' + d.toString()] as Rsx);
      });

      ((source.status as any)['weekDay' + d.toString()] as WeekDayStatus).isChange = !existFfrWithDay;

      if (existFfrWithDay) {
        existFfrWithDay.days.remove(d);
      }
    });

    for (let index = ffrMatchs.length - 1; index >= 0; index--) {
      const ffr = ffrMatchs[index];
      if (ffr.days.length === 0) ffrMatchs.remove(ffr);
    }
  }

  function checkDayChangeBaseOnTarget(source: FlattenFlightRequirment, target: FlattenFlightRequirment[]) {
    target.forEach(f => {
      f.days.forEach(d => {
        ((source.status as any)['weekDay' + d.toString()] as WeekDayStatus).isChange = true;
      });
    });
  }

  function checkRouteChange(source: FlattenFlightRequirment, target: FlattenFlightRequirment[]) {
    const ffrMatchWithRoute = target;
    if (ffrMatchWithRoute.length === 0) return;
    source.status.routeChange = true;
  }

  function checkDeletedFlight(source: FlattenFlightRequirment[], target: FlattenFlightRequirment[]) {
    if (target.length === 0) return;

    const targetFlightNumbers = target.map(s => s.fullFlightNumber).distinct();
    const sourceFlightNumbers = source.map(s => s.fullFlightNumber).distinct();

    const deletedFlightNumber = targetFlightNumbers.filter(t => !sourceFlightNumbers.includes(t));
    if (deletedFlightNumber.length === 0) return;

    const deletedFlattenFlightRequirments = target.filter(t => deletedFlightNumber.includes(t.fullFlightNumber));
    deletedFlattenFlightRequirments.forEach(f => {
      f.status = {} as FlattenFlightRequirmentStatus;
      f.status.isDeleted = true;

      f.weekDay0 = '';
      f.weekDay1 = '';
      f.weekDay2 = '';
      f.weekDay3 = '';
      f.weekDay4 = '';
      f.weekDay5 = '';
      f.weekDay6 = '';

      f.status.weekDay0 = f.days.includes(0) ? ({ isChange: true } as WeekDayStatus) : ({} as WeekDayStatus);
      f.status.weekDay1 = f.days.includes(1) ? ({ isChange: true } as WeekDayStatus) : ({} as WeekDayStatus);
      f.status.weekDay2 = f.days.includes(2) ? ({ isChange: true } as WeekDayStatus) : ({} as WeekDayStatus);
      f.status.weekDay3 = f.days.includes(3) ? ({ isChange: true } as WeekDayStatus) : ({} as WeekDayStatus);
      f.status.weekDay4 = f.days.includes(4) ? ({ isChange: true } as WeekDayStatus) : ({} as WeekDayStatus);
      f.status.weekDay5 = f.days.includes(5) ? ({ isChange: true } as WeekDayStatus) : ({} as WeekDayStatus);
      f.status.weekDay6 = f.days.includes(6) ? ({ isChange: true } as WeekDayStatus) : ({} as WeekDayStatus);

      source.push(f);
    });
  }

  function checkNewFlight(source: FlattenFlightRequirment[], target: FlattenFlightRequirment[]) {
    const targetFlightNumbers = target.map(s => s.fullFlightNumber).distinct();
    const sourceFlightNumbers = source.map(s => s.fullFlightNumber).distinct();

    const newFlightNumbers = sourceFlightNumbers.filter(t => !targetFlightNumbers.includes(t));
    if (newFlightNumbers.length === 0) return;
    newFlightNumbers.forEach(fn => {
      source
        .filter(s => s.fullFlightNumber === fn)
        .forEach(n => {
          n.status.isNew = true;
        });
    });
  }
}

function setFlattenFlightRequirmentsStatus(flattenFlightRequirments: FlattenFlightRequirment[]) {
  flattenFlightRequirments.forEach(r => {
    setFlattenFlightRequirmentStatus(r);
  });
}

function setFlattenFlightRequirmentStatus(flattenFlightRequirment: FlattenFlightRequirment) {
  flattenFlightRequirment.status = {
    isDeleted: false,
    isNew: false,
    weekDay0: genereateWeekDayStatus(flattenFlightRequirment, 0),
    weekDay1: genereateWeekDayStatus(flattenFlightRequirment, 1),
    weekDay2: genereateWeekDayStatus(flattenFlightRequirment, 2),
    weekDay3: genereateWeekDayStatus(flattenFlightRequirment, 3),
    weekDay4: genereateWeekDayStatus(flattenFlightRequirment, 4),
    weekDay5: genereateWeekDayStatus(flattenFlightRequirment, 5),
    weekDay6: genereateWeekDayStatus(flattenFlightRequirment, 6)
  } as FlattenFlightRequirmentStatus;

  function genereateWeekDayStatus(flattenFlightRequirment: FlattenFlightRequirment, day: number): WeekDayStatus {
    return {
      hasPermission: hasPermission(flattenFlightRequirment, day),
      hasHalfPermission: halfPermission(flattenFlightRequirment, day)
    } as WeekDayStatus;
  }
}

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
    n.note = n.notes.filter(Boolean).join(',');
    n.destinationNoPermissions =
      n.destinationNoPermissionsWeekDay.length === 0
        ? 'OK'
        : n.destinationNoPermissionsWeekDay.length === n.days.length
        ? 'NOT OK'
        : 'NOT OK for: ' + n.destinationNoPermissionsWeekDay.map(w => Weekday[w].substring(0, 3)).join(',');
    n.originNoPermissions =
      n.originNoPermissionsWeekDay.length === 0
        ? 'OK'
        : n.originNoPermissionsWeekDay.length === n.days.length
        ? 'NOT OK'
        : 'NOT OK for: ' + n.originNoPermissionsWeekDay.map(w => Weekday[w].substring(0, 3)).join(',');
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
      let nextOrPreviousFlight = self.find(f => {
        return f.departureAirport.id === current.arrivalAirport.id && (f.std.minutes > current.sta.minutes && f.utcDays.some(dd => dd === arrivalDay));
      });
      let dayDiff = 1;
      if (!nextOrPreviousFlight) {
        for (dayDiff = 1; dayDiff < 7; dayDiff++) {
          nextOrPreviousFlight = self.find(f => {
            return f.departureAirport.id === current.arrivalAirport.id && f.utcDays.some(dd => dd === (arrivalDay + dayDiff) % 7);
          });
          if (nextOrPreviousFlight) {
            nextOrPreviousFlight.utcDays.remove((arrivalDay + dayDiff) % 7);
            break;
          }

          nextOrPreviousFlight = self.find(f => {
            return f.departureAirport.id === current.arrivalAirport.id && f.utcDays.some(dd => dd === (arrivalDay - dayDiff + 6) % 7);
          });
          if (nextOrPreviousFlight) {
            nextOrPreviousFlight.utcDays.remove((arrivalDay - dayDiff + 6) % 7);
            break;
          }
        }
      } else {
        nextOrPreviousFlight.utcDays.remove(arrivalDay);
      }
      if (nextOrPreviousFlight) {
        if (dayDiff <= 3) {
          if (current.nextFlights.indexOf(nextOrPreviousFlight) === -1) current.nextFlights.push(nextOrPreviousFlight);
          if (nextOrPreviousFlight.previousFlights.indexOf(current) === -1) nextOrPreviousFlight.previousFlights.push(current);
        } else {
          if (current.previousFlights.indexOf(nextOrPreviousFlight) === -1) current.previousFlights.push(nextOrPreviousFlight);
          if (nextOrPreviousFlight.nextFlights.indexOf(current) === -1) nextOrPreviousFlight.nextFlights.push(current);
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
            destinationPermission: d.scope.destinationPermission,
            originPermission: d.scope.originPermission,
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
    fullFlightNumber: dailyFlightRequirment.flightNumber,
    arrivalAirport: dailyFlightRequirment.arrivalAirport,
    departureAirport: dailyFlightRequirment.departureAirport,
    blocktime: dailyFlightRequirment.blocktime,
    formatedBlockTime: parseMinute(dailyFlightRequirment.blocktime),
    days: [] as number[],
    utcDays: [] as number[],
    std: dailyFlightRequirment.std,
    sta: new Daytime(utcSta),
    notes: [] as string[],
    localStd: formatDateToHHMM(localStd),
    localSta: formatDateToHHMM(localSta) + (diffLocalStdandLocalSta < 0 ? '*' : ''),
    utcStd: formatDateToHHMM(utcStd) + (diffLocalStdandUtcStd < 0 ? '*' : diffLocalStdandUtcStd > 0 ? '#' : ''),
    utcSta: formatDateToHHMM(utcSta) + (diffLocalStdandUtcSta < 0 ? '*' : diffLocalStdandUtcSta > 0 ? '#' : ''),
    diffLocalStdandUtcStd: diffLocalStdandUtcStd,
    diffLocalStdandLocalSta: diffLocalStdandLocalSta,
    diffLocalStdandUtcSta: diffLocalStdandUtcSta,
    route: dailyFlightRequirment.departureAirport.name + '–' + dailyFlightRequirment.arrivalAirport.name,
    aircraftType: dailyFlightRequirment.aircraftType,
    originNoPermissionsWeekDay: [] as number[],
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

  if (flattenFlight.days.indexOf(weekDay) === -1) {
    flattenFlight.days.push(weekDay);

    if (!dialyFlightRequirment.originPermission) {
      flattenFlight.originNoPermissionsWeekDay.push(weekDay);
    }

    if (!dialyFlightRequirment.destinationPermission) {
      const arrivalWeekDay = flattenFlight.diffLocalStdandLocalSta > 0 ? (weekDay + 1) % 7 : weekDay;
      flattenFlight.destinationNoPermissionsWeekDay.push(arrivalWeekDay);
    }
  }

  flattenFlight.utcDays.indexOf(dialyFlightRequirment.day) === -1 && flattenFlight.utcDays.push(dialyFlightRequirment.day);
  flattenFlight.notes.indexOf(dialyFlightRequirment.note) === -1 && flattenFlight.notes.push(dialyFlightRequirment.note);
  (flattenFlight as any)['weekDay' + weekDay.toString()] = calculateDayCharacter();
  (flattenFlight as any)['rswWeekDay' + weekDay.toString()] = dialyFlightRequirment.rsx;
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
      if (dialyFlightRequirment.originPermission && dialyFlightRequirment.destinationPermission) return character.circle;
      if (!dialyFlightRequirment.originPermission && !dialyFlightRequirment.destinationPermission) return character.emptyCircle;
      if (!dialyFlightRequirment.originPermission) return character.leftHalfBlackCircle;
      return character.rightHalfBlackCircle;
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

function formatDateToHHMM(date: Date) {
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

function hasPermission(flattenFlightRequirment: FlattenFlightRequirment, day: number) {
  const destinationPermission = flattenFlightRequirment.destinationNoPermissionsWeekDay.includes(day);
  const domesticPermission = flattenFlightRequirment.originNoPermissionsWeekDay.includes(day);
  return !(destinationPermission || domesticPermission);
}

function halfPermission(flattenFlightRequirment: FlattenFlightRequirment, day: number) {
  const destinationPermission = flattenFlightRequirment.destinationNoPermissionsWeekDay.includes(day);
  const domesticPermission = flattenFlightRequirment.originNoPermissionsWeekDay.includes(day);
  return (destinationPermission && !domesticPermission) || (!destinationPermission && domesticPermission);
}

function isRealFlight(flattenFlightRequirment: FlattenFlightRequirment, day: number) {
  return (flattenFlightRequirment as any)['rswWeekDay' + day.toString()] === 'REAL';
}

function getPreplanFlightRequirments(preplanId: string) {
  //TODO get correct
  return [];
}
