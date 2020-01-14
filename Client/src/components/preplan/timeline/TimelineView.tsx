import React, { FC, useState, Fragment, useRef, useMemo, useContext, useEffect } from 'react';
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
import { AircraftType } from 'src/business/master-data';
import persistant from 'src/utils/persistant';
import chroma from 'chroma-js';
import { PreplanContext } from 'src/pages/preplan';
import KeyboardHandler from 'src/utils/KeyboardHandler';
import FlightRequirement from 'src/business/flight-requirement/FlightRequirement';
import DayFlightRequirement from 'src/business/flight-requirement/DayFlightRequirement';
import FlightView from 'src/business/flight/FlightView';
import Week from 'src/business/Week';
import Flight from 'src/business/flight/Flight';

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
              },
              '& .vis-onUpdateTime-tooltip': {
                width: 240,
                bottom: 'initial !important'
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
      '&.rpa-half-opacity': {
        opacity: 0.5
      },
      '&.rpa-full-opacity': {
        opacity: 1
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

interface FlightViewContextMenuModel {
  open?: boolean;
  flightView?: FlightView;
}

export interface TimelineViewProps {
  week: Week;
  flightViews: readonly FlightView[];
  previous?: {
    week: Week;
    numberOfDays: number;
    flightViews: readonly FlightView[];
  };
  next?: {
    week: Week;
    numberOfDays: number;
    flightViews: readonly FlightView[];
  };
  selectedFlightView?: FlightView;
  onSelectFlightView(flightView?: FlightView): void;
  onEditFlightRequirement(flightRequirement: FlightRequirement): void;
  onEditDayFlightRequirement(dayFlightRequirement: DayFlightRequirement): void;
  onEditFlight(flightRequirement: FlightRequirement, day: Weekday, flights?: readonly Flight[]): void;
  onFlightViewDragAndDrop(flightView: FlightView, deltaStd: number, newAircraftRegister: PreplanAircraftRegister | undefined, allWeekdays: boolean): void;
  onFlightViewMouseHover(flightView: FlightView): void;
  onFreeSpaceMouseHover(aircraftRegister: PreplanAircraftRegister, previousFlightView?: FlightView, nextFlightView?: FlightView): void;
  onNowhereMouseHover(): void;
}

const TimelineView: FC<TimelineViewProps> = ({
  week,
  flightViews,
  previous,
  next,
  selectedFlightView,
  onSelectFlightView,
  onEditFlightRequirement,
  onEditDayFlightRequirement,
  onEditFlight: onEditFlight,
  onFlightViewDragAndDrop,
  onFlightViewMouseHover,
  onFreeSpaceMouseHover,
  onNowhereMouseHover
}) => {
  const preplan = useContext(PreplanContext);

  const flightViewsByAircraftRegisterId = useMemo(
    () =>
      flightViews.groupBy(
        f => (f.aircraftRegister ? f.aircraftRegister.id : '???'),
        g => g.sortBy('weekStart')
      ),
    [flightViews]
  );

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
        updateGroup: !preplan.readonly,
        updateTime: !preplan.readonly,
        overrideItems: false
      },
      end: week.endDate,
      format: {
        majorLabels(date, scale, step) {
          return Weekday[((new Date(date).setUTCHours(0, 0, 0, 0) - week.startDate.getTime()) / (24 * 60 * 60 * 1000) + 7) % 7].slice(0, 3);
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
      max: week.endDate.clone().addDays(next ? next.numberOfDays + 1 : 1),
      maxHeight: 'calc(100vh - 219px)',
      maxMinorChars: 5,
      min: previous ? week.startDate.clone().addDays(-previous.numberOfDays) : week.startDate,
      minHeight: 'calc(100vh - 220px)',
      moveable: true,
      multiselect: false,
      multiselectPerGroup: false,
      // onAdd(item, callback) {},
      // onAddGroup(group, callback) {},
      // onDragObjectOnItem(objectData, item) {},
      // onInitialDrawComplete() {},
      onMove(item, callback) {
        const flightView: FlightView = item.data;
        const newAircraftRegister = preplan.aircraftRegisters.id[item.group as any];
        const deltaStd = Math.round((new Date(item.start).getTime() - flightView.startDateTime.getTime()) / (5 * 60 * 1000)) * 5;
        const allWeekdays = KeyboardHandler.status.ctrl;
        onFlightViewDragAndDrop(flightView, newAircraftRegister === flightView.aircraftRegister ? deltaStd : 0, newAircraftRegister, allWeekdays);
        callback(item);
      },
      // onMoveGroup(group, callback) {},
      onMoving(item, callback) {
        if ((item.group as string).startsWith('T')) return callback(null);

        // To convert item resize to item move:
        const flightView: FlightView = item.data;
        const originalStart = flightView.startDateTime.getTime();
        const originalEnd = flightView.endDateTime.getTime();
        const calclulatedStart = Date.parse(item.start as any);
        const calculatedEnd = Date.parse(item.end as any);
        if (calculatedEnd - calclulatedStart !== originalEnd - originalStart) {
          item.start = new Date(originalStart);
          item.end = new Date(originalEnd);
        }

        // To prevent time change when register changes:
        const newAircraftRegister = preplan.aircraftRegisters.id[item.group as any];
        if (newAircraftRegister !== flightView.aircraftRegister) {
          item.start = flightView.startDateTime;
          item.end = flightView.endDateTime;
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
      start: week.startDate,
      template: itemTemplate,
      // timeAxis: {},
      //type: 'range',
      tooltip: {
        followMouse: false,
        overflowMethod: 'flip',
        delay: 400
      },

      tooltipOnItemUpdateTime: {
        template: (itemData: DataItem) => {
          return itemOnUpdateTooltipTemplate(itemData);
        }
      }, //TODO: Replace with this: { template(itemData: DataItem) { return ''; } },
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
      const aircraftRegisterObjections = preplan.constraintSystem.getObjectionsByTargets(aircraftRegister);
      const aircraftRegisterObjectionStatus = preplan.constraintSystem.getObjectionStatusByTargets(aircraftRegister);
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

      const flightView: FlightView = item.data;
      const extra = String(item.id).startsWith('X');
      const stcColor = chroma(persistant.userSettings!.stcColors[flightView.stc.name] || '#000000');
      return `
          <div class="rpa-item-header">
            <div class="rpa-item-time rpa-item-std">
              ${flightView.start.toString('H:mm', true)}
            </div>
            <div class="rpa-item-time rpa-item-sta">
              ${flightView.end.toString('H:mm', true)}
            </div>
          </div>
          <div class="rpa-item-body
          ${extra ? ' rpa-half-opacity' : ' rpa-full-opacity'}
          ${
            flightView.originPermission === true
              ? ' rpa-origin-permission rpa-origin-permission-full'
              : flightView.originPermission === undefined
              ? ' rpa-origin-permission rpa-origin-permission-semi'
              : ''
          }
          ${
            flightView.destinationPermission === true
              ? ' rpa-destination-permission rpa-destination-permission-full'
              : flightView.destinationPermission === undefined
              ? ' rpa-destination-permission rpa-destination-permission-semi'
              : ''
          }
          " style="border-color: ${stcColor}; background-color: ${chroma.mix(stcColor.desaturate(1), '#fff', 0.8)};">
            ${flightView.sections
              .map((s, index, sections) => {
                const flightLegObjectionStatus = preplan.constraintSystem.getObjectionStatusByTargets(flightView.legs[index].flightLegs);
                return `<div class="rpa-item-section${
                  flightLegObjectionStatus === 'ERROR' ? ' rpa-item-section-error' : flightLegObjectionStatus === 'WARNING' ? ' rpa-item-section-warning' : ''
                }${index === 0 ? ' rpa-item-section-first' : ''}${index === sections.length - 1 ? ' rpa-item-section-last' : ''}" style="left: ${s.start * 100}%; right: ${(1 -
                  s.end) *
                  100}%; background-color: ${chroma.mix(stcColor.saturate(0.4).brighten(1.5), '#fff', 0.25)};"></div>`;
              })
              .join(' ')}
            <div class="rpa-item-label">
              ${flightView.label}
            </div>
          </div>
          ${
            flightView.icons.length === 0 && !flightView.notes
              ? ''
              : `
                  <div class="rpa-item-footer">
                    ${flightView.icons.map(i => `<span class="rpa-item-icon">${i}</span>`).join(' ')}
                    ${flightView.notes
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

    function itemOnUpdateTooltipTemplate(itemData: DataItem): string {
      const flightView: FlightView = itemData.data;
      const deltaStd = Math.round((new Date(itemData.start).getTime() - flightView.startDateTime.getTime()) / (5 * 60 * 1000)) * 5;
      const lastLeg = flightView.legs[flightView.legs.length - 1];
      return `
      <div>From IKA (${new Date(itemData.start).format('t')}) &ndash; To IKA (${new Daytime(lastLeg.std.minutes + deltaStd + lastLeg.blockTime.minutes).toString('HH:mm', true)})
      </div>    
      `;
    }
  }, [preplan /* Because we have used onFlightDragAndDrop() in options */, week.startDate.getTime(), previous?.numberOfDays, next?.numberOfDays]);

  const timelineGroups = useMemo<DataGroup[]>(() => {
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
        treeLevel: 1,
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
    const items = flightViews.map(f => convertFlightViewToDataItem(f, false, !preplan.readonly));

    if (previous) {
      const dateTimeThreshold = previous.week.endDate.clone().addDays(1 - previous.numberOfDays);
      previous.flightViews.filter(f => f.endDateTime >= dateTimeThreshold).forEach(f => items.push(convertFlightViewToDataItem(f, true, false)));
    }
    if (next) {
      const dateTimeThreshold = next.week.startDate.clone().addDays(next.numberOfDays);
      next.flightViews.filter(f => f.startDateTime <= dateTimeThreshold).forEach(f => items.push(convertFlightViewToDataItem(f, true, false)));
    }

    function convertFlightViewToDataItem(flightView: FlightView, extra: boolean, editable: boolean): DataItem {
      return {
        id: extra ? `X${flightView.derivedId}` : flightView.derivedId,
        selectable: !extra,
        start: flightView.startDateTime,
        end: flightView.endDateTime,
        group: flightView.aircraftRegister ? flightView.aircraftRegister.id : '???',
        content: flightView.label,
        title: itemTooltipTemplate(flightView),
        type: 'range',
        editable: {
          remove: false,
          updateGroup: editable,
          updateTime: editable
        },
        data: flightView
      };
    }

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

    function itemTooltipTemplate(flightView: FlightView): string {
      return `
          <div>
            <div>
              <em><small>Flight:</small></em>
              <strong>${flightView.label}</strong>
              ${Weekday[flightView.day]}s
            </div>
            <div>
              <em><small>Flights:</small></em>
              ${flightView.legs
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
              flightView.icons.length === 0
                ? ''
                : `
                    <div>
                      <em><small>Flags:</small></em>
                      ${flightView.icons.map(i => `<strong>${i}</strong>`).join(' | ')}
                    </div>
                  `
            }
            ${
              !flightView.notes
                ? ''
                : `
                    <div>
                      <em><small>Notes:</small></em>
                      ${flightView.notes}
                    </div>
                  `
            }
          </div>
        `;
    }
  }, [
    preplan,
    week.startDate.getTime(),
    flightViews,
    previous?.week.startDate.getTime(),
    previous?.numberOfDays,
    previous?.flightViews,
    next?.week.startDate.getTime(),
    next?.numberOfDays,
    next?.flightViews,
    timelineOptions,
    timelineGroups
  ]);

  const [flightViewContextMenuModel, setFlightViewContextMenuModel] = useState<FlightViewContextMenuModel>({});
  const flightContextMenuRef = useRef<HTMLDivElement>(null);

  const classes = useStyles();

  return (
    <Fragment>
      <VisTimeline
        options={timelineOptions}
        groups={timelineGroups}
        items={timelineItems}
        selection={selectedFlightView && selectedFlightView.derivedId}
        scrollTop={timelineScrollTop()}
        onScrollY={scrollTop => timelineScrollTop(scrollTop)}
        retrieveTimeline={t => timeline(t)}
        // onChanged={() => console.log('Timeline is rendered.')}
        onRangeChanged={properties => timeline().redraw()}
        onSelect={({ items, event }) => {
          const item = timelineItems.find(item => item.id === items[0]);
          onSelectFlightView(item ? item.data : undefined);
        }}
        onContextMenu={properties => {
          properties.event.preventDefault();
          const item = timelineItems.find(item => item.id === properties.item);
          if (!item) return;
          const { pageX, pageY } = properties;
          flightContextMenuRef.current!.style.top = `${pageY}px`;
          flightContextMenuRef.current!.style.left = `${pageX}px`;
          setFlightViewContextMenuModel({ open: true, flightView: item.data });
        }}
        onMouseOver={properties => {
          switch (properties.what) {
            case 'item':
              const item = timelineItems.find(item => item.id === properties.item);
              if (!item) return onNowhereMouseHover();
              onFlightViewMouseHover(item.data);
              break;

            case 'background':
              if (properties.group === '???') return onNowhereMouseHover();
              const time = properties.time.getTime();
              if (time < week.startDate.getTime() || time > week.endDate.getTime() + 24 * 60 * 1000) return onNowhereMouseHover();
              const register = preplan.aircraftRegisters.id[properties.group as any];
              if (!register) return onNowhereMouseHover();
              const registerFlightViews = register.id in flightViewsByAircraftRegisterId ? [...flightViewsByAircraftRegisterId[register.id]] : [];
              if (registerFlightViews.length === 0) return onFreeSpaceMouseHover(register);
              if (registerFlightViews.length === 1) return onFreeSpaceMouseHover(register, registerFlightViews[0], registerFlightViews[0]);
              const firstFlightView = registerFlightViews[0],
                lastFlightView = registerFlightViews.last()!;
              let previousFlightView: FlightView | undefined = undefined,
                nextFlightView: FlightView | undefined = registerFlightViews.shift();
              do {
                const start = previousFlightView ? week.startDate.getTime() + previousFlightView.day * 24 * 60 * 60 * 1000 + previousFlightView.end.minutes * 60 * 1000 : -Infinity,
                  end = nextFlightView ? week.startDate.getTime() + nextFlightView.day * 24 * 60 * 60 * 1000 + nextFlightView.start.minutes * 60 * 1000 : Infinity;
                if (start <= time && time <= end) return onFreeSpaceMouseHover(register, previousFlightView || lastFlightView, nextFlightView || firstFlightView);
                previousFlightView = nextFlightView;
                nextFlightView = registerFlightViews.shift();
              } while (previousFlightView || nextFlightView);
              onFreeSpaceMouseHover(register);
              break;

            default:
              onNowhereMouseHover();
          }
        }}
      />
      <ClickAwayListener onClickAway={() => setFlightViewContextMenuModel({ ...flightViewContextMenuModel, open: false })}>
        <div>
          <Paper ref={flightContextMenuRef} className={classes.contextMenu}>
            {flightViewContextMenuModel.open && (
              <MenuList>
                <MenuItem
                  onClick={() => {
                    setFlightViewContextMenuModel({ ...flightViewContextMenuModel, open: false });
                    onEditFlight(
                      flightViewContextMenuModel.flightView!.flightRequirement,
                      flightViewContextMenuModel.flightView!.day,
                      flightViewContextMenuModel.flightView!.flights
                    );
                  }}
                >
                  {/* <ListItemIcon>
                      <span />
                    </ListItemIcon> */}
                  <Typography>Flight...</Typography>
                </MenuItem>

                <MenuItem
                  onClick={() => {
                    setFlightViewContextMenuModel({ ...flightViewContextMenuModel, open: false });
                    onEditDayFlightRequirement(flightViewContextMenuModel.flightView!.dayFlightRequirement);
                  }}
                >
                  {/* <ListItemIcon>
                      <span />
                    </ListItemIcon> */}
                  <Typography>Requirement...</Typography>
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
