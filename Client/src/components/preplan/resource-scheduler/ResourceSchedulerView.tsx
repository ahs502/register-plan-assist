import React, { FC, useState, Fragment, useRef, useMemo, memo } from 'react';
import { Theme, Menu, MenuItem, MenuList, ClickAwayListener, Paper, ListItemIcon, Typography, Divider } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Check as CheckIcon } from '@material-ui/icons';
import Flight from 'src/business/flights/Flight';
import Daytime from '@core/types/Daytime';
import PreplanAircraftRegister, { PreplanAircraftRegisters } from 'src/business/PreplanAircraftRegister';
import { ChangeLog } from 'src/business/AutoArrangerState';
import { DataGroup, DataItem, TimelineOptions, Id, Timeline } from 'vis-timeline';
import Weekday from '@core/types/Weekday';
import VisTimeline from 'src/components/VisTimeline';
import moment from 'moment';
import useProperty from 'src/utils/useProperty';
import FlightPack from 'src/business/flights/FlightPack';
import { AircraftType, AircraftRegister } from '@core/master-data';

const useStyles = makeStyles((theme: Theme) => ({
  '@global': {
    '.vis-timeline': {
      '& .vis-panel': {
        '& .vis-labelset': {
          '& .vis-label': {
            '&.vis-nesting-group': {
              '& .vis-inner': { padding: 0 }
            }
          }
        },
        '& .vis-item': {
          '&.vis-background': {
            '&.rpa-group-item-aircraft-type': { backgroundColor: 'rgba(71, 90, 152, 0.16)' },
            '&.rpa-group-item-backup-aircraft-register': { backgroundColor: 'rgba(255, 255, 142, 0.2)' },
            '&.rpa-group-item-unknown-aircraft-register': { backgroundColor: 'rgba(192, 192, 192, 0.2)' }
          },
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
  },
  semiCheckIcon: {
    opacity: 0.3
  }
}));

interface FlightPackContextMenuModel {
  open?: boolean;
  flightPack?: FlightPack;
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
  // onViewChange(start?:Date,end?:Date,)
  onFreezeFlightPack(flightPack: FlightPack, freezed: boolean): void;
  onRequireFlightPack(flightPack: FlightPack, required: boolean): void;
  onIgnoreFlightPack(flightPack: FlightPack): void;
  onOpenFlightModal(flight: Flight): void;
  onOpenFlightPackModal(flightPack: FlightPack): void;
  onFlightPackDragAndDrop(flightPack: FlightPack, deltaStd: number, newAircraftRegister?: PreplanAircraftRegister): void;
  onFlightPackMouseHover(flightPack: FlightPack): void;
  onFreeSpaceMouseHover(aircraftRegister: PreplanAircraftRegister, previousFlightPack?: FlightPack, nextFlightPack?: FlightPack): void;
  onNowhereMouseHover(): void;
}

const ResourceSchedulerView: FC<ResourceSchedulerViewProps> = memo(
  ({
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
    onIgnoreFlightPack,
    onOpenFlightModal,
    onOpenFlightPackModal,
    onFlightPackDragAndDrop,
    onFlightPackMouseHover,
    onFreeSpaceMouseHover,
    onNowhereMouseHover
  }) => {
    const timeline = useProperty<Timeline>(null as any);
    const timelineStart = useProperty<Date | undefined>(undefined);
    const timelineEnd = useProperty<Date | undefined>(undefined);
    const timelineScrollTop = useProperty<number | undefined>(undefined);
    const timelineOptions = useMemo<TimelineOptions>(() => {
      return {
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
        end: timelineEnd() || startDate.clone().addDays(7),
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
        groupTemplate,
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
          const flightPack: FlightPack = item.data;
          const newAircraftRegister = aircraftRegisters.id[item.group as any];
          const deltaStd = Math.round((new Date(item.start).getTime() - flightPack.startDateTime(startDate).getTime()) / (5 * 60 * 1000)) * 5;
          onFlightPackDragAndDrop(flightPack, deltaStd, newAircraftRegister);
          callback(item);
        },
        // onMoveGroup(group, callback) {},
        onMoving(item, callback) {
          if ((item.group as string).startsWith('T')) return callback(null);
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
        start: timelineStart() || startDate,
        template: itemTemplate,
        // timeAxis: {},
        //type: 'range',
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

      function groupTemplate(group: DataGroup, element: HTMLElement, data: DataGroup): string {
        if (!group) return '';
        if ((group.id as string).startsWith('T'))
          return `
            <div>
              <small>${group.content}</small>
            </div>
          `;
        return `<div>${group.content}</div>`;
      }

      function itemTemplate(item: DataItem, element: HTMLElement, data: DataItem): string {
        if (item.className && item.className.startsWith('rpa-group-item-')) return '';

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
    }, [startDate.getTime()]);
    const timelineGroups = useMemo<DataGroup[]>(() => {
      // const registers = aircraftRegisters.items.filter(r => flights.some(f => f.aircraftRegister && f.aircraftRegister.id === r.id)).sortBy('name');
      const registers = aircraftRegisters.items
        .filter(r => r.options.status !== 'IGNORED')
        .sort((a, b) => {
          if (a.options.status === 'BACKUP' && b.options.status === 'INCLUDED') return 1;
          if (a.options.status === 'INCLUDED' && b.options.status === 'BACKUP') return -1;
          if (a.dummy && !b.dummy) return 1;
          if (!a.dummy && b.dummy) return -1;
          if (a.name > b.name) return 1;
          if (a.name < b.name) return -1;
          return 0;
        });

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
          id: 'T' + t.id,
          content: t.name,
          title: t.name,
          nestedGroups: registers.filter(r => r.aircraftType.id === t.id).map(r => r.id),
          data: t
        })
      );

      const groups = registerGroups.concat(typeGroups).concat({
        id: '???',
        content: '???',
        title: 'Flights without known allocated aircraft registers'
      });

      return groups;
    }, [aircraftRegisters]);
    const timelineItems = useMemo<DataItem[]>(() => {
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

      timelineGroups.forEach(group => {
        if ((group.id as string).startsWith('T')) {
          const aircraftType: AircraftType = group.data;
          return items.push({
            className: 'rpa-group-item-aircraft-type',
            id: group.id,
            start: timelineOptions.min!,
            end: timelineOptions.max,
            group: group.id,
            content: '',
            type: 'background',
            data: aircraftType
          });
        }
        if (group.id === '???')
          return items.push({
            className: 'rpa-group-item-unknown-aircraft-register',
            id: group.id,
            start: timelineOptions.min!,
            end: timelineOptions.max,
            group: group.id,
            content: '',
            type: 'background'
          });
        const aircraftRegister: PreplanAircraftRegister = group.data;
        if (aircraftRegister.options.status !== 'BACKUP') return;
        items.push({
          className: 'rpa-group-item-backup-aircraft-register',
          id: group.id,
          start: timelineOptions.min!,
          end: timelineOptions.max,
          group: group.id,
          content: '',
          type: 'background',
          data: aircraftRegister
        });
      });

      return items;

      function itemTooltipTemplate(flightPack: FlightPack): string {
        return `
          <div>
            <div>
              <em><small>Flight:</small></em>
              <strong>${flightPack.label}</strong>
              ${Weekday[flightPack.day]}s
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
    }, [startDate.getTime(), flightPacks, timelineOptions, timelineGroups]);

    const [flightPackContextMenuModel, setFlightPackContextMenuModel] = useState<FlightPackContextMenuModel>({});
    const flightPackContextMenuRef = useRef<HTMLDivElement>(null);

    const classes = useStyles();

    return (
      <Fragment>
        <VisTimeline
          options={timelineOptions}
          groups={timelineGroups}
          items={timelineItems}
          selection={selectedFlightPack && selectedFlightPack.derivedId}
          scrollTop={timelineScrollTop()}
          onScrollY={scrollTop => timelineScrollTop(scrollTop)}
          retrieveTimeline={t => timeline(t)}
          // onChanged={() => console.log('Timeline is rendered.')}
          onRangeChanged={({ start, end, byUser, event }) => {
            timelineStart(start);
            timelineEnd(end);
            timeline().redraw();
          }}
          onSelect={({ items, event }) => {
            const item = timelineItems.find(item => item.id === items[0]);
            onSelectFlightPack(item ? item.data : undefined);
          }}
          onContextMenu={properties => {
            properties.event.preventDefault();
            const item = timelineItems.find(item => item.id === properties.item);
            if (!item) return;
            const { pageX, pageY } = properties;
            flightPackContextMenuRef.current!.style.top = `${pageY}px`;
            flightPackContextMenuRef.current!.style.left = `${pageX}px`;
            setFlightPackContextMenuModel({ open: true, flightPack: item.data });
          }}
          onMouseOver={properties => {
            switch (properties.what) {
              case 'item':
                const item = timelineItems.find(item => item.id === properties.item);
                if (!item) return onNowhereMouseHover();
                onFlightPackMouseHover(item.data);
                break;

              case 'background':
                if (properties.group === '???') return onNowhereMouseHover();
                const register = aircraftRegisters.id[properties.group as any];
                if (!register) return onNowhereMouseHover();
                const registerFlightPacks = flightPacks.filter(f => !!f.aircraftRegister && f.aircraftRegister.id === register.id);
                if (registerFlightPacks.length === 0) return onFreeSpaceMouseHover(register);
                if (registerFlightPacks.length === 1) return onFreeSpaceMouseHover(register, registerFlightPacks[0], registerFlightPacks[0]);
                const firstFlightPack = registerFlightPacks[0],
                  lastFlightPack = registerFlightPacks[registerFlightPacks.length - 1];
                let previousFlightPack: FlightPack | undefined = undefined,
                  nextFlightPack: FlightPack | undefined = registerFlightPacks.shift();
                do {
                  const start = previousFlightPack ? startDate.getTime() + previousFlightPack.day * 24 * 60 * 60 * 1000 + previousFlightPack.end.minutes * 60 * 1000 : -Infinity,
                    end = nextFlightPack ? startDate.getTime() + nextFlightPack.day * 24 * 60 * 60 * 1000 + nextFlightPack.start.minutes * 60 * 1000 : Infinity;
                  if (start <= properties.time.getTime() && properties.time.getTime() <= end)
                    return onFreeSpaceMouseHover(register, previousFlightPack || lastFlightPack, nextFlightPack || firstFlightPack);
                  previousFlightPack = nextFlightPack;
                  nextFlightPack = registerFlightPacks.shift();
                } while (previousFlightPack || nextFlightPack);
                onFreeSpaceMouseHover(register);
                break;

              default:
                onNowhereMouseHover();
            }
          }}
        />
        <ClickAwayListener onClickAway={() => setFlightPackContextMenuModel({ ...flightPackContextMenuModel, open: false })}>
          <div>
            <Paper ref={flightPackContextMenuRef} className={classes.contextMenu}>
              {flightPackContextMenuModel.open && (
                <MenuList>
                  <MenuItem
                    onClick={() => {
                      setFlightPackContextMenuModel({ ...flightPackContextMenuModel, open: false });
                      onFreezeFlightPack(flightPackContextMenuModel.flightPack!, flightPackContextMenuModel.flightPack!.freezed !== true);
                    }}
                  >
                    <ListItemIcon>
                      {flightPackContextMenuModel.flightPack!.freezed === true ? (
                        <CheckIcon />
                      ) : flightPackContextMenuModel.flightPack!.freezed === undefined ? (
                        <CheckIcon classes={{ root: classes.semiCheckIcon }} />
                      ) : (
                        <span />
                      )}
                    </ListItemIcon>
                    <Typography>Freezed</Typography>
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setFlightPackContextMenuModel({ ...flightPackContextMenuModel, open: false });
                      onRequireFlightPack(flightPackContextMenuModel.flightPack!, flightPackContextMenuModel.flightPack!.required !== true);
                    }}
                  >
                    <ListItemIcon>
                      {flightPackContextMenuModel.flightPack!.required === true ? (
                        <CheckIcon />
                      ) : flightPackContextMenuModel.flightPack!.required === undefined ? (
                        <CheckIcon classes={{ root: classes.semiCheckIcon }} />
                      ) : (
                        <span />
                      )}
                    </ListItemIcon>
                    <Typography>Required</Typography>
                  </MenuItem>
                  <Divider />
                  <MenuItem
                    onClick={() => {
                      setFlightPackContextMenuModel({ ...flightPackContextMenuModel, open: false });
                      onIgnoreFlightPack(flightPackContextMenuModel.flightPack!);
                    }}
                  >
                    <ListItemIcon>
                      <span />
                    </ListItemIcon>
                    <Typography>Ignore...</Typography>
                  </MenuItem>
                  <Divider />
                  <MenuItem
                    onClick={() => {
                      setFlightPackContextMenuModel({ ...flightPackContextMenuModel, open: false });
                      onOpenFlightPackModal(flightPackContextMenuModel.flightPack!);
                    }}
                  >
                    <ListItemIcon>
                      <span />
                    </ListItemIcon>
                    <Typography>Flight Pack...</Typography>
                  </MenuItem>
                  {flightPackContextMenuModel.flightPack!.flights.map(f => (
                    <MenuItem
                      key={f.derivedId}
                      onClick={() => {
                        setFlightPackContextMenuModel({ ...flightPackContextMenuModel, open: false });
                        onOpenFlightModal(f);
                      }}
                    >
                      <ListItemIcon>
                        <span />
                      </ListItemIcon>
                      <Typography>
                        Flight&nbsp;&nbsp;
                        <Typography variant="body2" display="inline">
                          {f.flightNumber}
                        </Typography>
                        &nbsp;&nbsp;{f.departureAirport.name}&ndash;{f.arrivalAirport.name}...
                      </Typography>
                    </MenuItem>
                  ))}
                </MenuList>
              )}
            </Paper>
          </div>
        </ClickAwayListener>
      </Fragment>
    );
  }
);

export default ResourceSchedulerView;
