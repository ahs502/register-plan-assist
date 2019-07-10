import React, { FC } from 'react';
import { Theme, Paper } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import Flight from 'src/view-models/flight/Flight';
import Daytime from '@core/types/Daytime';
import PreplanAircraftRegister, { PreplanAircraftRegisters } from 'src/view-models/PreplanAircraftRegister';
import { ChangeLog } from 'src/view-models/AutoArrangerState';
import { TimelineOptions, DataItem, DataGroup, DateType } from 'vis';
import '../../../../../node_modules/vis/dist/vis.css';
import Timeline from 'react-visjs-timeline';

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
  onFreeSpaceMouseHover(aircraftRegister: PreplanAircraftRegister, day: number, time: Daytime, previousFlight: Flight | null, nextFlight: Flight | null): void;
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
    return {
      id: f.derivedId,
      start: new Date(startDate.getTime() + (f.day * 24 * 60 + f.std.minutes) * 60 * 1000),
      end: new Date(startDate.getTime() + (f.day * 24 * 60 + f.std.minutes + f.blockTime) * 60 * 1000),
      group: f.aircraftRegister ? f.aircraftRegister.id : '???',
      // group: groups.find(g => g.id === (f.aircraftRegister ? f.aircraftRegister.id : '???')),
      content: f.arrivalAirport.name + '-' + f.departureAirport.name,
      title: f.label,
      subgroup: f.aircraftRegister ? f.aircraftRegister.aircraftType.name : '???',
      type: 'range'
    };
  });

  const options: TimelineOptions = {
    width: '100%',
    height: 'calc(100vh - 159px)',
    stack: false,
    showMajorLabels: true,
    showCurrentTime: false,
    zoomMin: 1000000,
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
  debugger;
  return (
    <Timeline
      groups={groups}
      items={items}
      options={options}
      contextmenuHandler={props => {
        debugger;
        alert('Right click!');
        props.event.preventDefault();
      }}
    />
  );
};

export default ResourceSchedulerView;
