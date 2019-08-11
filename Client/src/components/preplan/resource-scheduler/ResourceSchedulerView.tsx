import React, { FC, useState } from 'react';
import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import Flight from 'src/view-models/flights/Flight';
import Daytime from '@core/types/Daytime';
import PreplanAircraftRegister, { PreplanAircraftRegisters } from 'src/view-models/PreplanAircraftRegister';
import { ChangeLog } from 'src/view-models/AutoArrangerState';
import { DataGroup, DataItem, TimelineOptions, Id } from 'vis-timeline';
import Weekday from '@core/types/Weekday';
import VisTimeline from 'src/components/VisTimeline';
import moment from 'moment';

const useStyles = makeStyles((theme: Theme) => ({
  '@global': {
    '.vis-item': {
      border: '2px solid black'
    }
  },
  root: {
    width: '100%',
    height: 'calc(100vh - 159px)',
    overflowX: 'auto'
    // backgroundColor: 'yellow'
  }
}));

interface TimelineData {
  groups: DataGroup[];
  items: DataItem[];
  options: TimelineOptions;
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
  const [timelineData, setTimelineData] = useState<TimelineData>(() => {
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

    interface Bar {
      label: string;
      start: Date;
      end: Date;
      sections: {
        start: number;
        end: number;
      }[];
      icons: string[];
      notes: string;
    }

    const items = flights.map(
      (f): DataItem => {
        var start = new Date(startDate.getTime() + (f.day * 24 * 60 + f.std.minutes) * 60 * 1000);
        var end = new Date(startDate.getTime() + (f.day * 24 * 60 + f.std.minutes + f.blockTime) * 60 * 1000);
        return {
          id: f.derivedId,
          start,
          end,
          group: f.aircraftRegister ? f.aircraftRegister.id : '???',
          content: f.label,
          title: `
            <div>
              <div>
                ${f.label} 
              </diu>
              <div> 
                ${f.flightNumber} ${f.departureAirport.name}&dash;${f.arrivalAirport.name}
              </div>
              <div >
                ${f.required ? 'R' : ''} |
                ${f.arrivalPermission && f.departurePermission ? '' : 'P'} |
                ${Math.random() >= 0.5 ? '<i class="icon-locked"></i>' : ''} 
              </div>
              <div>
                STD:&nbsp;${start.format('t')}
              </div>
                BlockTime:&nbsp;${f.blockTime}
              <div>
                STA:&nbsp;${end.format('t')}
              </div>
            </div>
          `,
          type: 'range',
          data: f
        };
      }
    );

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
        axis: 5,
        item: {
          horizontal: 5,
          vertical: 5
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
        console.log('Moving', item.id);
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
      template: function(item, element, data) {
        const flight: Flight = item.data;
        return `
          <div style="border: 1px solid red; display: flex;">
            <div>
              ${flight.label}&nbsp;${flight.departureAirport.name}&ndash;${flight.arrivalAirport.name}
            </div>
            <div>
              ${flight.required ? 'R' : ''}
              ${flight.departurePermission && flight.arrivalPermission ? '' : 'P'}
              ${Math.random() >= 0.5 ? '<i class="icon-locked"></i>' : ''}
            </div>
          </div>
        `;
      },
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

    return { groups, items, options };
  });

  const classes = useStyles();

  const findAdjacentFlights = (items: DataItem[], groupId: Id, FreeSpaceDateTime: Date) => {
    var nextItem: any;
    var previousItem: any;
    const itemInGroups = items.filter(item => item.group === groupId).sort((a, b) => (a.start > b.start ? 1 : a.start < b.start ? -1 : 0));
    for (var i = 0; i < itemInGroups.length; i++) {
      if (+itemInGroups[i].start > +FreeSpaceDateTime) {
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
  };

  return (
    <VisTimeline
      {...timelineData}
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
