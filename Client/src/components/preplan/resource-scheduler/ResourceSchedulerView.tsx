import React, { FC, useState } from 'react';
import { Theme } from '@material-ui/core';
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
      }
    },
    '.rpa-item-body': {
      display: 'flex',
      position: 'relative',
      border: '1px solid rgba(0, 20, 110, 0.5)',
      borderRadius: '3px',
      backgroundColor: 'rgba(0, 20, 110, 0.15)',
      '& .rpa-item-section': {
        position: 'absolute',
        top: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 20, 110, 0.15)'
      },
      '& .rpa-item-label': {
        flexGrow: 1,
        textAlign: 'center',
        fontSize: '110%',
        textShadow: '0 0 2px #797979'
      }
    },
    '.rpa-item-footer': {
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      paddingTop: 2,
      maxHeight: 170,
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
  }
}));

interface TimelineData {
  groups: DataGroup[];
  items: DataItem[];
  options: TimelineOptions;
}

interface Bar {
  id: string;
  label: string;
  register: string;
  flights: Flight[];
  day: number;
  start: Daytime;
  end: Daytime;
  sections: {
    start: number;
    end: number;
  }[];
  icons: string[];
  notes: string;
}

export interface ResourceSchedulerViewProps {
  startDate: Date;
  readonly: boolean;
  flights: readonly Flight[];
  aircraftRegisters: PreplanAircraftRegisters;
  changeLogs: readonly ChangeLog[];
  selectedFlight?: Flight;
  onFlightContextMenu(flight: Flight, pageX: number, pageY: number): void;
  onFlightDragAndDrop(flight: Flight, newStd: Daytime, newAircraftRegister: PreplanAircraftRegister): void;
  onFlightMouseHover(flight: Flight): void;
  onFreeSpaceMouseHover(aircraftRegister: PreplanAircraftRegister | null, previousFlight: Flight | null, nextFlight: Flight | null): void;
}

const ResourceSchedulerView: FC<ResourceSchedulerViewProps> = ({
  flights,
  startDate,
  aircraftRegisters,
  changeLogs,
  selectedFlight,
  readonly,
  onFlightContextMenu,
  onFlightDragAndDrop,
  onFlightMouseHover,
  onFreeSpaceMouseHover
}) => {
  const timeline = useProperty<Timeline>(null as any);
  const [timelineData, setTimelineData] = useState<TimelineData>(() => {
    const groups = calculateTimelineGroups(flights, aircraftRegisters);
    const bars = calculateTimelineBars(flights);
    const items = calculateTimelineItems(bars, startDate);
    const options = calculateTimelineOptions(startDate);

    return { groups, items, options };
  });

  const classes = useStyles();

  return (
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
        const item = timelineData.items.find(item => item.id === properties.item);
        if (!item) return;
        item.title = 'Renewed';
        console.log('item updated');
        properties.event.preventDefault();
      }}
    />
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

function getAirportBaseLevel(airport: Airport): number {
  switch (airport.name) {
    case 'IKA':
      return 4;
    case 'THR':
      return 3;
    case 'KER':
      return 2;
    case 'MHD':
      return 1;
    default:
      return 0;
  }
}

function calculateTimelineBars(flights: readonly Flight[]): Bar[] {
  const bars: Bar[] = [];
  const flightsByLabel = flights.groupBy('label');
  for (const label in flightsByLabel) {
    const flightsByRegister = flightsByLabel[label].groupBy(f => (f.aircraftRegister ? f.aircraftRegister.id : '???'));
    for (const register in flightsByRegister) {
      const flightGroup = flightsByRegister[register].sortBy(f => f.day * 24 * 60 + f.std.minutes, true);
      while (flightGroup.length) {
        const flight = flightGroup.pop()!;
        let lastFlight = flight;
        const bar: Bar = {
          id: flight.derivedId,
          label,
          register,
          flights: [flight],
          day: flight.day,
          start: flight.std,
          end: new Daytime(flight.std.minutes + flight.blockTime),
          sections: [{ start: 0, end: 1 }],
          // icons: [flight.required ? 'R' : '', flight.freezed ? 'F' : '', flight.departurePermission && flight.arrivalPermission ? '' : 'P'].filter(Boolean),
          icons: [Math.random() < 0.25 ? 'R' : '', Math.random() < 0.25 ? 'F' : '', Math.random() < 0.25 ? 'P' : ''].filter(Boolean),
          // notes: flight.notes
          notes: Math.random() < 0.4 ? '' : ['note', 'a longer note', 'some very very long note'][Math.floor(Math.random() * 3)]
        };
        bars.push(bar);
        if (getAirportBaseLevel(flight.departureAirport) <= getAirportBaseLevel(flight.arrivalAirport)) continue;
        while (flightGroup.length) {
          const nextFlight = flightGroup.pop()!;
          const lastDayDiff = (nextFlight.day - lastFlight.day) * 24 * 60;
          // Where next flight can NOT be appended to the bar:
          if (
            lastDayDiff + nextFlight.std.minutes <= lastFlight.std.minutes + lastFlight.blockTime ||
            lastDayDiff + nextFlight.std.minutes > lastFlight.std.minutes + lastFlight.blockTime + 20 * 60 ||
            nextFlight.departureAirport.id !== lastFlight.arrivalAirport.id ||
            nextFlight.departureAirport.id === flight.departureAirport.id
          ) {
            flightGroup.push(nextFlight);
            break;
          }
          const dayDiff = (nextFlight.day - bar.day) * 24 * 60;
          bar.flights.push(nextFlight);
          bar.end = new Daytime(dayDiff + nextFlight.std.minutes + nextFlight.blockTime);
          lastFlight = nextFlight;
        }
        bar.sections = bar.flights.map(f => {
          const dayDiff = (f.day - bar.day) * 24 * 60;
          return {
            start: (dayDiff + f.std.minutes - bar.start.minutes) / (bar.end.minutes - bar.start.minutes),
            end: (dayDiff + f.std.minutes + f.blockTime - bar.start.minutes) / (bar.end.minutes - bar.start.minutes)
          };
        });
      }
    }
  }
  return bars;
}

function itemTooltipTemplate(bar: Bar): string {
  return `
    <div>
      <div>
        <em><small>Label:</small></em>
        <strong>${bar.label}</strong>
      </div>
      <div>
        <em><small>Flights:</small></em>
        ${bar.flights
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
        bar.icons.length === 0
          ? ''
          : `
              <div>
                <em><small>Flags:</small></em>
                ${bar.icons.map(i => `<strong>${i}</strong>`).join(' | ')}
              </div>
            `
      }
      ${
        !bar.notes
          ? ''
          : `
              <div>
                <em><small>Notes:</small></em>
                ${bar.notes}
              </div>
            `
      }
    </div>
  `;
}

function calculateTimelineItems(bars: Bar[], startDate: Date): DataItem[] {
  const items = bars.map(
    (b): DataItem => ({
      id: b.id,
      start: new Date(startDate.getTime() + (b.day * 24 * 60 + b.start.minutes) * 60 * 1000),
      end: new Date(startDate.getTime() + (b.day * 24 * 60 + b.end.minutes) * 60 * 1000),
      group: b.register,
      content: b.label,
      title: itemTooltipTemplate(b),
      type: 'range',
      data: b
    })
  );

  return items;
}

function itemTemplate(item: DataItem, element: HTMLElement, data: DataItem): string {
  const bar: Bar = item.data;
  return `
    <div class="rpa-item-header">
      <div class="rpa-item-time rpa-item-std">
        ${bar.start.toString(true)}&nbsp;
      </div>
      <div class="rpa-item-time rpa-item-sta">
        ${bar.end.toString(true)}
      </div>
    </div>
    <div class="rpa-item-body">
      ${bar.sections.map(s => `<div class="rpa-item-section" style="left: ${s.start * 100}%; right: ${(1 - s.end) * 100}%;"></div>`).join(' ')}
      <div class="rpa-item-label">
        ${bar.label}
      </div>
    </div>
    ${
      bar.icons.length === 0 && !bar.notes
        ? ''
        : `
            <div class="rpa-item-footer">
              ${bar.icons.map(i => `<span class="rpa-item-icon">${i}</span>`).join(' ')}
              ${bar.notes
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
    itemsAlwaysDraggable: true,
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
    maxMinorChars: 5,
    maxHeight: 'calc(100vh - 159px)',
    min: startDate,
    minHeight: 'calc(100vh - 160px)',
    onMove(item, callback) {
      console.log('Move', item.id);
      callback(item);
    },
    onMoving(item, callback) {
      if (item.group) console.log('Moving', item.id);
      callback(item);
    },
    orientation: 'top',
    showCurrentTime: false,
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
    tooltip: {
      followMouse: true,
      overflowMethod: 'cap'
    },
    tooltipOnItemUpdateTime: true,
    verticalScroll: true,
    width: '100%',
    zoomable: true,
    zoomKey: 'ctrlKey',
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
  console.log(previousFlight && previousFlight.arrivalAirport.name, nextFlight && nextFlight.departureAirport.name);
  return [previousFlight, nextFlight];
}
