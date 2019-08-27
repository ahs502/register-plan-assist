import React, { FC, useState, Fragment, useRef } from 'react';
import { Theme, Menu, MenuItem, MenuList, ClickAwayListener, Paper } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import Flight from 'src/view-models/flights/Flight';
import Daytime from '@core/types/Daytime';
import PreplanAircraftRegister, { PreplanAircraftRegisters } from 'src/view-models/PreplanAircraftRegister';
import { ChangeLog } from 'src/view-models/AutoArrangerState';
import { DataGroup, DataItem, TimelineOptions, Id, Timeline } from 'vis-timeline';
import Weekday from '@core/types/Weekday';
import VisTimeline from 'src/components/VisTimeline';
import moment from 'moment';
import { Airport } from '@core/master-data';
import useProperty from 'src/utils/useProperty';
import FlightPack from 'src/view-models/flights/FlightPack';

const useStyles = makeStyles((theme: Theme) => ({
  '@global': {
    '.vis-timeline': {
      '& .vis-item': {
        '&.vis-range': {
          border: 'none',
          backgroundColor: 'transparent',
          // minWidth: 50,
          '& .vis-item-overflow': {
            // overflow: 'visible',
            '& .vis-item-content': {
              padding: 0,
              left: '0 !important',
              width: '100% !important'
            }
          },
          '&.vis-selected': {
            '& .vis-item-overflow': {
              boxShadow: '0px 0px 10px 1px green, inset 0px 0px 9px -1px green',
              borderRadius: '4px'
            }
          }
        }
      }
    },
    '.rpa-item-header': {
      display: 'flex',
      flexWrap: 'wrap',
      '& .rpa-item-time': {
        flexGrow: 1,
        fontSize: '8px',
        '&.rpa-item-std': {},
        '&.rpa-item-sta': {
          textAlign: 'right'
        }
      },
      '& .rpa-required-asterisk': {
        color: 'red',
        fontSize: '12px',
        lineHeight: '10px',
        '&.rpa-required-asterisk-full': {
          textShadow: '0 0 0.5px red'
        },
        '&.rpa-required-asterisk-semi': {
          opacity: 0.5
        }
      }
    },
    '.rpa-item-body': {
      display: 'flex',
      position: 'relative',
      border: '1px solid rgba(0, 20, 110, 0.5)',
      borderRadius: '3px',
      backgroundColor: 'rgba(0, 20, 110, 0.15)',
      '&.rpa-unknown-aircraft-register': {
        opacity: 0.5
      },
      '&.rpa-origin-permission': {
        borderLeftWidth: 4,
        '&.rpa-origin-permission-semi': {
          borderLeftStyle: 'double'
        }
      },
      '&.rpa-destination-permission': {
        borderRightWidth: 4,
        '&.rpa-destination-permission-semi': {
          borderRightStyle: 'double'
        }
      },
      '&.rpa-changed': {
        borderTopWidth: 2,
        borderBottomWidth: 2,
        borderTopStyle: 'dashed',
        borderBottomStyle: 'dashed'
      },
      '& .rpa-item-section': {
        position: 'absolute',
        top: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 20, 110, 0.15)'
      },
      '& .rpa-item-label': {
        flexGrow: 1,
        textAlign: 'center',
        fontSize: '16px',
        lineHeight: '25px',
        paddingTop: 1,
        textShadow: '0 0 2px #797979'
      },
      '& .rpa-dot': {
        display: 'inline-block',
        height: 5,
        width: 5,
        borderRadius: '50%',
        backgroundColor: 'white',
        border: '1px solid black',
        position: 'absolute',
        '&.rpa-dot-semi': {
          opacity: 0.4
        },
        '&.rpa-dot-left': { left: 1 },
        '&.rpa-dot-right': { right: 1 },
        '&.rpa-dot-top': { top: 1 },
        '&.rpa-dot-bottom': { bottom: 1 }
      }
    },
    '.rpa-item-footer': {
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      paddingTop: 2,
      maxHeight: 170,
      lineHeight: '8px',
      '& .rpa-item-icon': {
        fontSize: '10px',
        fontWeight: 'bold',
        border: '1px solid darkblue',
        borderRadius: 3,
        lineHeight: '11px',
        padding: '0px 2px',
        color: 'white',
        backgroundColor: 'darkblue',
        marginTop: 1,
        marginRight: 1,
        '&:last-of-type': {
          marginRight: 4
        }
      },
      '& div': {
        display: 'inline',
        fontSize: '10px'
      }
    }
  },
  contextMenu: {
    position: 'fixed',
    zIndex: theme.zIndex.tooltip
  }
}));

interface TimelineData {
  groups: DataGroup[];
  items: DataItem[];
  options: TimelineOptions;
}

interface FlightContextMenuModel {
  open?: boolean;
}

export interface ResourceSchedulerViewProps {
  startDate: Date;
  readonly: boolean;
  flights: readonly Flight[];
  flightPacks: readonly FlightPack[];
  aircraftRegisters: PreplanAircraftRegisters;
  changeLogs: readonly ChangeLog[];
  selectedFlightPack?: FlightPack;
  onSelectFlightPack(flightPack?: FlightPack): void;
  onFreezeFlightPack(flightPack: FlightPack, freezed: boolean): void;
  onRequireFlightPack(flightPack: FlightPack, required: boolean): void;
  onOpenFlightModal(flight: Flight): void;
  onOpenFlightPackModal(flightPack: FlightPack): void;
  onFlightPackDragAndDrop(flightPack: FlightPack, newStd0: Daytime, newAircraftRegister?: PreplanAircraftRegister): void;
  onFlightPackMouseHover(flightPack: FlightPack, flight?: Flight): void;
  onFreeSpaceMouseHover(aircraftRegister: PreplanAircraftRegister | null, previousFlightPack: FlightPack | null, nextFlightPack: FlightPack | null): void;
}

const ResourceSchedulerView: FC<ResourceSchedulerViewProps> = ({
  startDate,
  readonly,
  flights,
  flightPacks,
  aircraftRegisters,
  changeLogs,
  selectedFlightPack,
  onSelectFlightPack,
  onFreezeFlightPack,
  onRequireFlightPack,
  onOpenFlightModal,
  onOpenFlightPackModal,
  onFlightPackDragAndDrop,
  onFlightPackMouseHover,
  onFreeSpaceMouseHover
}) => {
  const timeline = useProperty<Timeline>(null as any);
  const [timelineData, setTimelineData] = useState<TimelineData>(() => {
    const groups = calculateTimelineGroups(flights, aircraftRegisters);
    const items = calculateTimelineItems(flightPacks, startDate);
    const options = calculateTimelineOptions(startDate);

    return { groups, items, options };
  });

  const [flightContextMenuModel, setFlightContextMenuModel] = useState<FlightContextMenuModel>({});
  const flightContextMenuRef = useRef<HTMLDivElement>(null);

  const classes = useStyles();

  return (
    <Fragment>
      <VisTimeline
        {...timelineData}
        retrieveTimeline={t => timeline(t)}
        onRangeChanged={properties => timeline().redraw()}
        onMouseMove={properties => {
          if (!properties.group) return;
          const adjacentItem = findAdjacentFlights(timelineData.items, properties.group, properties.time);
          onFreeSpaceMouseHover(aircraftRegisters.items.filter(item => item.id === properties.group)[0], adjacentItem[0], adjacentItem[1]);
        }}
        onMouseOver={properties => {
          // onFreeSpaceMouseHover(AircraftRegisterOptionsDictionary[props.group], adjacentItem[0]&&adjacentItem[0].flight , adjacentItem[1].flight);
        }}
        onContextMenu={properties => {
          properties.event.preventDefault();
          const item = timelineData.items.find(item => item.id === properties.item);
          if (!item) return;
          const { pageX, pageY } = properties;
          flightContextMenuRef.current!.style.top = `${pageY}px`;
          flightContextMenuRef.current!.style.left = `${pageX}px`;
          setFlightContextMenuModel({ open: true });
        }}
      />
      <ClickAwayListener onClickAway={() => setFlightContextMenuModel({ ...flightContextMenuModel, open: false })}>
        <div>
          <Paper ref={flightContextMenuRef} className={classes.contextMenu}>
            {flightContextMenuModel.open && (
              <MenuList>
                <MenuItem onClick={() => setFlightContextMenuModel({ ...flightContextMenuModel, open: false })}>Hi!</MenuItem>
                <MenuItem onClick={() => setFlightContextMenuModel({ ...flightContextMenuModel, open: false })}>Hi!</MenuItem>
              </MenuList>
            )}
          </Paper>
        </div>
      </ClickAwayListener>
    </Fragment>
  );
};

export default ResourceSchedulerView;

function calculateTimelineGroups(flights: readonly Flight[], aircraftRegisters: PreplanAircraftRegisters): DataGroup[] {
  const registers = aircraftRegisters.items.filter(r => flights.some(f => f.aircraftRegister && f.aircraftRegister.id === r.id)).sortBy('name');

  const types = registers
    .map(r => r.aircraftType)
    .distinct()
    .sortBy('displayOrder');

  const registerGroups = registers.map(
    (r): DataGroup => ({
      id: r.id,
      content: r.name,
      title: r.name,
      data: r
    })
  );

  const typeGroups = types.map(
    (t): DataGroup => ({
      id: t.id,
      content: t.name,
      title: t.name,
      nestedGroups: registers.filter(r => r.aircraftType.id === t.id).map(r => r.id),
      data: t
    })
  );

  const groups = registerGroups.concat(typeGroups).concat({
    id: '???',
    content: '???',
    title: 'Flights without allocated aircraft register'
  });

  return groups;
}

function itemTooltipTemplate(flightPack: FlightPack): string {
  return `
    <div>
      <div>
        <em><small>Label:</small></em>
        <strong>${flightPack.label}</strong>
      </div>
      <div>
        <em><small>Flights:</small></em>
        ${flightPack.flights
          .map(
            f => `
              <div>
                &nbsp;&nbsp;&nbsp;&nbsp;
                ${f.flightNumber}:
                ${f.departureAirport.name} (${f.std.toString()}) &dash;
                ${f.arrivalAirport.name} (${new Daytime(f.std.minutes + f.blockTime).toString()})
              </div>
            `
          )
          .join('')}
      </div>
      ${
        flightPack.icons.length === 0
          ? ''
          : `
              <div>
                <em><small>Flags:</small></em>
                ${flightPack.icons.map(i => `<strong>${i}</strong>`).join(' | ')}
              </div>
            `
      }
      ${
        !flightPack.notes
          ? ''
          : `
              <div>
                <em><small>Notes:</small></em>
                ${flightPack.notes}
              </div>
            `
      }
    </div>
  `;
}

function calculateTimelineItems(flightPacks: readonly FlightPack[], startDate: Date): DataItem[] {
  const items = flightPacks.map(
    (f): DataItem => ({
      id: f.derivedId,
      start: new Date(startDate.getTime() + (f.day * 24 * 60 + f.start.minutes) * 60 * 1000),
      end: new Date(startDate.getTime() + (f.day * 24 * 60 + f.end.minutes) * 60 * 1000),
      group: f.aircraftRegister ? f.aircraftRegister.id : '???',
      content: f.label,
      title: itemTooltipTemplate(f),
      type: 'range',
      data: f
    })
  );

  return items;
}

function itemTemplate(item: DataItem, element: HTMLElement, data: DataItem): string {
  const flightPack: FlightPack = item.data;
  return `
    <div class="rpa-item-header">
      <div class="rpa-item-time rpa-item-std">
        ${flightPack.start.toString(true)}
        ${flightPack.required === false ? '&nbsp;' : ''}
      </div>
      ${
        flightPack.required === true
          ? `<div class="rpa-required-asterisk rpa-required-asterisk-full">&#10045;</div>`
          : flightPack.required === undefined
          ? `<div class="rpa-required-asterisk rpa-required-asterisk-semi">&#10045;</div>`
          : ''
      }
      <div class="rpa-item-time rpa-item-sta">
        ${flightPack.required === false ? '&nbsp;' : ''}
        ${flightPack.end.toString(true)}
      </div>
    </div>
    <div class="rpa-item-body
    ${flightPack.knownAircraftRegister ? ' rpa-known-aircraft-register' : ' rpa-unknown-aircraft-register'}
    ${
      flightPack.originPermission === true
        ? ' rpa-origin-permission rpa-origin-permission-full'
        : flightPack.originPermission === undefined
        ? ' rpa-origin-permission rpa-origin-permission-semi'
        : ''
    }
    ${
      flightPack.destinationPermission === true
        ? ' rpa-destination-permission rpa-destination-permission-full'
        : flightPack.destinationPermission === undefined
        ? ' rpa-destination-permission rpa-destination-permission-semi'
        : ''
    }
    ${flightPack.changed === true ? ' rpa-changed rpa-changed-full' : flightPack.changed === undefined ? ' rpa-changed rpa-changed-semi' : ''}
    ">
      ${flightPack.sections.map(s => `<div class="rpa-item-section" style="left: ${s.start * 100}%; right: ${(1 - s.end) * 100}%;"></div>`).join(' ')}
      <div class="rpa-item-label">
        ${flightPack.label}
      </div>
      ${
        flightPack.freezed === true
          ? `
            <span class="rpa-dot rpa-dot-full rpa-dot-top rpa-dot-left"></span>
            <span class="rpa-dot rpa-dot-full rpa-dot-top rpa-dot-right"></span>
            <span class="rpa-dot rpa-dot-full rpa-dot-bottom rpa-dot-left"></span>
            <span class="rpa-dot rpa-dot-full rpa-dot-bottom rpa-dot-right"></span>
          `
          : flightPack.freezed === undefined
          ? `
            <span class="rpa-dot rpa-dot-semi rpa-dot-top rpa-dot-left"></span>
            <span class="rpa-dot rpa-dot-semi rpa-dot-top rpa-dot-right"></span>
            <span class="rpa-dot rpa-dot-semi rpa-dot-bottom rpa-dot-left"></span>
            <span class="rpa-dot rpa-dot-semi rpa-dot-bottom rpa-dot-right"></span>
          `
          : ''
      }
    </div>
    ${
      flightPack.icons.length === 0 && !flightPack.notes
        ? ''
        : `
            <div class="rpa-item-footer">
              ${flightPack.icons.map(i => `<span class="rpa-item-icon">${i}</span>`).join(' ')}
              ${flightPack.notes
                .split('')
                .map(c => `<div>${c === ' ' ? '&nbsp;' : c}</div>`)
                .join('')}
            </div>
          `
    }
  `;
}

function calculateTimelineOptions(startDate: Date): TimelineOptions {
  const options: TimelineOptions = {
    align: 'center',
    autoResize: true,
    clickToUse: false,
    // configure: false,
    dataAttributes: [],
    editable: {
      add: false,
      remove: false,
      updateGroup: true,
      updateTime: true,
      overrideItems: false
    },
    end: startDate.clone().addDays(7),
    format: {
      majorLabels(date, scale, step) {
        return Weekday[((new Date(date).setUTCHours(0, 0, 0, 0) - startDate.getTime()) / (24 * 60 * 60 * 1000) + 7) % 7].slice(0, 3);
      },
      minorLabels: {
        millisecond: 'HH:mm:ss',
        second: 'HH:mm',
        minute: 'HH:mm',
        hour: 'HH',
        weekday: 'H',
        day: 'H',
        week: 'H',
        month: 'H',
        year: 'H'
      }
    },
    groupEditable: false,
    // groupTemplate(group: DataGroup, element: HTMLElement, data: DataGroup): string { return ''; },
    // height: 0,
    horizontalScroll: false,
    itemsAlwaysDraggable: true,
    // locale: '',
    // locales: {},
    moment(date) {
      return moment(date).utc();
    },
    margin: {
      axis: 6,
      item: {
        horizontal: 6,
        vertical: 6
      }
    },
    max: startDate.clone().addDays(8),
    maxHeight: 'calc(100vh - 159px)',
    maxMinorChars: 5,
    min: startDate,
    minHeight: 'calc(100vh - 160px)',
    moveable: true,
    multiselect: false,
    multiselectPerGroup: false,
    // onAdd(item, callback) {},
    // onAddGroup(group, callback) {},
    // onDragObjectOnItem(objectData, item) {},
    // onInitialDrawComplete() {},
    onMove(item, callback) {
      //TODO: Apply to database...
    },
    // onMoveGroup(group, callback) {},
    onMoving(item, callback) {
      const flightPack: FlightPack = item.data;
      const originalStart = startDate.getTime() + (flightPack.day * 24 * 60 + flightPack.start.minutes) * 60 * 1000;
      const originalEnd = startDate.getTime() + (flightPack.day * 24 * 60 + flightPack.end.minutes) * 60 * 1000;
      const calclulatedStart = Date.parse(item.start as any);
      const calculatedEnd = Date.parse(item.end as any);
      // console.log('hi', (originalStart / 300000) % 1000, (originalEnd / 300000) % 1000, (calclulatedStart / 300000) % 1000, (calculatedEnd / 300000) % 1000);
      // if (originalStart === calclulatedStart && originalEnd !== calculatedEnd) {
      //   console.log('end');
      //   item.start = new Date(calculatedEnd + (originalStart - originalEnd));
      // }
      // if (originalStart !== calclulatedStart && originalEnd === calculatedEnd) {
      //   console.log('start');
      //   item.end = new Date(calclulatedStart + (originalEnd - originalStart));
      // }
      if (calculatedEnd - calclulatedStart !== originalEnd - originalStart) {
        item.start = new Date(originalStart);
        item.end = new Date(originalEnd);
      }
      callback(item);
    },
    // onRemove(item, callback) {},
    // onRemoveGroup(group, callback) {},
    // onUpdate(item, callback) {},
    orientation: 'top',
    rtl: false,
    selectable: true,
    showCurrentTime: false,
    showMajorLabels: true,
    showMinorLabels: true,
    showTooltips: true,
    stack: true,
    stackSubgroups: true,
    snap(date, scale, step) {
      const ticks = date.getTime(),
        timeStep = 5 * 60 * 1000,
        fraction = ticks % timeStep,
        rounded = Math.round(fraction / timeStep) * timeStep;
      return new Date(ticks - fraction + rounded);
    },
    start: startDate,
    template: itemTemplate,
    // timeAxis: {},
    type: 'range',
    tooltip: {
      followMouse: true,
      overflowMethod: 'cap'
    },
    tooltipOnItemUpdateTime: true, //{ template(itemData: DataItem) { return ''; } },
    verticalScroll: true,
    width: '100%',
    zoomable: true,
    zoomKey: 'ctrlKey',
    zoomMax: 315360000000000,
    zoomMin: 12 * 60 * 60 * 1000
  };

  return options;
}

function findAdjacentFlights(items: DataItem[], groupId: Id, freeSpaceDateTime: Date) {
  var nextItem: any;
  var previousItem: any;
  const itemInGroups = items.filter(item => item.group === groupId).sort((a, b) => (a.start > b.start ? 1 : a.start < b.start ? -1 : 0));
  for (var i = 0; i < itemInGroups.length; i++) {
    if (+itemInGroups[i].start > +freeSpaceDateTime) {
      nextItem = itemInGroups[i];
      if (i > 0) {
        previousItem = itemInGroups[i - 1];
      }
      break;
    }
  }
  if (!nextItem && itemInGroups.length) {
    previousItem = itemInGroups[itemInGroups.length - 1];
  }
  const nextFlight = !nextItem ? nextItem : nextItem.flight;
  const previousFlight = !previousItem ? previousItem : previousItem.flight;
  return [previousFlight, nextFlight];
}
