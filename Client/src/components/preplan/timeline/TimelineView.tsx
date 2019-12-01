import React, { FC, useState, Fragment, useRef, useMemo, useContext } from 'react';
import { Theme, MenuItem, MenuList, ClickAwayListener, Paper, ListItemIcon, Typography, Divider } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Check as CheckIcon } from '@material-ui/icons';
import Daytime from '@core/types/Daytime';
import PreplanAircraftRegister from 'src/business/preplan/PreplanAircraftRegister';
import { DataGroup, DataItem, TimelineOptions, Timeline } from 'vis-timeline';
import Weekday from '@core/types/Weekday';
import VisTimeline from 'src/components/preplan/timeline/VisTimeline';
import moment from 'moment';
import useProperty from 'src/utils/useProperty';
import { AircraftType } from '@core/master-data';
import persistant from 'src/utils/persistant';
import chroma from 'chroma-js';
import Flight from 'src/business/flight/Flight';
import { PreplanContext } from 'src/pages/preplan';
import KeyboardHandler from 'src/utils/KeyboardHandler';

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
    '.rpa-group-dummy-mark': {
      color: 'violet',
      fontSize: '14px',
      fontWeight: 800,
      marginLeft: 4,
      borderRadius: '6px',
      padding: '0 1px',
      cursor: 'pointer',
      '&:hover': {
        boxShadow: '0 0 6px 0px violet'
      }
    },
    '.rpa-group-error-mark': {
      color: theme.palette.extraColors.erroredFlight,
      margin: 0,
      borderRadius: '6px',
      padding: 0,
      cursor: 'pointer',
      '&:hover': {
        boxShadow: `0 0 6px 0px ${theme.palette.extraColors.erroredFlight}`
      }
    },
    '.rpa-group-warning-mark': {
      color: theme.palette.extraColors.warnedFlight,
      margin: 0,
      borderRadius: '6px',
      padding: 0,
      cursor: 'pointer',
      '&:hover': {
        boxShadow: `0 0 6px 0px ${theme.palette.extraColors.warnedFlight}`
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
      position: 'relative',
      border: '1px solid rgba(0, 20, 110, 0.5)', // Will be overridden.
      borderRadius: '4px',
      backgroundColor: 'rgba(0, 20, 110, 0.15)', // Will be overridden.
      height: 27,
      '&.rpa-unknown-aircraft-register': {
        opacity: 0.5
      },
      '&.rpa-origin-permission': {
        borderLeftWidth: 4,
        '&.rpa-origin-permission-semi': {
          borderLeftStyle: 'double'
        },
        '& .rpa-item-section.rpa-item-section-first': {
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0
        }
      },
      '&.rpa-destination-permission': {
        borderRightWidth: 4,
        '&.rpa-destination-permission-semi': {
          borderRightStyle: 'double'
        },
        '& .rpa-item-section.rpa-item-section-last': {
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0
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
        backgroundColor: 'rgba(0, 20, 110, 0.15)', // Will be overridden.
        '&.rpa-item-section-error': {
          border: `2px solid ${theme.palette.extraColors.erroredFlight}DD`,
          borderRightWidth: 3,
          borderLeftWidth: 3,
          boxShadow: 'inset 0 0 4px 3px white'
        },
        '&.rpa-item-section-warning': {
          border: `2px solid ${theme.palette.extraColors.warnedFlight}`,
          borderRightWidth: 3,
          borderLeftWidth: 3,
          boxShadow: 'inset 0 0 4px 3px white'
        },
        '&.rpa-item-section-first': {
          borderLeftWidth: 2,
          borderTopLeftRadius: '4px',
          borderBottomLeftRadius: '4px'
        },
        '&.rpa-item-section-last': {
          borderRightWidth: 2,
          borderTopRightRadius: '4px',
          borderBottomRightRadius: '4px'
        }
      },
      '& .rpa-item-label': {
        position: 'absolute',
        width: '100%',
        textAlign: 'center',
        fontSize: '16px',
        lineHeight: '25px',
        paddingTop: 0,
        textShadow:
          '0 0 1px #777, 1px 0px 1px white, 1px 1px 1px white, 0px 1px 1px white, -1px 1px 1px white, -1px 0px 1px white, -1px -1px 1px white, 0px -1px 1px white, 1px -1px 1px white, 0 3px 4px black'
      },
      '& .rpa-pin': {
        display: 'inline-block',
        height: 5,
        width: 5,
        borderRadius: '50%',
        backgroundColor: 'white',
        border: '1px solid black',
        position: 'absolute',
        '&.rpa-pin-left': { left: 1 },
        '&.rpa-pin-right': { right: 1 },
        '&.rpa-pin-top': { top: 1 },
        '&.rpa-pin-bottom': { bottom: 1 }
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

interface FlightContextMenuModel {
  open?: boolean;
  flight?: Flight;
}

export interface TimelineViewProps {
  selectedFlight?: Flight;
  onSelectFlight(flight?: Flight): void;
  onEditFlight(flight: Flight): void;
  onFlightDragAndDrop(flight: Flight, deltaStd: number, newAircraftRegister: PreplanAircraftRegister | undefined, allWeekdays: boolean): void;
  onFlightMouseHover(flight: Flight): void;
  onFreeSpaceMouseHover(aircraftRegister: PreplanAircraftRegister, previousFlight?: Flight, nextFlight?: Flight): void;
  onNowhereMouseHover(): void;
}

const TimelineView: FC<TimelineViewProps> = ({
  selectedFlight,
  onSelectFlight,
  onEditFlight,
  onFlightDragAndDrop,
  onFlightMouseHover,
  onFreeSpaceMouseHover,
  onNowhereMouseHover
}) => {
  const preplan = useContext(PreplanContext);
  const startDate = preplan.startDate.getDatePart().addDays((preplan.startDate.getUTCDay() + 1) % 7);

  const timeline = useProperty<Timeline>(null as any);
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
        const flight: Flight = item.data;
        const newAircraftRegister = preplan.aircraftRegisters.id[item.group as any];
        const deltaStd = Math.round((new Date(item.start).getTime() - flight.startDateTime(startDate).getTime()) / (5 * 60 * 1000)) * 5;
        const allWeekdays = KeyboardHandler.status.ctrl;
        onFlightDragAndDrop(flight, newAircraftRegister === flight.aircraftRegister ? deltaStd : 0, newAircraftRegister, allWeekdays);
        callback(item);
      },
      // onMoveGroup(group, callback) {},
      onMoving(item, callback) {
        if ((item.group as string).startsWith('T')) return callback(null);

        // To convert item resize to item move:
        const flight: Flight = item.data;
        const originalStart = flight.startDateTime(startDate).getTime();
        const originalEnd = flight.endDateTime(startDate).getTime();
        const calclulatedStart = Date.parse(item.start as any);
        const calculatedEnd = Date.parse(item.end as any);
        if (calculatedEnd - calclulatedStart !== originalEnd - originalStart) {
          item.start = new Date(originalStart);
          item.end = new Date(originalEnd);
        }

        // To prevent time change when register changes:
        const newAircraftRegister = preplan.aircraftRegisters.id[item.group as any];
        if (newAircraftRegister !== flight.aircraftRegister) {
          item.start = flight.startDateTime(startDate);
          item.end = flight.endDateTime(startDate);
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
      //type: 'range',
      tooltip: {
        followMouse: true,
        overflowMethod: 'cap',
        delay: 400
        // template: ... //TODO: Replace itemTooltipTemplate function here.
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
      if (group.id === '???')
        return `
            <div>
              ${group.content}
            </div>
          `;
      const aircraftRegister: PreplanAircraftRegister = group.data;
      const aircraftRegisterObjections = preplan.constraintSystem.getObjectionsByTarget(aircraftRegister);
      const aircraftRegisterObjectionStatus = preplan.constraintSystem.getObjectionStatusByTarget(aircraftRegister);
      return `
          <div>
            ${group.content}
            ${aircraftRegister.dummy ? '<span class="rpa-group-dummy-mark" title="Dummy Aircraft Register">D</span>' : ''}
            ${
              aircraftRegisterObjectionStatus === 'ERROR'
                ? `
                    <i class="rpa-icon-cancel-button material-icons rpa-group-error-mark" aria-hidden="true" type="1" title="${
                      aircraftRegisterObjections!.length === 1 ? '1 Objection' : `${aircraftRegisterObjections!.length} Objections`
                    }" onclick="alert('Not implemented.');">
                    </i>
                  `
                : aircraftRegisterObjectionStatus === 'WARNING'
                ? `
                    <i class="rpa-icon-alert material-icons rpa-group-warning-mark" aria-hidden="true" type="1" title="${
                      aircraftRegisterObjections!.length === 1 ? '1 Objection' : `${aircraftRegisterObjections!.length} Objections`
                    }" onclick="alert('Not implemented.');">
                    </i>
                  `
                : ''
            }
          </div>
        `;
    }

    function itemTemplate(item: DataItem, element: HTMLElement, data: DataItem): string {
      if (item.className && item.className.startsWith('rpa-group-item-')) return '';

      const flight: Flight = item.data;
      const stcColor = chroma(persistant.userSettings!.stcColors[flight.stc.name] || '#000000');
      return `
          <div class="rpa-item-header">
            <div class="rpa-item-time rpa-item-std">
              ${flight.start.toString('H:mm', true)}
            </div>
            <div class="rpa-item-time rpa-item-sta">
              ${flight.end.toString('H:mm', true)}
            </div>
          </div>
          <div class="rpa-item-body
          ${flight.knownAircraftRegister ? ' rpa-known-aircraft-register' : ' rpa-unknown-aircraft-register'}
          ${
            flight.originPermission === true
              ? ' rpa-origin-permission rpa-origin-permission-full'
              : flight.originPermission === undefined
              ? ' rpa-origin-permission rpa-origin-permission-semi'
              : ''
          }
          ${
            flight.destinationPermission === true
              ? ' rpa-destination-permission rpa-destination-permission-full'
              : flight.destinationPermission === undefined
              ? ' rpa-destination-permission rpa-destination-permission-semi'
              : ''
          }
          " style="border-color: ${stcColor}; background-color: ${chroma.mix(stcColor.desaturate(1), '#fff', 0.8)};">
            ${flight.sections
              .map((s, index, sections) => {
                const flightLegObjectionStatus = preplan.constraintSystem.getObjectionStatusByTarget(flight.legs[index]);
                return `<div class="rpa-item-section${
                  flightLegObjectionStatus === 'ERROR' ? ' rpa-item-section-error' : flightLegObjectionStatus === 'WARNING' ? ' rpa-item-section-warning' : ''
                }${index === 0 ? ' rpa-item-section-first' : ''}${index === sections.length - 1 ? ' rpa-item-section-last' : ''}" style="left: ${s.start * 100}%; right: ${(1 -
                  s.end) *
                  100}%; background-color: ${chroma.mix(stcColor.saturate(0.4).brighten(1.5), '#fff', 0.25)};"></div>`;
              })
              .join(' ')}
            <div class="rpa-item-label">
              ${flight.label}
            </div>
          </div>
          ${
            flight.icons.length === 0 && !flight.notes
              ? ''
              : `
                  <div class="rpa-item-footer">
                    ${flight.icons.map(i => `<span class="rpa-item-icon">${i}</span>`).join(' ')}
                    ${flight.notes
                      .split('')
                      .map(c => `<div>${c === ' ' ? '&nbsp;' : c}</div>`)
                      .join('')}
                  </div>
                `
          }
        `;
      // return `
      //   <div class="rpa-item-header">
      //     <div class="rpa-item-time rpa-item-std">
      //       ${flight.start.toString(true)}
      //       ${flight.required === false ? '&nbsp;' : ''}
      //     </div>
      //     ${
      //       flight.required === true
      //         ? `<div class="rpa-required-asterisk rpa-required-asterisk-full">&#10045;</div>`
      //         : flight.required === undefined
      //         ? `<div class="rpa-required-asterisk rpa-required-asterisk-semi">&#10045;</div>`
      //         : ''
      //     }
      //     <div class="rpa-item-time rpa-item-sta">
      //       ${flight.required === false ? '&nbsp;' : ''}
      //       ${flight.end.toString(true)}
      //     </div>
      //   </div>
      //   <div class="rpa-item-body
      //   ${flight.knownAircraftRegister ? ' rpa-known-aircraft-register' : ' rpa-unknown-aircraft-register'}
      //   ${
      //     flight.originPermission === true
      //       ? ' rpa-origin-permission rpa-origin-permission-full'
      //       : flight.originPermission === undefined
      //       ? ' rpa-origin-permission rpa-origin-permission-semi'
      //       : ''
      //   }
      //   ${
      //     flight.destinationPermission === true
      //       ? ' rpa-destination-permission rpa-destination-permission-full'
      //       : flight.destinationPermission === undefined
      //       ? ' rpa-destination-permission rpa-destination-permission-semi'
      //       : ''
      //   }
      //   ${flight.changed === true ? ' rpa-changed rpa-changed-full' : flight.changed === undefined ? ' rpa-changed rpa-changed-semi' : ''}
      //   " style="border-color: ${stcColor}; background-color: ${chroma.mix(stcColor.desaturate(1), '#fff', 0.8)};">
      //     ${flight.sections
      //       .map(
      //         (s, index, sections) =>
      //           `<div class="rpa-item-section${
      //             flight.flights[index].objectionStatus === 'ERROR'
      //               ? ' rpa-item-section-error'
      //               : flight.flights[index].objectionStatus === 'WARNING'
      //               ? ' rpa-item-section-warning'
      //               : ''
      //           }${index === 0 ? ' rpa-item-section-first' : ''}${index === sections.length - 1 ? ' rpa-item-section-last' : ''}" style="left: ${s.start * 100}%; right: ${(1 -
      //             s.end) *
      //             100}%; background-color: ${chroma.mix(stcColor.saturate(0.4).brighten(1.5), '#fff', 0.25)};"></div>`
      //       )
      //       .join(' ')}
      //     <div class="rpa-item-label">
      //       ${flight.label}
      //     </div>
      //     ${
      //       flight.freezed === true
      //         ? `
      //           <span class="rpa-pin rpa-pin-top rpa-pin-left"></span>
      //           <span class="rpa-pin rpa-pin-top rpa-pin-right"></span>
      //           <span class="rpa-pin rpa-pin-bottom rpa-pin-left"></span>
      //           <span class="rpa-pin rpa-pin-bottom rpa-pin-right"></span>
      //         `
      //         : flight.freezed === undefined
      //         ? `
      //           <span class="rpa-pin rpa-pin-top rpa-pin-left"></span>
      //           <!--<span class="rpa-pin rpa-pin-top rpa-pin-right"></span>-->
      //           <!--<span class="rpa-pin rpa-pin-bottom rpa-pin-left"></span>-->
      //           <span class="rpa-pin rpa-pin-bottom rpa-pin-right"></span>
      //         `
      //         : ''
      //     }
      //   </div>
      //   ${
      //     flight.icons.length === 0 && !flight.notes
      //       ? ''
      //       : `
      //           <div class="rpa-item-footer">
      //             ${flight.icons.map(i => `<span class="rpa-item-icon">${i}</span>`).join(' ')}
      //             ${flight.notes
      //               .split('')
      //               .map(c => `<div>${c === ' ' ? '&nbsp;' : c}</div>`)
      //               .join('')}
      //           </div>
      //         `
      //   }
      // `;
    }
  }, [startDate.getTime(), preplan /* Because we have used onFlightDragAndDrop() in options */]);
  const timelineGroups = useMemo<DataGroup[]>(() => {
    // const registers = aircraftRegisters.items.filter(r => flights.some(f => f.aircraftRegister && f.aircraftRegister.id === r.id)).sortBy('name');
    const registers = preplan.aircraftRegisters.items
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
  }, [preplan.aircraftRegisters]);
  const timelineItems = useMemo<DataItem[]>(() => {
    const items = preplan.flights
      .filter(f => ['REAL', 'STB1'].includes(f.rsx))
      .map(
        (f): DataItem => ({
          id: f.id,
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

    function itemTooltipTemplate(flight: Flight): string {
      return `
          <div>
            <div>
              <em><small>Flight:</small></em>
              <strong>${flight.label}</strong>
              ${Weekday[flight.day]}s
            </div>
            <div>
              <em><small>Flights:</small></em>
              ${flight.legs
                .map(
                  l => `
                    <div>
                      &nbsp;&nbsp;&nbsp;&nbsp;
                      ${l.flightNumber}:
                      ${l.departureAirport.name} (${l.std.toString('HH:mm', true)}) &dash;
                      ${l.arrivalAirport.name} (${new Daytime(l.std.minutes + l.blockTime.minutes).toString('HH:mm', true)})
                    </div>
                  `
                )
                .join('')}
            </div>
            ${
              flight.icons.length === 0
                ? ''
                : `
                    <div>
                      <em><small>Flags:</small></em>
                      ${flight.icons.map(i => `<strong>${i}</strong>`).join(' | ')}
                    </div>
                  `
            }
            ${
              !flight.notes
                ? ''
                : `
                    <div>
                      <em><small>Notes:</small></em>
                      ${flight.notes}
                    </div>
                  `
            }
          </div>
        `;
    }
  }, [startDate.getTime(), preplan.flights, timelineOptions, timelineGroups]);

  const [flightContextMenuModel, setFlightContextMenuModel] = useState<FlightContextMenuModel>({});
  const flightContextMenuRef = useRef<HTMLDivElement>(null);

  const classes = useStyles();

  return (
    <Fragment>
      <VisTimeline
        options={timelineOptions}
        groups={timelineGroups}
        items={timelineItems}
        selection={selectedFlight && selectedFlight.id}
        scrollTop={timelineScrollTop()}
        onScrollY={scrollTop => timelineScrollTop(scrollTop)}
        retrieveTimeline={t => timeline(t)}
        // onChanged={() => console.log('Timeline is rendered.')}
        onRangeChanged={properties => timeline().redraw()}
        onSelect={({ items, event }) => {
          const item = timelineItems.find(item => item.id === items[0]);
          onSelectFlight(item ? item.data : undefined);
        }}
        onContextMenu={properties => {
          properties.event.preventDefault();
          const item = timelineItems.find(item => item.id === properties.item);
          if (!item) return;
          const { pageX, pageY } = properties;
          flightContextMenuRef.current!.style.top = `${pageY}px`;
          flightContextMenuRef.current!.style.left = `${pageX}px`;
          setFlightContextMenuModel({ open: true, flight: item.data });
        }}
        onMouseOver={properties => {
          switch (properties.what) {
            case 'item':
              const item = timelineItems.find(item => item.id === properties.item);
              if (!item) return onNowhereMouseHover();
              onFlightMouseHover(item.data);
              break;

            case 'background':
              if (properties.group === '???') return onNowhereMouseHover();
              const register = preplan.aircraftRegisters.id[properties.group as any];
              if (!register) return onNowhereMouseHover();
              const registerFlights = [...preplan.flightsByAircraftRegisterId[register.id]];
              if (registerFlights.length === 0) return onFreeSpaceMouseHover(register);
              if (registerFlights.length === 1) return onFreeSpaceMouseHover(register, registerFlights[0], registerFlights[0]);
              const firstFlight = registerFlights[0],
                lastFlight = registerFlights[registerFlights.length - 1];
              let previousFlight: Flight | undefined = undefined,
                nextFlight: Flight | undefined = registerFlights.shift();
              do {
                const start = previousFlight ? startDate.getTime() + previousFlight.day * 24 * 60 * 60 * 1000 + previousFlight.end.minutes * 60 * 1000 : -Infinity,
                  end = nextFlight ? startDate.getTime() + nextFlight.day * 24 * 60 * 60 * 1000 + nextFlight.start.minutes * 60 * 1000 : Infinity;
                if (start <= properties.time.getTime() && properties.time.getTime() <= end)
                  return onFreeSpaceMouseHover(register, previousFlight || lastFlight, nextFlight || firstFlight);
                previousFlight = nextFlight;
                nextFlight = registerFlights.shift();
              } while (previousFlight || nextFlight);
              onFreeSpaceMouseHover(register);
              break;

            default:
              onNowhereMouseHover();
          }
        }}
      />
      <ClickAwayListener onClickAway={() => setFlightContextMenuModel({ ...flightContextMenuModel, open: false })}>
        <div>
          <Paper ref={flightContextMenuRef} className={classes.contextMenu}>
            {flightContextMenuModel.open && (
              <MenuList>
                <MenuItem
                  onClick={() => {
                    setFlightContextMenuModel({ ...flightContextMenuModel, open: false });
                    onEditFlight(flightContextMenuModel.flight!);
                  }}
                >
                  {/* <ListItemIcon>
                      <span />
                    </ListItemIcon> */}
                  <Typography>Edit...</Typography>
                </MenuItem>
                {/* <MenuItem
                    onClick={() => {
                      setFlightContextMenuModel({ ...flightContextMenuModel, open: false });
                      onFreezeFlightPack(flightContextMenuModel.flightPack!, flightContextMenuModel.flightPack!.freezed !== true);
                    }}
                  >
                    <ListItemIcon>
                      {flightContextMenuModel.flightPack!.freezed === true ? (
                        <CheckIcon />
                      ) : flightContextMenuModel.flightPack!.freezed === undefined ? (
                        <CheckIcon classes={{ root: classes.semiCheckIcon }} />
                      ) : (
                        <span />
                      )}
                    </ListItemIcon>
                    <Typography>Freezed</Typography>
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setFlightContextMenuModel({ ...flightContextMenuModel, open: false });
                      onRequireFlightPack(flightContextMenuModel.flightPack!, flightContextMenuModel.flightPack!.required !== true);
                    }}
                  >
                    <ListItemIcon>
                      {flightContextMenuModel.flightPack!.required === true ? (
                        <CheckIcon />
                      ) : flightContextMenuModel.flightPack!.required === undefined ? (
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
                      setFlightContextMenuModel({ ...flightContextMenuModel, open: false });
                      onIgnoreFlightPack(flightContextMenuModel.flightPack!);
                    }}
                  >
                    <ListItemIcon>
                      <span />
                    </ListItemIcon>
                    <Typography>Ignore...</Typography>
                  </MenuItem>
                  <Divider /> */}
                {/* <MenuItem
                    onClick={() => {
                      setFlightContextMenuModel({ ...flightContextMenuModel, open: false });
                      onOpenFlightPackModal(flightContextMenuModel.flightPack!);
                    }}
                  >
                    <ListItemIcon>
                      <span />
                    </ListItemIcon>
                    <Typography>Flight Pack...</Typography>
                  </MenuItem>
                  {flightContextMenuModel.flightPack!.flights.map(f => (
                    <MenuItem
                      key={f.derivedId}
                      onClick={() => {
                        setFlightContextMenuModel({ ...flightContextMenuModel, open: false });
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
                  ))} */}
              </MenuList>
            )}
          </Paper>
        </div>
      </ClickAwayListener>
    </Fragment>
  );
};

export default TimelineView;
