import React, { FC } from 'react';
import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import Flight from 'src/view-models/flights/Flight';
import Daytime from '@core/types/Daytime';
import PreplanAircraftRegister, { PreplanAircraftRegisters } from 'src/view-models/PreplanAircraftRegister';
import { ChangeLog } from 'src/view-models/AutoArrangerState';
import { TimelineOptions, DataItem, DataGroup } from 'vis';
// import '../../../../../node_modules/vis/dist/vis.css';
import Timeline from 'react-visjs-timeline';
import 'src/visjs.css';
import { AircraftRegisterOptionsDictionary } from 'src/view-models/AircraftRegisterOptions';
const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '100%',
    height: 'calc(100vh - 159px)',
    overflowX: 'auto'
    // backgroundColor: 'yellow'
  }
}));

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
  startDate,
  flights,
  aircraftRegisters,
  changeLogs,
  selectedFlight,
  readonly,
  onFlightContextMenu,
  onFlightDragAndDrop,
  onFlightMouseHover,
  onFreeSpaceMouseHover
}) => {
  const classes = useStyles();

  const findAdjacentFlights = (items: DataItem[], groupId: string, FreeSpaceDateTime: Date) => {
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

  const groups: DataGroup[] = aircraftRegisters.items
    .filter(g => flights.find(f => f.aircraftRegister && f.aircraftRegister.name === g.name))
    .map(g => {
      return {
        id: g.id,
        title: g.name + '    ' + g.aircraftType.name,
        content: g.name + '    ' + g.aircraftType.name,
        subgroupOrder: g.aircraftType.name
      };
    });

  groups.sortBy('subgroupOrder');
  groups.push({
    id: '???',
    title: '???',
    content: '???',
    subgroupOrder: '???'
  });
  const items: DataItem[] = flights.map(f => {
    var start = new Date(startDate.getTime() + (f.day * 24 * 60 + f.std.minutes) * 60 * 1000);
    var startHours = start.getHours();
    var startMinutes = start.getMinutes();
    var end = new Date(startDate.getTime() + (f.day * 24 * 60 + f.std.minutes + f.blockTime) * 60 * 1000);
    var endHours = end.getHours();
    var endMinutes = end.getMinutes();
    return {
      id: f.derivedId,
      start: start,
      end: end,
      flight: f,
      group: f.aircraftRegister ? f.aircraftRegister.id : '???',
      // group: groups.find(g => g.id === (f.aircraftRegister ? f.aircraftRegister.id : '???')),
      // content: f.arrivalAirport.name + '-' + f.departureAirport.name,
      // content: `<div  style='color:white; font: roboto 8px'>${start.getHours()} : ${start.getMinutes()} <div>`,
      content: '',
      title: `
        <div>
          ${f.label} 
        </diu>
        <div> 
          ${f.flightNumber} ${f.departureAirport.name}&dash;${f.arrivalAirport.name}
        </div>
          <div >
            ${f.required ? 'R' : ''} |
            ${f.slot ? 'S' : ''} |
            ${Math.random() >= 0.5 ? '<i class="icon-locked"></i>' : ''} 
        </div>
        <div>
          STD:&nbsp;${startHours < 10 ? '0' + startHours.toString() : startHours}:${startMinutes < 10 ? '0' + startMinutes.toString() : startMinutes}
        </div>
          BlockTime:&nbsp;${f.blockTime}
        <div>
          STA:&nbsp;${endHours < 10 ? '0' + endHours.toString() : endHours}:${endMinutes < 10 ? '0' + endMinutes.toString() : endMinutes}
        </div>
        <div>
        </div>
      `,
      subgroup: f.aircraftRegister ? f.aircraftRegister.aircraftType.name : '???',
      type: 'range',
      arrival: f.arrivalAirport.name,
      departure: f.departureAirport.name,
      freez: true,
      required: f.required,
      slot: f.slot,
      label: f.label
    };
  });

  const options: TimelineOptions = {
    margin: {
      item: 5,
      axis: 5
    },
    template: function(item, element, data) {
      return `
        <div>
          ${item.label}&nbsp;${item.departure}&ndash;${item.arrival}
        </div>
        <div>
          ${item.required ? 'R' : ''}
          ${item.slot ? 'S' : ''}
          ${Math.random() >= 0.5 ? '<i class="icon-locked"></i>' : ''}
        </div>
      `;
    },
    width: '100%',
    height: 'calc(100vh - 159px)',
    stack: true,
    showMajorLabels: true,
    showCurrentTime: false,
    zoomMin: 30000000,
    type: 'background',
    editable: true,
    itemsAlwaysDraggable: true,
    orientation: 'top',
    // horizontalScroll: true,
    // rtl: true,

    start: new Date(startDate),
    end: new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000),
    max: new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000),
    min: new Date(startDate.getTime() - 24 * 60 * 60 * 1000),

    verticalScroll: true
    // zoomable: false
  };
  return (
    <Timeline
      mouseMoveHandler={props => {
        const adjacentItem = findAdjacentFlights(items, props.group, props.time);
        onFreeSpaceMouseHover(aircraftRegisters.items.filter(item => item.id === props.group)[0], adjacentItem[0], adjacentItem[1]);
      }}
      mouseOverHandler={props => {
        // onFreeSpaceMouseHover(AircraftRegisterOptionsDictionary[props.group], adjacentItem[0]&&adjacentItem[0].flight , adjacentItem[1].flight);
      }}
      groups={groups}
      items={items}
      options={options}
      contextmenuHandler={props => {
        alert('Right click!');
        props.event.preventDefault();
      }}
    />
  );
};

export default ResourceSchedulerView;
