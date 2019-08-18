import React, { FC, Fragment, useState, useEffect, useRef, createContext } from 'react';
import { Theme, DialogTitle, DialogContent, DialogContentText, TextField, DialogActions, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Switch, Redirect, Route } from 'react-router-dom';
import useRouter from 'src/utils/useRouter';
import NavBar from 'src/components/NavBar';
import ResourceSchedulerPage from 'src/pages/preplan/resource-scheduler';
import FlightRequirementListPage from 'src/pages/preplan/flight-requirement-list';
import ReportsPage from 'src/pages/preplan/reports';
import Preplan from 'src/view-models/Preplan';
import DraggableDialog from 'src/components/DraggableDialog';
import PreplanAircraftIdentity from 'src/view-models/PreplanAircraftIdentity';
import FlightRequirementEditor from 'src/components/preplan/flight-requirement/FlightRequirementEditor';
import MasterData from '@core/master-data';
import FlightRequirement from 'src/view-models/flights/FlightRequirement';
import FlightTime from 'src/view-models/flights/FlightTime';
import AircraftIdentityType from '@core/types/aircraft-identity/AircraftIdentityType';

const useStyles = makeStyles((theme: Theme) => ({
  flightRequirementStyle: {
    height: '820px',
    maxHeight: '900px'
  }
}));

export const NavBarToolsContainerContext = createContext<HTMLDivElement | null>(null);

export type FlightRequirementModal = {
  open: boolean;
  flightRequirement?: FlightRequirement;
  weekly?: boolean;
  day?: number;
  days?: boolean[];
  unavailableDays?: boolean[];
  label?: string;
  flightNumber?: string;
  departureAirportId?: string;
  arrivalAirportId?: string;
  blockTime?: number;
  times?: Partial<FlightTime>[];
  allowedAircraftIdentities?: Partial<PreplanAircraftIdentity>[];
  forbiddenAircraftIdentities?: Partial<PreplanAircraftIdentity>[];
  slot?: boolean;
  slotComments?: string;
  required?: boolean;
};

const PreplanPage: FC = () => {
  const [preplan, setPreplan] = useState<Preplan | null>(null);
  const [showContents, setShowContents] = useState(false);
  const [flightRequirementModal, setFlightRequirementModal] = useState<FlightRequirementModal>({ open: false });
  const navBarToolsRef = useRef<HTMLDivElement>(null);

  const classes = useStyles();
  const { match, history } = useRouter<{ id: string }>();

  useEffect(() => {
    //TODO: Load preplan by match.params.id from server if not loaded yet.
    //TODO: Go back to preplan list when not succeeded:
    // history.push('/preplan-list');
  });

  useEffect(() => setShowContents(true), []);

  if (!preplan) setPreplan(getDummyPreplan()); //TODO: Remove this later.
  const resourceSchedulerPageSelected = window.location.href.startsWith(`${window.location.host}/#${match.url}/resource-scheduler`);
  const flightRequirementListPageSelected = window.location.href.startsWith(`${window.location.host}/#${match.url}/flight-requirement-list`);
  const reportsPageSelected = window.location.href.startsWith(`${window.location.host}/#${match.url}/reports`);

  return (
    <Fragment>
      <NavBar
        backLink={resourceSchedulerPageSelected ? '/preplan-list' : match.url}
        backTitle={resourceSchedulerPageSelected ? 'Back to Pre Plan List' : `Back to Pre Plan ${preplan && preplan.name}`}
        navBarLinks={[
          {
            title: 'Pre Plans',
            link: '/preplan-list'
          },
          preplan && {
            title: preplan.name,
            link: match.url
          },
          flightRequirementListPageSelected && {
            title: 'Flight Requirements',
            link: `${match.url}/flight-requirement-list`
          },
          reportsPageSelected && {
            title: 'Reports',
            link: `${match.url}/reports`
          },
          reportsPageSelected &&
            window.location.hash.endsWith('/proposal') && {
              title: 'Proposal Report',
              link: `${match.url}/reports/proposal`
            },
          reportsPageSelected &&
            window.location.hash.endsWith('/connections') && {
              title: 'Connections Report',
              link: `${match.url}/reports/connections`
            }
        ]}
      >
        <div ref={navBarToolsRef} />
      </NavBar>
      {showContents && preplan && (
        <NavBarToolsContainerContext.Provider value={navBarToolsRef.current}>
          <Switch>
            <Redirect exact from={match.url} to={match.url + '/resource-scheduler'} />
            <Route
              exact
              path={match.path + '/resource-scheduler'}
              component={() => (
                <ResourceSchedulerPage
                  preplan={preplan}
                  onEditFlight={f => alert('edit flight ' + f.derivedId)}
                  onEditFlightRequirement={f => setFlightRequirementModal({ open: true, flightRequirement: f, weekly: true /*TODO*/ })}
                  onEditWeekdayFlightRequirement={f => setFlightRequirementModal({ open: true, flightRequirement: f.requirement, weekly: false /*TODO*/ })}
                />
              )}
            />
            <Route
              exact
              path={match.path + '/flight-requirement-list'}
              render={() => (
                <FlightRequirementListPage
                  flightRequirements={preplan.flightRequirements}
                  onAddFlightRequirement={() => setFlightRequirementModal({ open: true, weekly: true /*TODO*/ })}
                  onRemoveFlightRequirement={f => alert('Not implemented.\nOpen Y/N modal.')}
                  onEditFlightRequirement={f => setFlightRequirementModal({ open: true, flightRequirement: f, weekly: true /*TODO*/ })}
                  onAddReturnFlightRequirement={f => setFlightRequirementModal({ open: true, weekly: true /*TODO*/ })}
                  onRemoveWeekdayFlightRequirement={f => alert('Not implemented.\nOpen Y/N modal.')}
                  onEditWeekdayFlightRequirement={f => setFlightRequirementModal({ open: true, flightRequirement: f.requirement, weekly: false /*TODO*/ })}
                />
              )}
            />
            <Route exact path={match.path + '/reports/:report?'} component={() => <ReportsPage preplan={preplan} />} />
            <Redirect to={match.url} />
          </Switch>
        </NavBarToolsContainerContext.Provider>
      )}

      <DraggableDialog
        classes={{ paper: classes.flightRequirementStyle }}
        open={flightRequirementModal.open}
        onClose={() => setFlightRequirementModal({ open: false })}
        aria-labelledby="form-dialog-title"
      >
        <FlightRequirementEditor model={flightRequirementModal} mode="add" onSave={fr => alert('TODO: Save FR')} />
      </DraggableDialog>
    </Fragment>
  );
};

export default PreplanPage;

//=========================================================================================================

function getDummyPreplan(): Preplan {
  return new Preplan({
    id: '123',
    name: 'First Preplan',
    published: false,
    finalized: false,
    userId: '1010',
    userName: 'Moradi',
    userDisplayName: 'Moradi',
    parentPreplanId: '2020',
    parentPreplanName: 'Before First Preplan',
    creationDateTime: new Date().addDays(-10).toJSON(),
    lastEditDateTime: new Date().addDays(-1).toJSON(),
    startDate: new Date().toJSON(),
    endDate: new Date().addDays(20).toJSON(),

    autoArrangerOptions: { minimumGroundTimeMode: 'AVERAGE', minimumGroundTimeOffset: 50 },
    autoArrangerState: {
      solving: true,
      solvingStartDateTime: new Date().toString(),
      solvingDuration: 185,
      message: {
        type: 'ERROR',
        text: 'Message Text .... '
      },
      messageViewed: false,
      changeLogs: [
        {
          flightDerievedId: '000#4',
          oldStd: 156,
          //oldAircraftRegisterId: MasterData.all.aircraftRegisters.items[0].id,
          newStd: 485
          //newAircraftRegisterId: MasterData.all.aircraftRegisters.items[1].id
        },
        {
          flightDerievedId: '000#5',
          oldStd: 300,
          // oldAircraftRegisterId: MasterData.all.aircraftRegisters.items[2].id,
          newStd: 720
          //newAircraftRegisterId: MasterData.all.aircraftRegisters.items[3].id
        }
      ],
      changeLogsViewed: true
    },
    flightRequirements: [
      {
        id: '7092902000000155131',
        definition: { category: '', label: 'IFN', stcId: '3', flightNumber: 'W5 5013', departureAirportId: '7092901520000000350', arrivalAirportId: '7092901520000001564' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 85,
          times: [{ stdLowerBound: 235, stdUpperBound: 355 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 85,
              times: [{ stdLowerBound: 235, stdUpperBound: 355 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 295, aircraftRegisterId: '7092902880000000573' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155152',
        definition: { category: 'شمسا', label: 'NJF', stcId: '3', flightNumber: 'W5 5016', departureAirportId: '7092901520000001564', arrivalAirportId: '7092901520000002646' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 390, stdUpperBound: 510 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 390, stdUpperBound: 510 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 450, aircraftRegisterId: '7092902880000000573' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155112',
        definition: {
          category: 'مهدالبراق',
          label: 'BGW',
          stcId: '3',
          flightNumber: 'W5 5002',
          departureAirportId: '7092901520000002340',
          arrivalAirportId: '7092901520000000350'
        },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 150,
          times: [{ stdLowerBound: 15, stdUpperBound: 135 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 150,
              times: [{ stdLowerBound: 15, stdUpperBound: 135 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 75, aircraftRegisterId: '7092902880000000573' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155195',
        definition: { category: 'شمسا', label: 'NJF', stcId: '13', flightNumber: 'W5 5086', departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000002646' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 150,
          times: [{ stdLowerBound: 765, stdUpperBound: 885 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 150,
              times: [{ stdLowerBound: 765, stdUpperBound: 885 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 825, aircraftRegisterId: '7092902880000000573' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155126',
        definition: { category: '', label: 'MHD', stcId: '10', flightNumber: 'W5 1030', departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 225, stdUpperBound: 345 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 225, stdUpperBound: 345 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 285, aircraftRegisterId: '7092902880000000283' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155175',
        definition: { category: 'شمسا', label: 'NJF', stcId: '3', flightNumber: 'W5 5003', departureAirportId: '7092901520000002646', arrivalAirportId: '7092901520000002340' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 135,
          times: [{ stdLowerBound: 555, stdUpperBound: 675 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 135,
              times: [{ stdLowerBound: 555, stdUpperBound: 675 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 615, aircraftRegisterId: '7092902880000000573' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155216',
        definition: { category: 'شمسا', label: 'NJF', stcId: '13', flightNumber: 'W5 5085', departureAirportId: '7092901520000002646', arrivalAirportId: '7092901520000002340' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 135,
          times: [{ stdLowerBound: 990, stdUpperBound: 1110 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 135,
              times: [{ stdLowerBound: 990, stdUpperBound: 1110 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 1050, aircraftRegisterId: '7092902880000000573' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155104',
        definition: { category: '', label: 'KER', stcId: '10', flightNumber: 'W5 1050', departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 0, stdUpperBound: 120 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 0, stdUpperBound: 120 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 60, aircraftRegisterId: '7092902880000000560' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155205',
        definition: { category: '', label: 'KER', stcId: '10', flightNumber: 'W5 1052', departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 930, stdUpperBound: 1050 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 930, stdUpperBound: 1050 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 990, aircraftRegisterId: '7092902880000000283' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155146',
        definition: { category: '', label: 'KER', stcId: '10', flightNumber: 'W5 1054', departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 320, stdUpperBound: 440 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 320, stdUpperBound: 440 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 380, aircraftRegisterId: '7092902880000000560' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155212',
        definition: { category: '', label: 'KIH', stcId: '3', flightNumber: 'W5 1012', departureAirportId: '7092901520000006305', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 105,
          times: [{ stdLowerBound: 990, stdUpperBound: 1110 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 105,
              times: [{ stdLowerBound: 990, stdUpperBound: 1110 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 1050, aircraftRegisterId: '7092902880000000560' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155105',
        definition: { category: '', label: 'THR', stcId: '10', flightNumber: 'W5 1081', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000002340' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 20, stdUpperBound: 140 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 20, stdUpperBound: 140 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 80, aircraftRegisterId: '7092902880000000283' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155120',
        definition: { category: '', label: 'THR', stcId: '10', flightNumber: 'W5 1051', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006282' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 160, stdUpperBound: 280 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 160, stdUpperBound: 280 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 220, aircraftRegisterId: '7092902880000000560' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155222',
        definition: { category: '', label: 'THR', stcId: '10', flightNumber: 'W5 1053', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006282' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 1090, stdUpperBound: 1210 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 1090, stdUpperBound: 1210 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 1150, aircraftRegisterId: '7092902880000000283' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155188',
        definition: { category: '', label: 'THR', stcId: '10', flightNumber: 'W5 1055', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006282' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 770, stdUpperBound: 890 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 770, stdUpperBound: 890 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 830, aircraftRegisterId: '7092902880000000283' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155194',
        definition: { category: '', label: 'KIH', stcId: '3', flightNumber: 'W5 1013', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006305' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 95,
          times: [{ stdLowerBound: 820, stdUpperBound: 940 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 95,
              times: [{ stdLowerBound: 820, stdUpperBound: 940 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 880, aircraftRegisterId: '7092902880000000560' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155215',
        definition: { category: '', label: 'BND', stcId: '10', flightNumber: 'W5 4592', departureAirportId: '7092901520000000426', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 105,
          times: [{ stdLowerBound: 1000, stdUpperBound: 1120 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000299' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 105,
              times: [{ stdLowerBound: 1000, stdUpperBound: 1120 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000299' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 1060, aircraftRegisterId: '7092902880000000299' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155159',
        definition: { category: '', label: 'ESB', stcId: '10', flightNumber: 'W5 0119', departureAirportId: '7092901520000001070', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 140,
          times: [{ stdLowerBound: 420, stdUpperBound: 540 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000298' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 140,
              times: [{ stdLowerBound: 420, stdUpperBound: 540 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000298' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 480, aircraftRegisterId: '7092902880000000298' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155130',
        definition: { category: '', label: 'ESB', stcId: '10', flightNumber: 'W5 0118', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000001070' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 165,
          times: [{ stdLowerBound: 150, stdUpperBound: 270 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000298' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 165,
              times: [{ stdLowerBound: 150, stdUpperBound: 270 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000298' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 210, aircraftRegisterId: '7092902880000000298' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155192',
        definition: { category: '', label: 'IST', stcId: '10', flightNumber: 'W5 0114', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000001628' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 195,
          times: [{ stdLowerBound: 705, stdUpperBound: 825 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000298' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 195,
              times: [{ stdLowerBound: 705, stdUpperBound: 825 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000298' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 765, aircraftRegisterId: '7092902880000000298' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155186',
        definition: { category: 'شمسا', label: 'NJF', stcId: '3', flightNumber: 'W5 5042', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000002646' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 750, stdUpperBound: 870 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000282' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 750, stdUpperBound: 870 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000282' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 810, aircraftRegisterId: '7092902880000000282' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155154',
        definition: { category: 'شمسا', label: 'NJF', stcId: '10', flightNumber: 'W5 5062', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000002646' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 420, stdUpperBound: 540 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000292' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 420, stdUpperBound: 540 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000292' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 480, aircraftRegisterId: '7092902880000000292' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155185',
        definition: { category: 'شمسا', label: 'NJF', stcId: '3', flightNumber: 'W5 5066', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000002646' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 750, stdUpperBound: 870 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000292' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 750, stdUpperBound: 870 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000292' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 810, aircraftRegisterId: '7092902880000000292' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155138',
        definition: { category: '', label: 'VKO', stcId: '10', flightNumber: 'W5 0084', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000004007' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 225,
          times: [{ stdLowerBound: 120, stdUpperBound: 240 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000282' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 225,
              times: [{ stdLowerBound: 120, stdUpperBound: 240 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000282' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 180, aircraftRegisterId: '7092902880000000282' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155189',
        definition: { category: '', label: 'DXB2', stcId: '10', flightNumber: 'W5 0065', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000005420' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 120,
          times: [{ stdLowerBound: 750, stdUpperBound: 870 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000291' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 120,
              times: [{ stdLowerBound: 750, stdUpperBound: 870 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000291' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 810, aircraftRegisterId: '7092902880000000291' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155221',
        definition: { category: '', label: 'IST', stcId: '10', flightNumber: 'W5 0115', departureAirportId: '7092901520000001628', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 180,
          times: [{ stdLowerBound: 990, stdUpperBound: 1110 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000298' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 180,
              times: [{ stdLowerBound: 990, stdUpperBound: 1110 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000298' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 1050, aircraftRegisterId: '7092902880000000298' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155223',
        definition: { category: 'شمسا', label: 'NJF', stcId: '3', flightNumber: 'W5 5068', departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000002646' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 150,
          times: [{ stdLowerBound: 1125, stdUpperBound: 1245 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000292' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 150,
              times: [{ stdLowerBound: 1125, stdUpperBound: 1245 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000292' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 1185, aircraftRegisterId: '7092902880000000292' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155176',
        definition: { category: '', label: 'MHD', stcId: '10', flightNumber: 'W5 1034', departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 615, stdUpperBound: 735 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000299' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 615, stdUpperBound: 735 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000299' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 675, aircraftRegisterId: '7092902880000000299' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155213',
        definition: { category: '', label: 'MHD', stcId: '10', flightNumber: 'W5 1036', departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 85,
          times: [{ stdLowerBound: 1020, stdUpperBound: 1140 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 85,
              times: [{ stdLowerBound: 1020, stdUpperBound: 1140 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 1080, aircraftRegisterId: '7092902880000000273' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155203',
        definition: { category: 'شمسا', label: 'NJF', stcId: '3', flightNumber: 'W5 5041', departureAirportId: '7092901520000002646', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 915, stdUpperBound: 1035 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000282' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 915, stdUpperBound: 1035 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000282' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 975, aircraftRegisterId: '7092902880000000282' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155173',
        definition: { category: 'شمسا', label: 'NJF', stcId: '10', flightNumber: 'W5 5061', departureAirportId: '7092901520000002646', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 585, stdUpperBound: 705 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000292' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 585, stdUpperBound: 705 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000292' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 645, aircraftRegisterId: '7092902880000000292' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155230',
        definition: { category: 'شمسا', label: 'NJF', stcId: '3', flightNumber: 'W5 5065', departureAirportId: '7092901520000002646', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 1350, stdUpperBound: 1440 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000292' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 1350, stdUpperBound: 1440 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000292' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 1410, aircraftRegisterId: '7092902880000000292' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155207',
        definition: { category: 'شمسا', label: 'NJF', stcId: '3', flightNumber: 'W5 5067', departureAirportId: '7092901520000002646', arrivalAirportId: '7092901520000002340' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 135,
          times: [{ stdLowerBound: 915, stdUpperBound: 1035 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000292' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 135,
              times: [{ stdLowerBound: 915, stdUpperBound: 1035 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000292' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 975, aircraftRegisterId: '7092902880000000292' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155226',
        definition: { category: '', label: 'PEK', stcId: '10', flightNumber: 'W5 0078', departureAirportId: '7092901520000002937', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 480,
          times: [{ stdLowerBound: 915, stdUpperBound: 1035 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001120' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 480,
              times: [{ stdLowerBound: 915, stdUpperBound: 1035 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001120' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 975, aircraftRegisterId: '7092902880000001120' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155168',
        definition: { category: '', label: 'VKO', stcId: '10', flightNumber: 'W5 0085', departureAirportId: '7092901520000004007', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 210,
          times: [{ stdLowerBound: 420, stdUpperBound: 540 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000282' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 210,
              times: [{ stdLowerBound: 420, stdUpperBound: 540 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000282' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 480, aircraftRegisterId: '7092902880000000282' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155139',
        definition: { category: '', label: 'ZAH', stcId: '10', flightNumber: 'W5 1070', departureAirportId: '7092901520000004442', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 270, stdUpperBound: 390 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000299' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 270, stdUpperBound: 390 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000299' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 330, aircraftRegisterId: '7092902880000000299' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155211',
        definition: { category: '', label: 'DXB2', stcId: '10', flightNumber: 'W5 0064', departureAirportId: '7092901520000005420', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 120,
          times: [{ stdLowerBound: 960, stdUpperBound: 1080 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000291' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 120,
              times: [{ stdLowerBound: 960, stdUpperBound: 1080 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000291' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 1020, aircraftRegisterId: '7092902880000000291' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155128',
        definition: { category: '', label: 'KBL', stcId: '3', flightNumber: 'W5 1102', departureAirportId: '7092901520000006248', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 165,
          times: [{ stdLowerBound: 135, stdUpperBound: 255 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000292' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 165,
              times: [{ stdLowerBound: 135, stdUpperBound: 255 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000292' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 195, aircraftRegisterId: '7092902880000000292' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155179',
        definition: { category: '', label: 'KIH', stcId: '3', flightNumber: 'W5 1042', departureAirportId: '7092901520000006305', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 695, stdUpperBound: 815 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 695, stdUpperBound: 815 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 755, aircraftRegisterId: '7092902880000000273' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155197',
        definition: { category: '', label: 'BND', stcId: '10', flightNumber: 'W5 4593', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000000426' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 830, stdUpperBound: 950 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000299' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 830, stdUpperBound: 950 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000299' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 890, aircraftRegisterId: '7092902880000000299' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155156',
        definition: { category: '', label: 'THR', stcId: '10', flightNumber: 'W5 1035', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000002340' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 450, stdUpperBound: 570 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000299' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 450, stdUpperBound: 570 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000299' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 510, aircraftRegisterId: '7092902880000000299' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155199',
        definition: { category: '', label: 'THR', stcId: '10', flightNumber: 'W5 1037', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000002340' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 850, stdUpperBound: 970 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 850, stdUpperBound: 970 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 910, aircraftRegisterId: '7092902880000000273' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155118',
        definition: { category: '', label: 'ZAH', stcId: '10', flightNumber: 'W5 1071', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000004442' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 105,
          times: [{ stdLowerBound: 105, stdUpperBound: 225 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000299' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 105,
              times: [{ stdLowerBound: 105, stdUpperBound: 225 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000299' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 165, aircraftRegisterId: '7092902880000000299' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155164',
        definition: { category: '', label: 'KIH', stcId: '3', flightNumber: 'W5 1043', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006305' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 105,
          times: [{ stdLowerBound: 520, stdUpperBound: 640 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 105,
              times: [{ stdLowerBound: 520, stdUpperBound: 640 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 580, aircraftRegisterId: '7092902880000000273' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155109',
        definition: { category: '', label: 'PGU', stcId: '3', flightNumber: 'W5 1016', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000009177' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 110,
          times: [{ stdLowerBound: 45, stdUpperBound: 165 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 110,
              times: [{ stdLowerBound: 45, stdUpperBound: 165 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 105, aircraftRegisterId: '7092902880000000273' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155134',
        definition: { category: '', label: 'PGU', stcId: '3', flightNumber: 'W5 1017', departureAirportId: '7092901520000009177', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 225, stdUpperBound: 345 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 225, stdUpperBound: 345 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 285, aircraftRegisterId: '7092902880000000273' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155224',
        definition: { category: '', label: 'BKK', stcId: '10', flightNumber: 'W5 0050', departureAirportId: '7092901520000000397', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 445,
          times: [{ stdLowerBound: 875, stdUpperBound: 995 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000348' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 445,
              times: [{ stdLowerBound: 875, stdUpperBound: 995 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000348' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 935, aircraftRegisterId: '7092902880000000348' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155145',
        definition: { category: '', label: 'IST', stcId: '10', flightNumber: 'W5 0116', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000001628' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 195,
          times: [{ stdLowerBound: 210, stdUpperBound: 330 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001025' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 195,
              times: [{ stdLowerBound: 210, stdUpperBound: 330 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001025' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 270, aircraftRegisterId: '7092902880000001025' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155220',
        definition: { category: '', label: 'LHE', stcId: '10', flightNumber: 'W5 1195', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000008952' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 200,
          times: [{ stdLowerBound: 930, stdUpperBound: 1050 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001025' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 200,
              times: [{ stdLowerBound: 930, stdUpperBound: 1050 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001025' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 990, aircraftRegisterId: '7092902880000001025' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155171',
        definition: { category: '', label: 'IST', stcId: '10', flightNumber: 'W5 0117', departureAirportId: '7092901520000001628', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 180,
          times: [{ stdLowerBound: 495, stdUpperBound: 615 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001025' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 180,
              times: [{ stdLowerBound: 495, stdUpperBound: 615 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001025' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 555, aircraftRegisterId: '7092902880000001025' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155225',
        definition: { category: '', label: 'KUL', stcId: '10', flightNumber: 'W5 0082', departureAirportId: '7092901520000006443', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 480,
          times: [{ stdLowerBound: 855, stdUpperBound: 975 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000268' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 480,
              times: [{ stdLowerBound: 855, stdUpperBound: 975 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000268' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 915, aircraftRegisterId: '7092902880000000268' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155228',
        definition: { category: '', label: 'LHE', stcId: '10', flightNumber: 'W5 1194', departureAirportId: '7092901520000008952', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 225,
          times: [{ stdLowerBound: 1200, stdUpperBound: 1320 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001025' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 225,
              times: [{ stdLowerBound: 1200, stdUpperBound: 1320 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001025' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 1260, aircraftRegisterId: '7092902880000001025' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155136',
        definition: { category: '', label: 'BND', stcId: '10', flightNumber: 'W5 1094', departureAirportId: '7092901520000000426', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 105,
          times: [{ stdLowerBound: 240, stdUpperBound: 360 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000280' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 105,
              times: [{ stdLowerBound: 240, stdUpperBound: 360 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000280' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 300, aircraftRegisterId: '7092902880000000280' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155107',
        definition: { category: '', label: 'BND', stcId: '10', flightNumber: 'W5 1095', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000000426' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 105,
          times: [{ stdLowerBound: 15, stdUpperBound: 135 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000280' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 105,
              times: [{ stdLowerBound: 15, stdUpperBound: 135 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000280' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 75, aircraftRegisterId: '7092902880000000280' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155114',
        definition: { category: '', label: 'AWZ', stcId: '10', flightNumber: 'W5 4587', departureAirportId: '7092901520000000247', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 70,
          times: [{ stdLowerBound: 110, stdUpperBound: 230 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 70,
              times: [{ stdLowerBound: 110, stdUpperBound: 230 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 170, aircraftRegisterId: '7092902880000000910' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155204',
        definition: { category: '', label: 'BXR', stcId: '10', flightNumber: 'W5 4576', departureAirportId: '7092901520000000546', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 125,
          times: [{ stdLowerBound: 900, stdUpperBound: 1020 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 125,
              times: [{ stdLowerBound: 900, stdUpperBound: 1020 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 960, aircraftRegisterId: '7092902880000000304' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155162',
        definition: { category: '', label: 'IFN', stcId: '10', flightNumber: 'W5 4561', departureAirportId: '7092901520000001564', arrivalAirportId: '7092901520000006282' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 70,
          times: [{ stdLowerBound: 530, stdUpperBound: 650 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 70,
              times: [{ stdLowerBound: 530, stdUpperBound: 650 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 590, aircraftRegisterId: '7092902880000000306' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155133',
        definition: { category: '', label: 'TBZ', stcId: '10', flightNumber: 'W5 4560', departureAirportId: '7092901520000001564', arrivalAirportId: '7092901520000008123' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 220, stdUpperBound: 340 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 220, stdUpperBound: 340 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 280, aircraftRegisterId: '7092902880000000306' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155102',
        definition: { category: '', label: 'IFN', stcId: '10', flightNumber: 'W5 4530', departureAirportId: '7092901520000001564', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 60,
          times: [{ stdLowerBound: 0, stdUpperBound: 120 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 60,
              times: [{ stdLowerBound: 0, stdUpperBound: 120 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 60, aircraftRegisterId: '7092902880000000310' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155127',
        definition: { category: '', label: 'IFN', stcId: '10', flightNumber: 'W5 4532', departureAirportId: '7092901520000001564', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 60,
          times: [{ stdLowerBound: 240, stdUpperBound: 360 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 60,
              times: [{ stdLowerBound: 240, stdUpperBound: 360 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 300, aircraftRegisterId: '7092902880000000310' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155206',
        definition: { category: '', label: 'MHD', stcId: '10', flightNumber: 'W5 1058', departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000006282' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 960, stdUpperBound: 1080 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 960, stdUpperBound: 1080 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 1020, aircraftRegisterId: '7092902880000000306' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155106',
        definition: { category: '', label: 'SYJ', stcId: '10', flightNumber: 'W5 1062', departureAirportId: '7092901520000003603', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 95,
          times: [{ stdLowerBound: 15, stdUpperBound: 135 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 95,
              times: [{ stdLowerBound: 15, stdUpperBound: 135 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 75, aircraftRegisterId: '7092902880000001208' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000157191',
        definition: { category: '', label: 'BJB', stcId: '10', flightNumber: 'W5 4568', departureAirportId: '7092901520000004847', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 75,
          times: [{ stdLowerBound: 690, stdUpperBound: 810 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 75,
              times: [{ stdLowerBound: 690, stdUpperBound: 810 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 750, aircraftRegisterId: '7092902880000000910' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155196',
        definition: { category: '', label: 'CQD', stcId: '10', flightNumber: 'W5 4543', departureAirportId: '7092901520000005186', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 70,
          times: [{ stdLowerBound: 850, stdUpperBound: 970 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 70,
              times: [{ stdLowerBound: 850, stdUpperBound: 970 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 910, aircraftRegisterId: '7092902880000001208' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155110',
        definition: { category: '', label: 'IFN', stcId: '10', flightNumber: 'W5 4560', departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000001564' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 70,
          times: [{ stdLowerBound: 90, stdUpperBound: 210 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 70,
              times: [{ stdLowerBound: 90, stdUpperBound: 210 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 150, aircraftRegisterId: '7092902880000000306' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155191',
        definition: { category: '', label: 'KER', stcId: '10', flightNumber: 'W5 1059', departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000002340' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 810, stdUpperBound: 930 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 810, stdUpperBound: 930 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 870, aircraftRegisterId: '7092902880000000306' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155167',
        definition: { category: '', label: 'RJN', stcId: '10', flightNumber: 'W5 1056', departureAirportId: '7092901520000007677', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 105,
          times: [{ stdLowerBound: 525, stdUpperBound: 645 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 105,
              times: [{ stdLowerBound: 525, stdUpperBound: 645 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 585, aircraftRegisterId: '7092902880000000310' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155214',
        definition: { category: '', label: 'SYZ', stcId: '10', flightNumber: 'W5 1086', departureAirportId: '7092901520000008084', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 85,
          times: [{ stdLowerBound: 1020, stdUpperBound: 1140 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 85,
              times: [{ stdLowerBound: 1020, stdUpperBound: 1140 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 1080, aircraftRegisterId: '7092902880000000910' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155149',
        definition: { category: '', label: 'SYZ', stcId: '10', flightNumber: 'W5 1088', departureAirportId: '7092901520000008084', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 85,
          times: [{ stdLowerBound: 380, stdUpperBound: 500 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 85,
              times: [{ stdLowerBound: 380, stdUpperBound: 500 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 440, aircraftRegisterId: '7092902880000000910' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155150',
        definition: { category: '', label: 'IFN', stcId: '10', flightNumber: 'W5 4561', departureAirportId: '7092901520000008123', arrivalAirportId: '7092901520000001564' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 380, stdUpperBound: 500 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 380, stdUpperBound: 500 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 440, aircraftRegisterId: '7092902880000000306' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155099',
        definition: { category: '', label: 'AWZ', stcId: '10', flightNumber: 'W5 4586', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000000247' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 70,
          times: [{ stdLowerBound: 0, stdUpperBound: 90 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 70,
              times: [{ stdLowerBound: 0, stdUpperBound: 90 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 30, aircraftRegisterId: '7092902880000000910' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155187',
        definition: { category: '', label: 'BXR', stcId: '10', flightNumber: 'W5 4577', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000000546' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 120,
          times: [{ stdLowerBound: 735, stdUpperBound: 855 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 120,
              times: [{ stdLowerBound: 735, stdUpperBound: 855 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 795, aircraftRegisterId: '7092902880000000304' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155209',
        definition: { category: '', label: 'IFN', stcId: '10', flightNumber: 'W5 4531', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000001564' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 70,
          times: [{ stdLowerBound: 1020, stdUpperBound: 1140 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 70,
              times: [{ stdLowerBound: 1020, stdUpperBound: 1140 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 1080, aircraftRegisterId: '7092902880000000310' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155116',
        definition: { category: '', label: 'IFN', stcId: '10', flightNumber: 'W5 4533', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000001564' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 70,
          times: [{ stdLowerBound: 120, stdUpperBound: 240 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 70,
              times: [{ stdLowerBound: 120, stdUpperBound: 240 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 180, aircraftRegisterId: '7092902880000000310' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155210',
        definition: { category: '', label: 'SYJ', stcId: '10', flightNumber: 'W5 1063', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000003603' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 975, stdUpperBound: 1095 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 975, stdUpperBound: 1095 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 1035, aircraftRegisterId: '7092902880000001208' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000157185',
        definition: { category: '', label: 'BJB', stcId: '10', flightNumber: 'W5 4569', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000004847' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 75,
          times: [{ stdLowerBound: 570, stdUpperBound: 690 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 75,
              times: [{ stdLowerBound: 570, stdUpperBound: 690 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 630, aircraftRegisterId: '7092902880000000910' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155180',
        definition: { category: '', label: 'CQD', stcId: '10', flightNumber: 'W5 4542', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000005186' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 70,
          times: [{ stdLowerBound: 730, stdUpperBound: 850 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 70,
              times: [{ stdLowerBound: 730, stdUpperBound: 850 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 790, aircraftRegisterId: '7092902880000001208' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155151',
        definition: { category: '', label: 'RJN', stcId: '10', flightNumber: 'W5 1057', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000007677' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 105,
          times: [{ stdLowerBound: 375, stdUpperBound: 495 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 105,
              times: [{ stdLowerBound: 375, stdUpperBound: 495 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 435, aircraftRegisterId: '7092902880000000310' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155200',
        definition: { category: '', label: 'SYZ', stcId: '10', flightNumber: 'W5 1087', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000008084' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 870, stdUpperBound: 990 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 870, stdUpperBound: 990 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 930, aircraftRegisterId: '7092902880000000910' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155132',
        definition: { category: '', label: 'SYZ', stcId: '10', flightNumber: 'W5 1089', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000008084' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 80,
          times: [{ stdLowerBound: 240, stdUpperBound: 360 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 80,
              times: [{ stdLowerBound: 240, stdUpperBound: 360 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 300, aircraftRegisterId: '7092902880000000910' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155182',
        definition: { category: '', label: 'XBJ', stcId: '10', flightNumber: 'W5 1049', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000008669' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 720, stdUpperBound: 840 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 720, stdUpperBound: 840 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 780, aircraftRegisterId: '7092902880000000310' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155111',
        definition: { category: '', label: 'ACZ', stcId: '10', flightNumber: 'W5 1085', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000008889' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 120,
          times: [{ stdLowerBound: 40, stdUpperBound: 160 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 120,
              times: [{ stdLowerBound: 40, stdUpperBound: 160 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 100, aircraftRegisterId: '7092902880000000304' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155158',
        definition: { category: '', label: 'IIL', stcId: '10', flightNumber: 'W5 4572', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000009181' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 80,
          times: [{ stdLowerBound: 460, stdUpperBound: 580 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 80,
              times: [{ stdLowerBound: 460, stdUpperBound: 580 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 520, aircraftRegisterId: '7092902880000001208' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155121',
        definition: { category: '', label: 'GCH', stcId: '10', flightNumber: 'W5 4520', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000009227' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 170, stdUpperBound: 290 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 170, stdUpperBound: 290 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 230, aircraftRegisterId: '7092902880000001208' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155201',
        definition: { category: '', label: 'XBJ', stcId: '10', flightNumber: 'W5 1048', departureAirportId: '7092901520000008669', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 870, stdUpperBound: 990 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 870, stdUpperBound: 990 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 930, aircraftRegisterId: '7092902880000000310' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155161',
        definition: { category: '', label: 'ACZ', stcId: '10', flightNumber: 'W5 1084', departureAirportId: '7092901520000008889', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 130,
          times: [{ stdLowerBound: 455, stdUpperBound: 575 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 130,
              times: [{ stdLowerBound: 455, stdUpperBound: 575 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 515, aircraftRegisterId: '7092902880000000304' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155125',
        definition: { category: '', label: 'IHR', stcId: '10', flightNumber: 'W5 1085', departureAirportId: '7092901520000008889', arrivalAirportId: '7092901520000009174' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 75,
          times: [{ stdLowerBound: 205, stdUpperBound: 325 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 75,
              times: [{ stdLowerBound: 205, stdUpperBound: 325 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 265, aircraftRegisterId: '7092902880000000304' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155144',
        definition: { category: '', label: 'ACZ', stcId: '10', flightNumber: 'W5 1084', departureAirportId: '7092901520000009174', arrivalAirportId: '7092901520000008889' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 75,
          times: [{ stdLowerBound: 330, stdUpperBound: 450 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 75,
              times: [{ stdLowerBound: 330, stdUpperBound: 450 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 390, aircraftRegisterId: '7092902880000000304' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155170',
        definition: { category: '', label: 'IIL', stcId: '10', flightNumber: 'W5 4573', departureAirportId: '7092901520000009181', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 75,
          times: [{ stdLowerBound: 585, stdUpperBound: 705 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 75,
              times: [{ stdLowerBound: 585, stdUpperBound: 705 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 645, aircraftRegisterId: '7092902880000001208' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155142',
        definition: { category: '', label: 'GCH', stcId: '10', flightNumber: 'W5 4521', departureAirportId: '7092901520000009227', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 95,
          times: [{ stdLowerBound: 305, stdUpperBound: 425 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 95,
              times: [{ stdLowerBound: 305, stdUpperBound: 425 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 365, aircraftRegisterId: '7092902880000001208' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155124',
        definition: { category: '', label: 'IST', stcId: '10', flightNumber: 'W5 0112', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000001628' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 195,
          times: [{ stdLowerBound: 80, stdUpperBound: 200 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000970' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 195,
              times: [{ stdLowerBound: 80, stdUpperBound: 200 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000970' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 140, aircraftRegisterId: '7092902880000000970' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155219',
        definition: { category: '', label: 'DEL', stcId: '10', flightNumber: 'W5 0071', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000005317' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 295,
          times: [{ stdLowerBound: 760, stdUpperBound: 880 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000270' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 295,
              times: [{ stdLowerBound: 760, stdUpperBound: 880 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000270' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 820, aircraftRegisterId: '7092902880000000270' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155123',
        definition: { category: '', label: 'DXB1', stcId: '10', flightNumber: 'W5 0061', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000005420' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 120,
          times: [{ stdLowerBound: 150, stdUpperBound: 270 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000270' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 120,
              times: [{ stdLowerBound: 150, stdUpperBound: 270 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000270' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 210, aircraftRegisterId: '7092902880000000270' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155163',
        definition: { category: '', label: 'IST', stcId: '10', flightNumber: 'W5 0113', departureAirportId: '7092901520000001628', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 180,
          times: [{ stdLowerBound: 435, stdUpperBound: 555 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000970' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 180,
              times: [{ stdLowerBound: 435, stdUpperBound: 555 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000970' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 495, aircraftRegisterId: '7092902880000000970' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155227',
        definition: { category: '', label: 'PVG', stcId: '10', flightNumber: 'W5 0076', departureAirportId: '7092901520000003099', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 570,
          times: [{ stdLowerBound: 840, stdUpperBound: 960 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001088' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 570,
              times: [{ stdLowerBound: 840, stdUpperBound: 960 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001088' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 900, aircraftRegisterId: '7092902880000001088' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155229',
        definition: { category: '', label: 'DEL', stcId: '10', flightNumber: 'W5 0070', departureAirportId: '7092901520000005317', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 315,
          times: [{ stdLowerBound: 1140, stdUpperBound: 1260 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000270' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 315,
              times: [{ stdLowerBound: 1140, stdUpperBound: 1260 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000270' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 1200, aircraftRegisterId: '7092902880000000270' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155157',
        definition: { category: '', label: 'DXB1', stcId: '10', flightNumber: 'W5 0060', departureAirportId: '7092901520000005420', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 120,
          times: [{ stdLowerBound: 420, stdUpperBound: 540 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000270' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 120,
              times: [{ stdLowerBound: 420, stdUpperBound: 540 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000270' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 0,
            flight: { std: 480, aircraftRegisterId: '7092902880000000270' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155323',
        definition: {
          category: 'مهدالبراق',
          label: 'BGW',
          stcId: '13',
          flightNumber: 'W5 5081',
          departureAirportId: '7092901520000000350',
          arrivalAirportId: '7092901520000002340'
        },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 130,
          times: [{ stdLowerBound: 280, stdUpperBound: 400 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 130,
              times: [{ stdLowerBound: 280, stdUpperBound: 400 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 340, aircraftRegisterId: '7092902880000000573' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155345',
        definition: { category: '', label: 'PGU', stcId: '3', flightNumber: 'W5 4567', departureAirportId: '7092901520000001564', arrivalAirportId: '7092901520000009177' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 80,
          times: [{ stdLowerBound: 515, stdUpperBound: 635 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 80,
              times: [{ stdLowerBound: 515, stdUpperBound: 635 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 575, aircraftRegisterId: '7092902880000000560' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155292',
        definition: {
          category: 'مهدالبراق',
          label: 'BGW',
          stcId: '13',
          flightNumber: 'W5 5082',
          departureAirportId: '7092901520000002340',
          arrivalAirportId: '7092901520000000350'
        },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 150,
          times: [{ stdLowerBound: 60, stdUpperBound: 180 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 150,
              times: [{ stdLowerBound: 60, stdUpperBound: 180 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 120, aircraftRegisterId: '7092902880000000573' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155390',
        definition: { category: 'شمسا', label: 'NJF', stcId: '13', flightNumber: 'W5 5086', departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000002646' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 150,
          times: [{ stdLowerBound: 870, stdUpperBound: 990 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 150,
              times: [{ stdLowerBound: 870, stdUpperBound: 990 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 930, aircraftRegisterId: '7092902880000000560' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155340',
        definition: { category: '', label: 'MHD', stcId: '10', flightNumber: 'W5 1058', departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000006282' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 85,
          times: [{ stdLowerBound: 465, stdUpperBound: 585 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 85,
              times: [{ stdLowerBound: 465, stdUpperBound: 585 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 525, aircraftRegisterId: '7092902880000000283' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155346',
        definition: { category: '', label: 'KIH', stcId: '3', flightNumber: 'W5 1044', departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000006305' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 120,
          times: [{ stdLowerBound: 480, stdUpperBound: 600 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 120,
              times: [{ stdLowerBound: 480, stdUpperBound: 600 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 540, aircraftRegisterId: '7092902880000000573' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155385',
        definition: { category: '', label: 'MHD', stcId: '10', flightNumber: 'W5 1080', departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 95,
          times: [{ stdLowerBound: 840, stdUpperBound: 960 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 95,
              times: [{ stdLowerBound: 840, stdUpperBound: 960 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 900, aircraftRegisterId: '7092902880000000573' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155306',
        definition: { category: '', label: 'PGU', stcId: '3', flightNumber: 'W5 1014', departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000009177' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 120,
          times: [{ stdLowerBound: 195, stdUpperBound: 315 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 120,
              times: [{ stdLowerBound: 195, stdUpperBound: 315 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 255, aircraftRegisterId: '7092902880000000560' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155409',
        definition: { category: 'شمسا', label: 'NJF', stcId: '13', flightNumber: 'W5 5085', departureAirportId: '7092901520000002646', arrivalAirportId: '7092901520000002340' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 135,
          times: [{ stdLowerBound: 1095, stdUpperBound: 1215 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 135,
              times: [{ stdLowerBound: 1095, stdUpperBound: 1215 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 1155, aircraftRegisterId: '7092902880000000560' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155320',
        definition: { category: '', label: 'KER', stcId: '10', flightNumber: 'W5 1059', departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000002340' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 85,
          times: [{ stdLowerBound: 320, stdUpperBound: 440 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 85,
              times: [{ stdLowerBound: 320, stdUpperBound: 440 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 380, aircraftRegisterId: '7092902880000000283' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155280',
        definition: { category: '', label: 'KER', stcId: '10', flightNumber: 'W5 1050', departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 0, stdUpperBound: 120 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 0, stdUpperBound: 120 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 60, aircraftRegisterId: '7092902880000000283' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155364',
        definition: { category: '', label: 'KER', stcId: '10', flightNumber: 'W5 1054', departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 610, stdUpperBound: 730 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 610, stdUpperBound: 730 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 670, aircraftRegisterId: '7092902880000000283' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155369',
        definition: { category: '', label: 'KIH', stcId: '3', flightNumber: 'W5 1045', departureAirportId: '7092901520000006305', arrivalAirportId: '7092901520000002340' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 120,
          times: [{ stdLowerBound: 670, stdUpperBound: 790 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 120,
              times: [{ stdLowerBound: 670, stdUpperBound: 790 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 730, aircraftRegisterId: '7092902880000000573' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155399',
        definition: { category: '', label: 'KIH', stcId: '3', flightNumber: 'W5 1012', departureAirportId: '7092901520000006305', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 105,
          times: [{ stdLowerBound: 990, stdUpperBound: 1110 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 105,
              times: [{ stdLowerBound: 990, stdUpperBound: 1110 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 1050, aircraftRegisterId: '7092902880000000283' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155281',
        definition: { category: '', label: 'THR', stcId: '10', flightNumber: 'W5 1081', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000002340' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 20, stdUpperBound: 140 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 20, stdUpperBound: 140 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 80, aircraftRegisterId: '7092902880000000560' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155296',
        definition: { category: '', label: 'THR', stcId: '10', flightNumber: 'W5 1051', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006282' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 160, stdUpperBound: 280 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 160, stdUpperBound: 280 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 220, aircraftRegisterId: '7092902880000000283' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155383',
        definition: { category: '', label: 'KIH', stcId: '3', flightNumber: 'W5 1013', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006305' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 110,
          times: [{ stdLowerBound: 805, stdUpperBound: 925 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 110,
              times: [{ stdLowerBound: 805, stdUpperBound: 925 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 865, aircraftRegisterId: '7092902880000000283' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155330',
        definition: { category: '', label: 'IFN', stcId: '3', flightNumber: 'W5 4566', departureAirportId: '7092901520000009177', arrivalAirportId: '7092901520000001564' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 80,
          times: [{ stdLowerBound: 375, stdUpperBound: 495 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 80,
              times: [{ stdLowerBound: 375, stdUpperBound: 495 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 435, aircraftRegisterId: '7092902880000000560' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155368',
        definition: { category: '', label: 'PGU', stcId: '3', flightNumber: 'W5 1015', departureAirportId: '7092901520000009177', arrivalAirportId: '7092901520000002340' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 120,
          times: [{ stdLowerBound: 655, stdUpperBound: 775 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 120,
              times: [{ stdLowerBound: 655, stdUpperBound: 775 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 715, aircraftRegisterId: '7092902880000000560' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155326',
        definition: { category: '', label: 'PGU', stcId: '3', flightNumber: 'W5 4565', departureAirportId: '7092901520000000247', arrivalAirportId: '7092901520000009177' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 75,
          times: [{ stdLowerBound: 345, stdUpperBound: 465 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000299' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 75,
              times: [{ stdLowerBound: 345, stdUpperBound: 465 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000299' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 405, aircraftRegisterId: '7092902880000000299' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155311',
        definition: { category: '', label: 'BND', stcId: '10', flightNumber: 'W5 1094', departureAirportId: '7092901520000000426', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 105,
          times: [{ stdLowerBound: 240, stdUpperBound: 360 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 105,
              times: [{ stdLowerBound: 240, stdUpperBound: 360 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 300, aircraftRegisterId: '7092902880000000273' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155397',
        definition: { category: '', label: 'DAM', stcId: '3', flightNumber: 'W5 0143', departureAirportId: '7092901520000000851', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 125,
          times: [{ stdLowerBound: 960, stdUpperBound: 1080 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001120' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 125,
              times: [{ stdLowerBound: 960, stdUpperBound: 1080 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001120' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 1020, aircraftRegisterId: '7092902880000001120' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155341',
        definition: { category: '', label: 'ESB', stcId: '10', flightNumber: 'W5 0119', departureAirportId: '7092901520000001070', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 140,
          times: [{ stdLowerBound: 420, stdUpperBound: 540 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000282' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 140,
              times: [{ stdLowerBound: 420, stdUpperBound: 540 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000282' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 480, aircraftRegisterId: '7092902880000000282' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155413',
        definition: { category: '', label: 'BKK', stcId: '10', flightNumber: 'W5 0051', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000000397' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 405,
          times: [{ stdLowerBound: 1000, stdUpperBound: 1120 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000298' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 405,
              times: [{ stdLowerBound: 1000, stdUpperBound: 1120 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000298' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 1060, aircraftRegisterId: '7092902880000000298' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155379',
        definition: { category: '', label: 'DAM', stcId: '3', flightNumber: 'W5 0142', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000000851' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 140,
          times: [{ stdLowerBound: 750, stdUpperBound: 870 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001120' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 140,
              times: [{ stdLowerBound: 750, stdUpperBound: 870 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001120' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 810, aircraftRegisterId: '7092902880000001120' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155305',
        definition: { category: '', label: 'ESB', stcId: '10', flightNumber: 'W5 0118', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000001070' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 165,
          times: [{ stdLowerBound: 150, stdUpperBound: 270 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000282' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 165,
              times: [{ stdLowerBound: 150, stdUpperBound: 270 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000282' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 210, aircraftRegisterId: '7092902880000000282' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155380',
        definition: { category: '', label: 'IST', stcId: '10', flightNumber: 'W5 0114', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000001628' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 195,
          times: [{ stdLowerBound: 705, stdUpperBound: 825 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000282' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 195,
              times: [{ stdLowerBound: 705, stdUpperBound: 825 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000282' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 765, aircraftRegisterId: '7092902880000000282' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155309',
        definition: { category: '', label: 'LED', stcId: '10', flightNumber: 'W5 1104', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000002059' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 270,
          times: [{ stdLowerBound: 60, stdUpperBound: 180 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000291' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 270,
              times: [{ stdLowerBound: 60, stdUpperBound: 180 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000291' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 120, aircraftRegisterId: '7092902880000000291' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155391',
        definition: { category: 'شمسا', label: 'NJF', stcId: '3', flightNumber: 'W5 5042', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000002646' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 930, stdUpperBound: 1050 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000292' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 930, stdUpperBound: 1050 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000292' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 990, aircraftRegisterId: '7092902880000000292' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155336',
        definition: { category: 'شمسا', label: 'NJF', stcId: '10', flightNumber: 'W5 5062', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000002646' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 420, stdUpperBound: 540 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000292' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 420, stdUpperBound: 540 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000292' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 480, aircraftRegisterId: '7092902880000000292' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155312',
        definition: { category: '', label: 'VKO', stcId: '10', flightNumber: 'W5 0084', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000004007' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 225,
          times: [{ stdLowerBound: 120, stdUpperBound: 240 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001120' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 225,
              times: [{ stdLowerBound: 120, stdUpperBound: 240 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001120' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 180, aircraftRegisterId: '7092902880000001120' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155378',
        definition: { category: '', label: 'DXB2', stcId: '10', flightNumber: 'W5 0065', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000005420' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 120,
          times: [{ stdLowerBound: 750, stdUpperBound: 870 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000291' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 120,
              times: [{ stdLowerBound: 750, stdUpperBound: 870 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000291' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 810, aircraftRegisterId: '7092902880000000291' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155363',
        definition: { category: '', label: 'EBL', stcId: '10', flightNumber: 'W5 5060', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000009171' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 85,
          times: [{ stdLowerBound: 620, stdUpperBound: 740 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000298' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 85,
              times: [{ stdLowerBound: 620, stdUpperBound: 740 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000298' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 680, aircraftRegisterId: '7092902880000000298' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155289',
        definition: { category: '', label: 'ISU', stcId: '10', flightNumber: 'W5 5058', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000009175' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 90, stdUpperBound: 210 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000298' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 90, stdUpperBound: 210 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000298' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 150, aircraftRegisterId: '7092902880000000298' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155406',
        definition: { category: '', label: 'IST', stcId: '10', flightNumber: 'W5 0115', departureAirportId: '7092901520000001628', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 180,
          times: [{ stdLowerBound: 990, stdUpperBound: 1110 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000282' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 180,
              times: [{ stdLowerBound: 990, stdUpperBound: 1110 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000282' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 1050, aircraftRegisterId: '7092902880000000282' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155356',
        definition: { category: '', label: 'LED', stcId: '10', flightNumber: 'W5 1103', departureAirportId: '7092901520000002059', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 240,
          times: [{ stdLowerBound: 430, stdUpperBound: 550 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000291' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 240,
              times: [{ stdLowerBound: 430, stdUpperBound: 550 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000291' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 490, aircraftRegisterId: '7092902880000000291' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155407',
        definition: { category: 'شمسا', label: 'NJF', stcId: '3', flightNumber: 'W5 5041', departureAirportId: '7092901520000002646', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 1095, stdUpperBound: 1215 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000292' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 1095, stdUpperBound: 1215 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000292' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 1155, aircraftRegisterId: '7092902880000000292' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155359',
        definition: { category: 'شمسا', label: 'NJF', stcId: '10', flightNumber: 'W5 5061', departureAirportId: '7092901520000002646', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 585, stdUpperBound: 705 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000292' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 585, stdUpperBound: 705 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000292' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 645, aircraftRegisterId: '7092902880000000292' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155351',
        definition: { category: '', label: 'VKO', stcId: '10', flightNumber: 'W5 0085', departureAirportId: '7092901520000004007', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 210,
          times: [{ stdLowerBound: 420, stdUpperBound: 540 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001120' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 210,
              times: [{ stdLowerBound: 420, stdUpperBound: 540 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001120' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 480, aircraftRegisterId: '7092902880000001120' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155396',
        definition: { category: '', label: 'DXB2', stcId: '10', flightNumber: 'W5 0064', departureAirportId: '7092901520000005420', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 120,
          times: [{ stdLowerBound: 960, stdUpperBound: 1080 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000291' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 120,
              times: [{ stdLowerBound: 960, stdUpperBound: 1080 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000291' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 1020, aircraftRegisterId: '7092902880000000291' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155392',
        definition: { category: '', label: 'KER', stcId: '10', flightNumber: 'W5 1052', departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 930, stdUpperBound: 1050 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000299' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 930, stdUpperBound: 1050 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000299' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 990, aircraftRegisterId: '7092902880000000299' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155370',
        definition: { category: '', label: 'KIH', stcId: '3', flightNumber: 'W5 1042', departureAirportId: '7092901520000006305', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 695, stdUpperBound: 815 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 695, stdUpperBound: 815 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 755, aircraftRegisterId: '7092902880000000273' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155282',
        definition: { category: '', label: 'BND', stcId: '10', flightNumber: 'W5 1095', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000000426' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 105,
          times: [{ stdLowerBound: 15, stdUpperBound: 135 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 105,
              times: [{ stdLowerBound: 15, stdUpperBound: 135 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 75, aircraftRegisterId: '7092902880000000273' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155408',
        definition: { category: '', label: 'THR', stcId: '10', flightNumber: 'W5 1053', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006282' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 1090, stdUpperBound: 1210 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 1090, stdUpperBound: 1210 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 1150, aircraftRegisterId: '7092902880000000273' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155377',
        definition: { category: '', label: 'THR', stcId: '10', flightNumber: 'W5 1055', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006282' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 770, stdUpperBound: 890 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000299' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 770, stdUpperBound: 890 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000299' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 830, aircraftRegisterId: '7092902880000000299' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155348',
        definition: { category: '', label: 'KIH', stcId: '3', flightNumber: 'W5 1043', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006305' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 105,
          times: [{ stdLowerBound: 520, stdUpperBound: 640 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 105,
              times: [{ stdLowerBound: 520, stdUpperBound: 640 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 580, aircraftRegisterId: '7092902880000000273' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155285',
        definition: { category: '', label: 'PGU', stcId: '3', flightNumber: 'W5 1016', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000009177' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 110,
          times: [{ stdLowerBound: 45, stdUpperBound: 165 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000299' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 110,
              times: [{ stdLowerBound: 45, stdUpperBound: 165 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000299' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 105, aircraftRegisterId: '7092902880000000299' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155376',
        definition: { category: '', label: 'EBL', stcId: '10', flightNumber: 'W5 5059', departureAirportId: '7092901520000009171', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 80,
          times: [{ stdLowerBound: 780, stdUpperBound: 900 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000298' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 80,
              times: [{ stdLowerBound: 780, stdUpperBound: 900 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000298' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 840, aircraftRegisterId: '7092902880000000298' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155308',
        definition: { category: '', label: 'ISU', stcId: '10', flightNumber: 'W5 5057', departureAirportId: '7092901520000009175', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 75,
          times: [{ stdLowerBound: 255, stdUpperBound: 375 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000298' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 75,
              times: [{ stdLowerBound: 255, stdUpperBound: 375 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000298' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 315, aircraftRegisterId: '7092902880000000298' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155302',
        definition: { category: '', label: 'AWZ', stcId: '3', flightNumber: 'W5 4564', departureAirportId: '7092901520000009177', arrivalAirportId: '7092901520000000247' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 75,
          times: [{ stdLowerBound: 210, stdUpperBound: 330 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000299' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 75,
              times: [{ stdLowerBound: 210, stdUpperBound: 330 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000299' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 270, aircraftRegisterId: '7092902880000000299' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155344',
        definition: { category: '', label: 'PGU', stcId: '3', flightNumber: 'W5 1017', departureAirportId: '7092901520000009177', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 105,
          times: [{ stdLowerBound: 480, stdUpperBound: 600 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000299' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 105,
              times: [{ stdLowerBound: 480, stdUpperBound: 600 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000299' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 540, aircraftRegisterId: '7092902880000000299' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155300',
        definition: { category: '', label: 'IST', stcId: '10', flightNumber: 'W5 0112', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000001628' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 195,
          times: [{ stdLowerBound: 80, stdUpperBound: 200 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001025' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 195,
              times: [{ stdLowerBound: 80, stdUpperBound: 200 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001025' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 140, aircraftRegisterId: '7092902880000001025' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155410',
        definition: { category: '', label: 'PEK', stcId: '10', flightNumber: 'W5 0079', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000002937' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 390,
          times: [{ stdLowerBound: 915, stdUpperBound: 1035 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000348' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 390,
              times: [{ stdLowerBound: 915, stdUpperBound: 1035 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000348' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 975, aircraftRegisterId: '7092902880000000348' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155299',
        definition: { category: '', label: 'DXB1', stcId: '10', flightNumber: 'W5 0061', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000005420' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 120,
          times: [{ stdLowerBound: 150, stdUpperBound: 270 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000348' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 120,
              times: [{ stdLowerBound: 150, stdUpperBound: 270 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000348' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 210, aircraftRegisterId: '7092902880000000348' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155420',
        definition: { category: '', label: 'KUL', stcId: '10', flightNumber: 'W5 0083', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000006443' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 480,
          times: [{ stdLowerBound: 1020, stdUpperBound: 1140 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001025' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 480,
              times: [{ stdLowerBound: 1020, stdUpperBound: 1140 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001025' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 1080, aircraftRegisterId: '7092902880000001025' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155347',
        definition: { category: '', label: 'IST', stcId: '10', flightNumber: 'W5 0113', departureAirportId: '7092901520000001628', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 180,
          times: [{ stdLowerBound: 435, stdUpperBound: 555 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001025' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 180,
              times: [{ stdLowerBound: 435, stdUpperBound: 555 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001025' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 495, aircraftRegisterId: '7092902880000001025' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155339',
        definition: { category: '', label: 'DXB1', stcId: '10', flightNumber: 'W5 0060', departureAirportId: '7092901520000005420', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 120,
          times: [{ stdLowerBound: 420, stdUpperBound: 540 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000348' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 120,
              times: [{ stdLowerBound: 420, stdUpperBound: 540 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000348' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 480, aircraftRegisterId: '7092902880000000348' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155401',
        definition: { category: '', label: 'MHD', stcId: '10', flightNumber: 'W5 1036', departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 85,
          times: [{ stdLowerBound: 1020, stdUpperBound: 1140 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000280' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 85,
              times: [{ stdLowerBound: 1020, stdUpperBound: 1140 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000280' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 1080, aircraftRegisterId: '7092902880000000280' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155386',
        definition: { category: '', label: 'THR', stcId: '10', flightNumber: 'W5 1037', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000002340' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 850, stdUpperBound: 970 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000280' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 850, stdUpperBound: 970 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000280' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 910, aircraftRegisterId: '7092902880000000280' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155333',
        definition: { category: '', label: 'KHK', stcId: '3', flightNumber: 'W5 4525', departureAirportId: '7092901520000000247', arrivalAirportId: '7092901520000001855' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 60,
          times: [{ stdLowerBound: 430, stdUpperBound: 550 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 60,
              times: [{ stdLowerBound: 430, stdUpperBound: 550 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 490, aircraftRegisterId: '7092902880000000310' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155318',
        definition: { category: '', label: 'SYZ', stcId: '10', flightNumber: 'W5 4563', departureAirportId: '7092901520000000247', arrivalAirportId: '7092901520000008084' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 60,
          times: [{ stdLowerBound: 330, stdUpperBound: 450 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 60,
              times: [{ stdLowerBound: 330, stdUpperBound: 450 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 390, aircraftRegisterId: '7092902880000000306' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155288',
        definition: { category: '', label: 'AWZ', stcId: '10', flightNumber: 'W5 4587', departureAirportId: '7092901520000000247', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 70,
          times: [{ stdLowerBound: 110, stdUpperBound: 230 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 70,
              times: [{ stdLowerBound: 110, stdUpperBound: 230 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 170, aircraftRegisterId: '7092902880000000304' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155317',
        definition: { category: '', label: 'KHK', stcId: '3', flightNumber: 'W5 4554', departureAirportId: '7092901520000001564', arrivalAirportId: '7092901520000001855' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 60,
          times: [{ stdLowerBound: 330, stdUpperBound: 450 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 60,
              times: [{ stdLowerBound: 330, stdUpperBound: 450 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 390, aircraftRegisterId: '7092902880000000910' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155279',
        definition: { category: '', label: 'IFN', stcId: '10', flightNumber: 'W5 4530', departureAirportId: '7092901520000001564', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 60,
          times: [{ stdLowerBound: 0, stdUpperBound: 120 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 60,
              times: [{ stdLowerBound: 0, stdUpperBound: 120 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 60, aircraftRegisterId: '7092902880000000310' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155367',
        definition: { category: '', label: 'KHD', stcId: '10', flightNumber: 'W5 1007', departureAirportId: '7092901520000001849', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 70,
          times: [{ stdLowerBound: 690, stdUpperBound: 810 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 70,
              times: [{ stdLowerBound: 690, stdUpperBound: 810 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 750, aircraftRegisterId: '7092902880000000304' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155319',
        definition: { category: '', label: 'AWZ', stcId: '3', flightNumber: 'W5 4524', departureAirportId: '7092901520000001855', arrivalAirportId: '7092901520000000247' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 60,
          times: [{ stdLowerBound: 335, stdUpperBound: 455 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 60,
              times: [{ stdLowerBound: 335, stdUpperBound: 455 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 395, aircraftRegisterId: '7092902880000000310' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155301',
        definition: { category: '', label: 'IFN', stcId: '3', flightNumber: 'W5 4555', departureAirportId: '7092901520000001855', arrivalAirportId: '7092901520000001564' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 70,
          times: [{ stdLowerBound: 210, stdUpperBound: 330 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 70,
              times: [{ stdLowerBound: 210, stdUpperBound: 330 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 270, aircraftRegisterId: '7092902880000000910' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155329',
        definition: { category: '', label: 'BUZ', stcId: '3', flightNumber: 'W5 4559', departureAirportId: '7092901520000001855', arrivalAirportId: '7092901520000004939' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 30,
          times: [{ stdLowerBound: 425, stdUpperBound: 545 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 30,
              times: [{ stdLowerBound: 425, stdUpperBound: 545 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 485, aircraftRegisterId: '7092902880000000910' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155342',
        definition: { category: '', label: 'SYZ', stcId: '3', flightNumber: 'W5 4557', departureAirportId: '7092901520000001855', arrivalAirportId: '7092901520000008084' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 50,
          times: [{ stdLowerBound: 525, stdUpperBound: 645 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 50,
              times: [{ stdLowerBound: 525, stdUpperBound: 645 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 585, aircraftRegisterId: '7092902880000000310' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155354',
        definition: { category: '', label: 'KHK', stcId: '3', flightNumber: 'W5 4551', departureAirportId: '7092901520000001855', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 105,
          times: [{ stdLowerBound: 555, stdUpperBound: 675 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 105,
              times: [{ stdLowerBound: 555, stdUpperBound: 675 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 615, aircraftRegisterId: '7092902880000000910' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155283',
        definition: { category: '', label: 'SYJ', stcId: '10', flightNumber: 'W5 1062', departureAirportId: '7092901520000003603', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 30, stdUpperBound: 150 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 30, stdUpperBound: 150 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 90, aircraftRegisterId: '7092902880000001208' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155337',
        definition: { category: '', label: 'KHK', stcId: '3', flightNumber: 'W5 4558', departureAirportId: '7092901520000004939', arrivalAirportId: '7092901520000001855' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 30,
          times: [{ stdLowerBound: 490, stdUpperBound: 610 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 30,
              times: [{ stdLowerBound: 490, stdUpperBound: 610 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 550, aircraftRegisterId: '7092902880000000910' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155361',
        definition: { category: '', label: 'KIH', stcId: '10', flightNumber: 'W5 4594', departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000006305' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 75,
          times: [{ stdLowerBound: 630, stdUpperBound: 750 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 75,
              times: [{ stdLowerBound: 630, stdUpperBound: 750 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 690, aircraftRegisterId: '7092902880000000306' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155284',
        definition: { category: '', label: 'SYZ', stcId: '10', flightNumber: 'W5 4562', departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000008084' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 65,
          times: [{ stdLowerBound: 90, stdUpperBound: 210 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 65,
              times: [{ stdLowerBound: 90, stdUpperBound: 210 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 150, aircraftRegisterId: '7092902880000000306' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155375',
        definition: { category: '', label: 'KIH', stcId: '10', flightNumber: 'W5 4595', departureAirportId: '7092901520000006305', arrivalAirportId: '7092901520000006282' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 75,
          times: [{ stdLowerBound: 765, stdUpperBound: 885 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 75,
              times: [{ stdLowerBound: 765, stdUpperBound: 885 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 825, aircraftRegisterId: '7092902880000000306' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155297',
        definition: { category: '', label: 'AWZ', stcId: '10', flightNumber: 'W5 4562', departureAirportId: '7092901520000008084', arrivalAirportId: '7092901520000000247' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 75,
          times: [{ stdLowerBound: 195, stdUpperBound: 315 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 75,
              times: [{ stdLowerBound: 195, stdUpperBound: 315 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 255, aircraftRegisterId: '7092902880000000306' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155304',
        definition: { category: '', label: 'KHK', stcId: '3', flightNumber: 'W5 4556', departureAirportId: '7092901520000008084', arrivalAirportId: '7092901520000001855' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 60,
          times: [{ stdLowerBound: 250, stdUpperBound: 370 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 60,
              times: [{ stdLowerBound: 250, stdUpperBound: 370 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 310, aircraftRegisterId: '7092902880000000310' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155334',
        definition: { category: '', label: 'SYZ', stcId: '10', flightNumber: 'W5 4563', departureAirportId: '7092901520000008084', arrivalAirportId: '7092901520000006282' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 60,
          times: [{ stdLowerBound: 435, stdUpperBound: 555 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 60,
              times: [{ stdLowerBound: 435, stdUpperBound: 555 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 495, aircraftRegisterId: '7092902880000000306' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155402',
        definition: { category: '', label: 'SYZ', stcId: '10', flightNumber: 'W5 1086', departureAirportId: '7092901520000008084', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 85,
          times: [{ stdLowerBound: 1020, stdUpperBound: 1140 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 85,
              times: [{ stdLowerBound: 1020, stdUpperBound: 1140 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 1080, aircraftRegisterId: '7092902880000000304' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155332',
        definition: { category: '', label: 'SYZ', stcId: '10', flightNumber: 'W5 1088', departureAirportId: '7092901520000008084', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 85,
          times: [{ stdLowerBound: 380, stdUpperBound: 500 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 85,
              times: [{ stdLowerBound: 380, stdUpperBound: 500 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 440, aircraftRegisterId: '7092902880000000304' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155360',
        definition: { category: '', label: 'SYZ', stcId: '10', flightNumber: 'W5 4588', departureAirportId: '7092901520000008084', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 80,
          times: [{ stdLowerBound: 620, stdUpperBound: 740 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 80,
              times: [{ stdLowerBound: 620, stdUpperBound: 740 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 680, aircraftRegisterId: '7092902880000000310' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155327',
        definition: { category: '', label: 'TCX', stcId: '10', flightNumber: 'W5 1028', departureAirportId: '7092901520000008147', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 345, stdUpperBound: 465 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 345, stdUpperBound: 465 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 405, aircraftRegisterId: '7092902880000001208' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155278',
        definition: { category: '', label: 'AWZ', stcId: '10', flightNumber: 'W5 4586', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000000247' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 70,
          times: [{ stdLowerBound: 0, stdUpperBound: 90 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 70,
              times: [{ stdLowerBound: 0, stdUpperBound: 90 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 30, aircraftRegisterId: '7092902880000000304' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155393',
        definition: { category: '', label: 'BXR', stcId: '10', flightNumber: 'W5 4577', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000000546' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 120,
          times: [{ stdLowerBound: 940, stdUpperBound: 1060 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 120,
              times: [{ stdLowerBound: 940, stdUpperBound: 1060 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 1000, aircraftRegisterId: '7092902880000000310' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155394',
        definition: { category: '', label: 'IFN', stcId: '10', flightNumber: 'W5 4531', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000001564' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 70,
          times: [{ stdLowerBound: 1000, stdUpperBound: 1120 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 70,
              times: [{ stdLowerBound: 1000, stdUpperBound: 1120 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 1060, aircraftRegisterId: '7092902880000001208' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155352',
        definition: { category: '', label: 'KHD', stcId: '10', flightNumber: 'W5 1008', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000001849' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 75,
          times: [{ stdLowerBound: 570, stdUpperBound: 690 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 75,
              times: [{ stdLowerBound: 570, stdUpperBound: 690 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 630, aircraftRegisterId: '7092902880000000304' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155287',
        definition: { category: '', label: 'KHK', stcId: '3', flightNumber: 'W5 4550', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000001855' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 75, stdUpperBound: 195 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 75, stdUpperBound: 195 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 135, aircraftRegisterId: '7092902880000000910' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155395',
        definition: { category: '', label: 'SYJ', stcId: '10', flightNumber: 'W5 1063', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000003603' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 975, stdUpperBound: 1095 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 975, stdUpperBound: 1095 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 1035, aircraftRegisterId: '7092902880000000910' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155388',
        definition: { category: '', label: 'SYZ', stcId: '10', flightNumber: 'W5 1087', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000008084' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 85,
          times: [{ stdLowerBound: 875, stdUpperBound: 995 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 85,
              times: [{ stdLowerBound: 875, stdUpperBound: 995 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 935, aircraftRegisterId: '7092902880000000304' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155307',
        definition: { category: '', label: 'SYZ', stcId: '10', flightNumber: 'W5 1089', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000008084' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 80,
          times: [{ stdLowerBound: 240, stdUpperBound: 360 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 80,
              times: [{ stdLowerBound: 240, stdUpperBound: 360 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 300, aircraftRegisterId: '7092902880000000304' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155291',
        definition: { category: '', label: 'SYZ', stcId: '10', flightNumber: 'W5 4589', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000008084' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 85,
          times: [{ stdLowerBound: 125, stdUpperBound: 245 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 85,
              times: [{ stdLowerBound: 125, stdUpperBound: 245 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 185, aircraftRegisterId: '7092902880000000310' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155303',
        definition: { category: '', label: 'TCX', stcId: '10', flightNumber: 'W5 1029', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000008147' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 210, stdUpperBound: 330 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 210, stdUpperBound: 330 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 270, aircraftRegisterId: '7092902880000001208' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155322',
        definition: { category: '', label: 'IST', stcId: '10', flightNumber: 'W5 0116', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000001628' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 195,
          times: [{ stdLowerBound: 210, stdUpperBound: 330 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000270' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 195,
              times: [{ stdLowerBound: 210, stdUpperBound: 330 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000270' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 270, aircraftRegisterId: '7092902880000000270' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155412',
        definition: { category: '', label: 'PVG', stcId: '10', flightNumber: 'W5 0077', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000003099' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 495,
          times: [{ stdLowerBound: 910, stdUpperBound: 1030 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001088' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 495,
              times: [{ stdLowerBound: 910, stdUpperBound: 1030 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001088' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 970, aircraftRegisterId: '7092902880000001088' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155325',
        definition: { category: '', label: 'BCN', stcId: '10', flightNumber: 'W5 0136', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000004755' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 345,
          times: [{ stdLowerBound: 70, stdUpperBound: 190 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000970' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 345,
              times: [{ stdLowerBound: 70, stdUpperBound: 190 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000970' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 130, aircraftRegisterId: '7092902880000000970' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155328',
        definition: { category: '', label: 'MXP', stcId: '10', flightNumber: 'W5 0110', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000006983' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 325,
          times: [{ stdLowerBound: 110, stdUpperBound: 230 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000998' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 325,
              times: [{ stdLowerBound: 110, stdUpperBound: 230 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000998' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 170, aircraftRegisterId: '7092902880000000998' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155404',
        definition: { category: '', label: 'LHE', stcId: '10', flightNumber: 'W5 1195', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000008952' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 200,
          times: [{ stdLowerBound: 930, stdUpperBound: 1050 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000270' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 200,
              times: [{ stdLowerBound: 930, stdUpperBound: 1050 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000270' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 990, aircraftRegisterId: '7092902880000000270' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155416',
        definition: { category: '', label: 'SZX', stcId: '10', flightNumber: 'W5 0087', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000010173' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 525,
          times: [{ stdLowerBound: 945, stdUpperBound: 1065 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001060' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 525,
              times: [{ stdLowerBound: 945, stdUpperBound: 1065 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001060' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 1005, aircraftRegisterId: '7092902880000001060' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155357',
        definition: { category: '', label: 'IST', stcId: '10', flightNumber: 'W5 0117', departureAirportId: '7092901520000001628', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 180,
          times: [{ stdLowerBound: 495, stdUpperBound: 615 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000270' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 180,
              times: [{ stdLowerBound: 495, stdUpperBound: 615 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000270' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 555, aircraftRegisterId: '7092902880000000270' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155374',
        definition: { category: '', label: 'BCN', stcId: '10', flightNumber: 'W5 0137', departureAirportId: '7092901520000004755', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 325,
          times: [{ stdLowerBound: 505, stdUpperBound: 625 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000970' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 325,
              times: [{ stdLowerBound: 505, stdUpperBound: 625 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000970' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 565, aircraftRegisterId: '7092902880000000970' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155372',
        definition: { category: '', label: 'MXP', stcId: '10', flightNumber: 'W5 0111', departureAirportId: '7092901520000006983', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 285,
          times: [{ stdLowerBound: 535, stdUpperBound: 655 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000998' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 285,
              times: [{ stdLowerBound: 535, stdUpperBound: 655 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000998' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 595, aircraftRegisterId: '7092902880000000998' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155414',
        definition: { category: '', label: 'LHE', stcId: '10', flightNumber: 'W5 1194', departureAirportId: '7092901520000008952', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 225,
          times: [{ stdLowerBound: 1200, stdUpperBound: 1320 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000270' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 225,
              times: [{ stdLowerBound: 1200, stdUpperBound: 1320 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000270' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 1,
            flight: { std: 1260, aircraftRegisterId: '7092902880000000270' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000158186',
        definition: { category: 'شمسا', label: 'NJF', stcId: '3', flightNumber: 'W5 5048', departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000002646' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 150,
          times: [{ stdLowerBound: 315, stdUpperBound: 435 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 150,
              times: [{ stdLowerBound: 315, stdUpperBound: 435 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 375, aircraftRegisterId: '7092902880000000560' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155418',
        definition: { category: '', label: 'KBL', stcId: '3', flightNumber: 'W5 1149', departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000006248' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 105,
          times: [{ stdLowerBound: 0, stdUpperBound: 60 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 105,
              times: [{ stdLowerBound: 0, stdUpperBound: 60 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 0, aircraftRegisterId: '7092902880000000560' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155500',
        definition: { category: '', label: 'KIH', stcId: '3', flightNumber: 'W5 1044', departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000006305' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 120,
          times: [{ stdLowerBound: 765, stdUpperBound: 885 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 120,
              times: [{ stdLowerBound: 765, stdUpperBound: 885 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 825, aircraftRegisterId: '7092902880000000560' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155445',
        definition: { category: '', label: 'MHD', stcId: '10', flightNumber: 'W5 1030', departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 85,
          times: [{ stdLowerBound: 240, stdUpperBound: 360 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 85,
              times: [{ stdLowerBound: 240, stdUpperBound: 360 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 300, aircraftRegisterId: '7092902880000000283' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155526',
        definition: { category: '', label: 'MHD', stcId: '10', flightNumber: 'W5 1036', departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 85,
          times: [{ stdLowerBound: 1020, stdUpperBound: 1140 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 85,
              times: [{ stdLowerBound: 1020, stdUpperBound: 1140 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 1080, aircraftRegisterId: '7092902880000000573' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000158190',
        definition: { category: 'شمسا', label: 'NJF', stcId: '3', flightNumber: 'W5 5047', departureAirportId: '7092901520000002646', arrivalAirportId: '7092901520000002340' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 140,
          times: [{ stdLowerBound: 540, stdUpperBound: 660 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 140,
              times: [{ stdLowerBound: 540, stdUpperBound: 660 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 600, aircraftRegisterId: '7092902880000000560' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155433',
        definition: { category: '', label: 'KBL', stcId: '3', flightNumber: 'W5 1148', departureAirportId: '7092901520000006248', arrivalAirportId: '7092901520000002340' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 105,
          times: [{ stdLowerBound: 120, stdUpperBound: 240 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 105,
              times: [{ stdLowerBound: 120, stdUpperBound: 240 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 180, aircraftRegisterId: '7092902880000000560' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155521',
        definition: { category: '', label: 'KIH', stcId: '3', flightNumber: 'W5 1045', departureAirportId: '7092901520000006305', arrivalAirportId: '7092901520000002340' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 120,
          times: [{ stdLowerBound: 960, stdUpperBound: 1080 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 120,
              times: [{ stdLowerBound: 960, stdUpperBound: 1080 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 1020, aircraftRegisterId: '7092902880000000560' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155523',
        definition: { category: '', label: 'KIH', stcId: '3', flightNumber: 'W5 1012', departureAirportId: '7092901520000006305', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 990, stdUpperBound: 1110 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 990, stdUpperBound: 1110 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 1050, aircraftRegisterId: '7092902880000000283' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155507',
        definition: { category: '', label: 'THR', stcId: '10', flightNumber: 'W5 1037', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000002340' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 850, stdUpperBound: 970 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 850, stdUpperBound: 970 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 910, aircraftRegisterId: '7092902880000000573' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155422',
        definition: { category: '', label: 'THR', stcId: '10', flightNumber: 'W5 1081', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000002340' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 20, stdUpperBound: 140 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 20, stdUpperBound: 140 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 80, aircraftRegisterId: '7092902880000000283' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155504',
        definition: { category: '', label: 'KIH', stcId: '3', flightNumber: 'W5 1013', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006305' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 110,
          times: [{ stdLowerBound: 805, stdUpperBound: 925 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 110,
              times: [{ stdLowerBound: 805, stdUpperBound: 925 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 865, aircraftRegisterId: '7092902880000000283' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155427',
        definition: { category: '', label: 'PGU', stcId: '3', flightNumber: 'W5 1016', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000009177' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 110,
          times: [{ stdLowerBound: 45, stdUpperBound: 165 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 110,
              times: [{ stdLowerBound: 45, stdUpperBound: 165 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 105, aircraftRegisterId: '7092902880000000573' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155471',
        definition: { category: '', label: 'PGU', stcId: '3', flightNumber: 'W5 1018', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000009177' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 105,
          times: [{ stdLowerBound: 465, stdUpperBound: 585 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 105,
              times: [{ stdLowerBound: 465, stdUpperBound: 585 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 525, aircraftRegisterId: '7092902880000000573' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155448',
        definition: { category: '', label: 'PGU', stcId: '3', flightNumber: 'W5 1017', departureAirportId: '7092901520000009177', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 225, stdUpperBound: 345 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 225, stdUpperBound: 345 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 285, aircraftRegisterId: '7092902880000000573' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155487',
        definition: { category: '', label: 'PGU', stcId: '3', flightNumber: 'W5 1019', departureAirportId: '7092901520000009177', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 640, stdUpperBound: 760 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 640, stdUpperBound: 760 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 700, aircraftRegisterId: '7092902880000000573' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000157130',
        definition: {
          category: 'مهدالبراق',
          label: 'BGW',
          stcId: '3',
          flightNumber: 'W5 5037',
          departureAirportId: '7092901520000000350',
          arrivalAirportId: '7092901520000001588'
        },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 555, stdUpperBound: 675 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000282' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 555, stdUpperBound: 675 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000282' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 615, aircraftRegisterId: '7092902880000000282' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155514',
        definition: {
          category: 'مهدالبراق',
          label: 'BGW',
          stcId: '13',
          flightNumber: 'W5 5083',
          departureAirportId: '7092901520000000350',
          arrivalAirportId: '7092901520000002340'
        },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 135,
          times: [{ stdLowerBound: 870, stdUpperBound: 990 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000291' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 135,
              times: [{ stdLowerBound: 870, stdUpperBound: 990 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000291' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 930, aircraftRegisterId: '7092902880000000291' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155536',
        definition: { category: '', label: 'BKK', stcId: '10', flightNumber: 'W5 0050', departureAirportId: '7092901520000000397', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 445,
          times: [{ stdLowerBound: 875, stdUpperBound: 995 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000298' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 445,
              times: [{ stdLowerBound: 875, stdUpperBound: 995 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000298' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 935, aircraftRegisterId: '7092902880000000298' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155451',
        definition: { category: '', label: 'BND', stcId: '10', flightNumber: 'W5 1094', departureAirportId: '7092901520000000426', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 105,
          times: [{ stdLowerBound: 240, stdUpperBound: 360 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000299' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 105,
              times: [{ stdLowerBound: 240, stdUpperBound: 360 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000299' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 300, aircraftRegisterId: '7092902880000000299' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155528',
        definition: { category: '', label: 'BND', stcId: '10', flightNumber: 'W5 4592', departureAirportId: '7092901520000000426', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 105,
          times: [{ stdLowerBound: 1000, stdUpperBound: 1120 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 105,
              times: [{ stdLowerBound: 1000, stdUpperBound: 1120 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 1060, aircraftRegisterId: '7092902880000000273' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155492',
        definition: {
          category: 'مهدالبراق',
          label: 'BGW',
          stcId: '13',
          flightNumber: 'W5 5092',
          departureAirportId: '7092901520000001588',
          arrivalAirportId: '7092901520000000350'
        },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 705, stdUpperBound: 825 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000291' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 705, stdUpperBound: 825 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000291' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 765, aircraftRegisterId: '7092902880000000291' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000157112',
        definition: { category: 'شمسا', label: 'NJF', stcId: '3', flightNumber: 'W5 5040', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000002646' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 30, stdUpperBound: 150 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000282' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 30, stdUpperBound: 150 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000282' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 90, aircraftRegisterId: '7092902880000000282' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155515',
        definition: { category: 'شمسا', label: 'NJF', stcId: '3', flightNumber: 'W5 5042', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000002646' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 930, stdUpperBound: 1050 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000292' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 930, stdUpperBound: 1050 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000292' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 990, aircraftRegisterId: '7092902880000000292' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155440',
        definition: { category: '', label: 'ALA', stcId: '10', flightNumber: 'W5 0073', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000004577' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 210,
          times: [{ stdLowerBound: 55, stdUpperBound: 175 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000292' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 210,
              times: [{ stdLowerBound: 55, stdUpperBound: 175 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000292' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 115, aircraftRegisterId: '7092902880000000292' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155441',
        definition: { category: '', label: 'DXB1', stcId: '10', flightNumber: 'W5 0061', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000005420' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 120,
          times: [{ stdLowerBound: 150, stdUpperBound: 270 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000291' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 120,
              times: [{ stdLowerBound: 150, stdUpperBound: 270 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000291' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 210, aircraftRegisterId: '7092902880000000291' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155499',
        definition: { category: '', label: 'DXB2', stcId: '10', flightNumber: 'W5 0065', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000005420' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 120,
          times: [{ stdLowerBound: 750, stdUpperBound: 870 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000282' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 120,
              times: [{ stdLowerBound: 750, stdUpperBound: 870 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000282' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 810, aircraftRegisterId: '7092902880000000282' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000164119',
        definition: { category: '', label: 'IKA', stcId: '10', flightNumber: 'W5 9020', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 30,
          times: [{ stdLowerBound: 30, stdUpperBound: 150 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001120' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 30,
              times: [{ stdLowerBound: 30, stdUpperBound: 150 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001120' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 90, aircraftRegisterId: '7092902880000001120' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155534',
        definition: { category: 'شمسا', label: 'NJF', stcId: '13', flightNumber: 'W5 5088', departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000002646' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 150,
          times: [{ stdLowerBound: 1080, stdUpperBound: 1200 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000291' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 150,
              times: [{ stdLowerBound: 1080, stdUpperBound: 1200 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000291' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 1140, aircraftRegisterId: '7092902880000000291' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155486',
        definition: { category: '', label: 'MHD', stcId: '10', flightNumber: 'W5 1034', departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 615, stdUpperBound: 735 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000299' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 615, stdUpperBound: 735 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000299' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 675, aircraftRegisterId: '7092902880000000299' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155532',
        definition: { category: 'شمسا', label: 'NJF', stcId: '3', flightNumber: 'W5 5041', departureAirportId: '7092901520000002646', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 1095, stdUpperBound: 1215 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000292' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 1095, stdUpperBound: 1215 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000292' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 1155, aircraftRegisterId: '7092902880000000292' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155539',
        definition: { category: 'شمسا', label: 'NJF', stcId: '13', flightNumber: 'W5 5095', departureAirportId: '7092901520000002646', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 1305, stdUpperBound: 1425 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000291' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 1305, stdUpperBound: 1425 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000291' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 1365, aircraftRegisterId: '7092902880000000291' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000157118',
        definition: { category: '', label: 'TBZ', stcId: '3', flightNumber: 'W5 5011', departureAirportId: '7092901520000002646', arrivalAirportId: '7092901520000008123' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 105,
          times: [{ stdLowerBound: 195, stdUpperBound: 315 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000282' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 105,
              times: [{ stdLowerBound: 195, stdUpperBound: 315 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000282' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 255, aircraftRegisterId: '7092902880000000282' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155524',
        definition: { category: '', label: 'ZAH', stcId: '10', flightNumber: 'W5 4540', departureAirportId: '7092901520000004442', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 110,
          times: [{ stdLowerBound: 990, stdUpperBound: 1110 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000299' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 110,
              times: [{ stdLowerBound: 990, stdUpperBound: 1110 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000299' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 1050, aircraftRegisterId: '7092902880000000299' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155470',
        definition: { category: '', label: 'ALA', stcId: '10', flightNumber: 'W5 0072', departureAirportId: '7092901520000004577', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 225,
          times: [{ stdLowerBound: 345, stdUpperBound: 465 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000292' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 225,
              times: [{ stdLowerBound: 345, stdUpperBound: 465 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000292' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 405, aircraftRegisterId: '7092902880000000292' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155468',
        definition: { category: '', label: 'DXB1', stcId: '10', flightNumber: 'W5 0060', departureAirportId: '7092901520000005420', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 120,
          times: [{ stdLowerBound: 420, stdUpperBound: 540 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000291' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 120,
              times: [{ stdLowerBound: 420, stdUpperBound: 540 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000291' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 480, aircraftRegisterId: '7092902880000000291' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155522',
        definition: { category: '', label: 'DXB2', stcId: '10', flightNumber: 'W5 0064', departureAirportId: '7092901520000005420', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 120,
          times: [{ stdLowerBound: 960, stdUpperBound: 1080 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000282' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 120,
              times: [{ stdLowerBound: 960, stdUpperBound: 1080 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000282' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 1020, aircraftRegisterId: '7092902880000000282' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155421',
        definition: { category: '', label: 'KER', stcId: '10', flightNumber: 'W5 1050', departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 0, stdUpperBound: 120 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 0, stdUpperBound: 120 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 60, aircraftRegisterId: '7092902880000000273' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155460',
        definition: { category: '', label: 'KER', stcId: '10', flightNumber: 'W5 1054', departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 320, stdUpperBound: 440 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001120' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 320, stdUpperBound: 440 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001120' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 380, aircraftRegisterId: '7092902880000001120' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155491',
        definition: { category: '', label: 'KIH', stcId: '3', flightNumber: 'W5 1042', departureAirportId: '7092901520000006305', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 95,
          times: [{ stdLowerBound: 695, stdUpperBound: 815 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 95,
              times: [{ stdLowerBound: 695, stdUpperBound: 815 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 755, aircraftRegisterId: '7092902880000000273' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000157124',
        definition: {
          category: 'مهدالبراق',
          label: 'BGW',
          stcId: '3',
          flightNumber: 'W5 5010',
          departureAirportId: '7092901520000008123',
          arrivalAirportId: '7092901520000000350'
        },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 105,
          times: [{ stdLowerBound: 375, stdUpperBound: 495 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000282' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 105,
              times: [{ stdLowerBound: 375, stdUpperBound: 495 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000282' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 435, aircraftRegisterId: '7092902880000000282' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155424',
        definition: { category: '', label: 'BND', stcId: '10', flightNumber: 'W5 1095', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000000426' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 105,
          times: [{ stdLowerBound: 15, stdUpperBound: 135 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000299' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 105,
              times: [{ stdLowerBound: 15, stdUpperBound: 135 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000299' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 75, aircraftRegisterId: '7092902880000000299' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155506',
        definition: { category: '', label: 'BND', stcId: '10', flightNumber: 'W5 4593', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000000426' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 830, stdUpperBound: 950 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 830, stdUpperBound: 950 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 890, aircraftRegisterId: '7092902880000000273' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000164130',
        definition: { category: '', label: 'THR', stcId: '10', flightNumber: 'W5 9021', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 30,
          times: [{ stdLowerBound: 480, stdUpperBound: 600 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001120' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 30,
              times: [{ stdLowerBound: 480, stdUpperBound: 600 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001120' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 540, aircraftRegisterId: '7092902880000001120' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155467',
        definition: { category: '', label: 'THR', stcId: '10', flightNumber: 'W5 1035', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000002340' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 450, stdUpperBound: 570 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000299' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 450, stdUpperBound: 570 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000299' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 510, aircraftRegisterId: '7092902880000000299' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155505',
        definition: { category: '', label: 'ZAH', stcId: '10', flightNumber: 'W5 4541', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000004442' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 110,
          times: [{ stdLowerBound: 810, stdUpperBound: 930 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000299' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 110,
              times: [{ stdLowerBound: 810, stdUpperBound: 930 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000299' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 870, aircraftRegisterId: '7092902880000000299' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155438',
        definition: { category: '', label: 'THR', stcId: '10', flightNumber: 'W5 1051', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006282' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 160, stdUpperBound: 280 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001120' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 160, stdUpperBound: 280 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001120' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 220, aircraftRegisterId: '7092902880000001120' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155533',
        definition: { category: '', label: 'THR', stcId: '10', flightNumber: 'W5 1053', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006282' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 1090, stdUpperBound: 1210 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000299' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 1090, stdUpperBound: 1210 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000299' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 1150, aircraftRegisterId: '7092902880000000299' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155478',
        definition: { category: '', label: 'KIH', stcId: '3', flightNumber: 'W5 1043', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006305' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 105,
          times: [{ stdLowerBound: 520, stdUpperBound: 640 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 105,
              times: [{ stdLowerBound: 520, stdUpperBound: 640 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 580, aircraftRegisterId: '7092902880000000273' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155538',
        definition: { category: '', label: 'PEK', stcId: '10', flightNumber: 'W5 0078', departureAirportId: '7092901520000002937', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 480,
          times: [{ stdLowerBound: 915, stdUpperBound: 1035 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000348' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 480,
              times: [{ stdLowerBound: 915, stdUpperBound: 1035 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000348' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 975, aircraftRegisterId: '7092902880000000348' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155537',
        definition: { category: '', label: 'KUL', stcId: '10', flightNumber: 'W5 0082', departureAirportId: '7092901520000006443', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 480,
          times: [{ stdLowerBound: 855, stdUpperBound: 975 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001025' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 480,
              times: [{ stdLowerBound: 855, stdUpperBound: 975 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001025' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 915, aircraftRegisterId: '7092902880000001025' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155516',
        definition: { category: '', label: 'KER', stcId: '10', flightNumber: 'W5 1052', departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 975, stdUpperBound: 1095 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000280' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 975, stdUpperBound: 1095 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000280' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 1035, aircraftRegisterId: '7092902880000000280' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155498',
        definition: { category: '', label: 'THR', stcId: '10', flightNumber: 'W5 1055', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006282' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 770, stdUpperBound: 890 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000280' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 770, stdUpperBound: 890 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000280' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 830, aircraftRegisterId: '7092902880000000280' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155525',
        definition: { category: '', label: 'AWZ', stcId: '10', flightNumber: 'W5 1061', departureAirportId: '7092901520000000247', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 70,
          times: [{ stdLowerBound: 1030, stdUpperBound: 1150 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 70,
              times: [{ stdLowerBound: 1030, stdUpperBound: 1150 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 1090, aircraftRegisterId: '7092902880000000304' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155431',
        definition: { category: '', label: 'AWZ', stcId: '10', flightNumber: 'W5 4587', departureAirportId: '7092901520000000247', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 70,
          times: [{ stdLowerBound: 110, stdUpperBound: 230 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 70,
              times: [{ stdLowerBound: 110, stdUpperBound: 230 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 170, aircraftRegisterId: '7092902880000000304' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155423',
        definition: { category: '', label: 'BXR', stcId: '10', flightNumber: 'W5 4576', departureAirportId: '7092901520000000546', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 120,
          times: [{ stdLowerBound: 0, stdUpperBound: 110 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 120,
              times: [{ stdLowerBound: 0, stdUpperBound: 110 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 50, aircraftRegisterId: '7092902880000000310' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000161167',
        definition: { category: '', label: 'DAM', stcId: '3', flightNumber: 'W5 0149', departureAirportId: '7092901520000000851', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 135,
          times: [{ stdLowerBound: 725, stdUpperBound: 845 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000275' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 135,
              times: [{ stdLowerBound: 725, stdUpperBound: 845 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000275' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 785, aircraftRegisterId: '7092902880000000275' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155473',
        definition: { category: '', label: 'IFN', stcId: '10', flightNumber: 'W5 4561', departureAirportId: '7092901520000001564', arrivalAirportId: '7092901520000006282' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 70,
          times: [{ stdLowerBound: 530, stdUpperBound: 650 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 70,
              times: [{ stdLowerBound: 530, stdUpperBound: 650 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 590, aircraftRegisterId: '7092902880000000306' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155447',
        definition: { category: '', label: 'TBZ', stcId: '10', flightNumber: 'W5 4560', departureAirportId: '7092901520000001564', arrivalAirportId: '7092901520000008123' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 220, stdUpperBound: 340 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 220, stdUpperBound: 340 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 280, aircraftRegisterId: '7092902880000000306' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155419',
        definition: { category: '', label: 'IFN', stcId: '10', flightNumber: 'W5 4530', departureAirportId: '7092901520000001564', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 60,
          times: [{ stdLowerBound: 0, stdUpperBound: 120 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 60,
              times: [{ stdLowerBound: 0, stdUpperBound: 120 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 60, aircraftRegisterId: '7092902880000001208' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155444',
        definition: { category: '', label: 'IFN', stcId: '10', flightNumber: 'W5 4532', departureAirportId: '7092901520000001564', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 60,
          times: [{ stdLowerBound: 240, stdUpperBound: 360 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 60,
              times: [{ stdLowerBound: 240, stdUpperBound: 360 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 300, aircraftRegisterId: '7092902880000001208' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155517',
        definition: { category: '', label: 'MHD', stcId: '10', flightNumber: 'W5 1058', departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000006282' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 960, stdUpperBound: 1080 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 960, stdUpperBound: 1080 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 1020, aircraftRegisterId: '7092902880000000306' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155425',
        definition: { category: '', label: 'SYJ', stcId: '10', flightNumber: 'W5 1062', departureAirportId: '7092901520000003603', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 30, stdUpperBound: 150 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 30, stdUpperBound: 150 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 90, aircraftRegisterId: '7092902880000000910' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155459',
        definition: { category: '', label: 'BJB', stcId: '10', flightNumber: 'W5 4568', departureAirportId: '7092901520000004847', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 75,
          times: [{ stdLowerBound: 335, stdUpperBound: 455 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 75,
              times: [{ stdLowerBound: 335, stdUpperBound: 455 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 395, aircraftRegisterId: '7092902880000000910' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155428',
        definition: { category: '', label: 'IFN', stcId: '10', flightNumber: 'W5 4560', departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000001564' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 70,
          times: [{ stdLowerBound: 90, stdUpperBound: 210 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 70,
              times: [{ stdLowerBound: 90, stdUpperBound: 210 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 150, aircraftRegisterId: '7092902880000000306' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155501',
        definition: { category: '', label: 'KER', stcId: '10', flightNumber: 'W5 1059', departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000002340' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 810, stdUpperBound: 930 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 810, stdUpperBound: 930 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 870, aircraftRegisterId: '7092902880000000306' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155527',
        definition: { category: '', label: 'SYZ', stcId: '10', flightNumber: 'W5 1086', departureAirportId: '7092901520000008084', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 85,
          times: [{ stdLowerBound: 1020, stdUpperBound: 1140 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 85,
              times: [{ stdLowerBound: 1020, stdUpperBound: 1140 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 1080, aircraftRegisterId: '7092902880000001208' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155462',
        definition: { category: '', label: 'SYZ', stcId: '10', flightNumber: 'W5 1088', departureAirportId: '7092901520000008084', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 85,
          times: [{ stdLowerBound: 380, stdUpperBound: 500 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 85,
              times: [{ stdLowerBound: 380, stdUpperBound: 500 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 440, aircraftRegisterId: '7092902880000000304' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155464',
        definition: { category: '', label: 'IFN', stcId: '10', flightNumber: 'W5 4561', departureAirportId: '7092901520000008123', arrivalAirportId: '7092901520000001564' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 380, stdUpperBound: 500 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 380, stdUpperBound: 500 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 440, aircraftRegisterId: '7092902880000000306' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155510',
        definition: { category: '', label: 'AWZ', stcId: '10', flightNumber: 'W5 1060', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000000247' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 70,
          times: [{ stdLowerBound: 890, stdUpperBound: 1010 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 70,
              times: [{ stdLowerBound: 890, stdUpperBound: 1010 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 950, aircraftRegisterId: '7092902880000000304' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155417',
        definition: { category: '', label: 'AWZ', stcId: '10', flightNumber: 'W5 4586', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000000247' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 70,
          times: [{ stdLowerBound: 0, stdUpperBound: 90 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 70,
              times: [{ stdLowerBound: 0, stdUpperBound: 90 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 30, aircraftRegisterId: '7092902880000000304' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000161166',
        definition: { category: '', label: 'DAM', stcId: '3', flightNumber: 'W5 0148', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000000851' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 150,
          times: [{ stdLowerBound: 135, stdUpperBound: 255 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000275' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 150,
              times: [{ stdLowerBound: 135, stdUpperBound: 255 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000275' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 195, aircraftRegisterId: '7092902880000000275' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155519',
        definition: { category: '', label: 'IFN', stcId: '10', flightNumber: 'W5 4531', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000001564' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 70,
          times: [{ stdLowerBound: 1035, stdUpperBound: 1155 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 70,
              times: [{ stdLowerBound: 1035, stdUpperBound: 1155 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 1095, aircraftRegisterId: '7092902880000000910' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155432',
        definition: { category: '', label: 'IFN', stcId: '10', flightNumber: 'W5 4533', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000001564' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 70,
          times: [{ stdLowerBound: 120, stdUpperBound: 240 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 70,
              times: [{ stdLowerBound: 120, stdUpperBound: 240 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 180, aircraftRegisterId: '7092902880000001208' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155520',
        definition: { category: '', label: 'SYJ', stcId: '10', flightNumber: 'W5 1063', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000003603' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 1000, stdUpperBound: 1120 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 1000, stdUpperBound: 1120 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 1060, aircraftRegisterId: '7092902880000000310' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155443',
        definition: { category: '', label: 'BJB', stcId: '10', flightNumber: 'W5 4569', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000004847' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 75,
          times: [{ stdLowerBound: 210, stdUpperBound: 330 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 75,
              times: [{ stdLowerBound: 210, stdUpperBound: 330 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 270, aircraftRegisterId: '7092902880000000910' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155511',
        definition: { category: '', label: 'SYZ', stcId: '10', flightNumber: 'W5 1087', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000008084' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 870, stdUpperBound: 990 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 870, stdUpperBound: 990 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 930, aircraftRegisterId: '7092902880000001208' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155446',
        definition: { category: '', label: 'SYZ', stcId: '10', flightNumber: 'W5 1089', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000008084' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 80,
          times: [{ stdLowerBound: 240, stdUpperBound: 360 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 80,
              times: [{ stdLowerBound: 240, stdUpperBound: 360 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 300, aircraftRegisterId: '7092902880000000304' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155494',
        definition: { category: '', label: 'XBJ', stcId: '10', flightNumber: 'W5 1049', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000008669' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 720, stdUpperBound: 840 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 720, stdUpperBound: 840 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 780, aircraftRegisterId: '7092902880000000910' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155465',
        definition: { category: '', label: 'YES', stcId: '10', flightNumber: 'W5 4522', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000009180' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 80,
          times: [{ stdLowerBound: 400, stdUpperBound: 520 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 80,
              times: [{ stdLowerBound: 400, stdUpperBound: 520 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 460, aircraftRegisterId: '7092902880000001208' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155469',
        definition: { category: '', label: 'IIL', stcId: '10', flightNumber: 'W5 4572', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000009181' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 80,
          times: [{ stdLowerBound: 460, stdUpperBound: 580 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 80,
              times: [{ stdLowerBound: 460, stdUpperBound: 580 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 520, aircraftRegisterId: '7092902880000000910' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155439',
        definition: { category: '', label: 'GCH', stcId: '10', flightNumber: 'W5 4520', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000009227' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 170, stdUpperBound: 290 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 170, stdUpperBound: 290 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 230, aircraftRegisterId: '7092902880000000310' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155495',
        definition: { category: '', label: 'AFZ', stcId: '10', flightNumber: 'W5 4537', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000009473' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 75,
          times: [{ stdLowerBound: 745, stdUpperBound: 865 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 75,
              times: [{ stdLowerBound: 745, stdUpperBound: 865 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 805, aircraftRegisterId: '7092902880000000310' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155512',
        definition: { category: '', label: 'XBJ', stcId: '10', flightNumber: 'W5 1048', departureAirportId: '7092901520000008669', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 870, stdUpperBound: 990 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 870, stdUpperBound: 990 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 930, aircraftRegisterId: '7092902880000000910' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155474',
        definition: { category: '', label: 'YES', stcId: '10', flightNumber: 'W5 4523', departureAirportId: '7092901520000009180', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 80,
          times: [{ stdLowerBound: 520, stdUpperBound: 640 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 80,
              times: [{ stdLowerBound: 520, stdUpperBound: 640 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 580, aircraftRegisterId: '7092902880000001208' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155482',
        definition: { category: '', label: 'IIL', stcId: '10', flightNumber: 'W5 4573', departureAirportId: '7092901520000009181', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 75,
          times: [{ stdLowerBound: 585, stdUpperBound: 705 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 75,
              times: [{ stdLowerBound: 585, stdUpperBound: 705 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 645, aircraftRegisterId: '7092902880000000910' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155455',
        definition: { category: '', label: 'GCH', stcId: '10', flightNumber: 'W5 4521', departureAirportId: '7092901520000009227', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 95,
          times: [{ stdLowerBound: 305, stdUpperBound: 425 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 95,
              times: [{ stdLowerBound: 305, stdUpperBound: 425 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 365, aircraftRegisterId: '7092902880000000310' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155508',
        definition: { category: '', label: 'AFZ', stcId: '10', flightNumber: 'W5 4536', departureAirportId: '7092901520000009473', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 75,
          times: [{ stdLowerBound: 865, stdUpperBound: 985 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 75,
              times: [{ stdLowerBound: 865, stdUpperBound: 985 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 925, aircraftRegisterId: '7092902880000000310' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155442',
        definition: { category: '', label: 'IST', stcId: '10', flightNumber: 'W5 0112', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000001628' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 195,
          times: [{ stdLowerBound: 80, stdUpperBound: 200 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000998' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 195,
              times: [{ stdLowerBound: 80, stdUpperBound: 200 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000998' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 140, aircraftRegisterId: '7092902880000000998' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155502',
        definition: { category: '', label: 'IST', stcId: '10', flightNumber: 'W5 0114', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000001628' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 195,
          times: [{ stdLowerBound: 705, stdUpperBound: 825 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000998' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 195,
              times: [{ stdLowerBound: 705, stdUpperBound: 825 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000998' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 765, aircraftRegisterId: '7092902880000000998' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155458',
        definition: { category: '', label: 'IST', stcId: '10', flightNumber: 'W5 0116', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000001628' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 195,
          times: [{ stdLowerBound: 210, stdUpperBound: 330 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000970' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 195,
              times: [{ stdLowerBound: 210, stdUpperBound: 330 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000970' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 270, aircraftRegisterId: '7092902880000000970' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155547',
        definition: { category: '', label: 'PVG', stcId: '10', flightNumber: 'W5 0077', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000003099' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 495,
          times: [{ stdLowerBound: 990, stdUpperBound: 1110 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000970' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 495,
              times: [{ stdLowerBound: 990, stdUpperBound: 1110 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000970' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 1050, aircraftRegisterId: '7092902880000000970' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155549',
        definition: { category: '', label: 'KUL', stcId: '10', flightNumber: 'W5 0083', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000006443' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 480,
          times: [{ stdLowerBound: 1020, stdUpperBound: 1140 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000270' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 480,
              times: [{ stdLowerBound: 1020, stdUpperBound: 1140 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000270' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 1080, aircraftRegisterId: '7092902880000000270' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155475',
        definition: { category: '', label: 'IST', stcId: '10', flightNumber: 'W5 0113', departureAirportId: '7092901520000001628', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 180,
          times: [{ stdLowerBound: 435, stdUpperBound: 555 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000998' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 180,
              times: [{ stdLowerBound: 435, stdUpperBound: 555 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000998' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 495, aircraftRegisterId: '7092902880000000998' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155531',
        definition: { category: '', label: 'IST', stcId: '10', flightNumber: 'W5 0115', departureAirportId: '7092901520000001628', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 180,
          times: [{ stdLowerBound: 990, stdUpperBound: 1110 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000998' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 180,
              times: [{ stdLowerBound: 990, stdUpperBound: 1110 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000998' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 1050, aircraftRegisterId: '7092902880000000998' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155484',
        definition: { category: '', label: 'IST', stcId: '10', flightNumber: 'W5 0117', departureAirportId: '7092901520000001628', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 180,
          times: [{ stdLowerBound: 495, stdUpperBound: 615 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000970' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 180,
              times: [{ stdLowerBound: 495, stdUpperBound: 615 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000970' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 555, aircraftRegisterId: '7092902880000000970' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155542',
        definition: { category: '', label: 'PVG', stcId: '10', flightNumber: 'W5 0076', departureAirportId: '7092901520000003099', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 570,
          times: [{ stdLowerBound: 840, stdUpperBound: 960 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001088' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 570,
              times: [{ stdLowerBound: 840, stdUpperBound: 960 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001088' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 900, aircraftRegisterId: '7092902880000001088' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155543',
        definition: { category: '', label: 'SZX', stcId: '10', flightNumber: 'W5 0086', departureAirportId: '7092901520000010173', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 570,
          times: [{ stdLowerBound: 850, stdUpperBound: 970 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001060' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 570,
              times: [{ stdLowerBound: 850, stdUpperBound: 970 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001060' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 2,
            flight: { std: 910, aircraftRegisterId: '7092902880000001060' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155648',
        definition: { category: 'شمسا', label: 'NJF', stcId: '13', flightNumber: 'W5 5086', departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000002646' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 150,
          times: [{ stdLowerBound: 765, stdUpperBound: 885 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 150,
              times: [{ stdLowerBound: 765, stdUpperBound: 885 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 825, aircraftRegisterId: '7092902880000000560' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155546',
        definition: { category: '', label: 'KBL', stcId: '3', flightNumber: 'W5 1149', departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000006248' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 105,
          times: [{ stdLowerBound: 0, stdUpperBound: 60 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 105,
              times: [{ stdLowerBound: 0, stdUpperBound: 60 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 0, aircraftRegisterId: '7092902880000000560' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155604',
        definition: { category: '', label: 'MHD', stcId: '10', flightNumber: 'W5 1058', departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000006282' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 85,
          times: [{ stdLowerBound: 465, stdUpperBound: 585 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 85,
              times: [{ stdLowerBound: 465, stdUpperBound: 585 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 525, aircraftRegisterId: '7092902880000000573' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155601',
        definition: { category: '', label: 'MHD', stcId: '10', flightNumber: 'W5 1090', departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 450, stdUpperBound: 570 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 450, stdUpperBound: 570 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 510, aircraftRegisterId: '7092902880000000560' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155669',
        definition: { category: 'شمسا', label: 'NJF', stcId: '13', flightNumber: 'W5 5085', departureAirportId: '7092901520000002646', arrivalAirportId: '7092901520000002340' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 135,
          times: [{ stdLowerBound: 990, stdUpperBound: 1110 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 135,
              times: [{ stdLowerBound: 990, stdUpperBound: 1110 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 1050, aircraftRegisterId: '7092902880000000560' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155563',
        definition: { category: '', label: 'KBL', stcId: '3', flightNumber: 'W5 1148', departureAirportId: '7092901520000006248', arrivalAirportId: '7092901520000002340' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 105,
          times: [{ stdLowerBound: 120, stdUpperBound: 240 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 105,
              times: [{ stdLowerBound: 120, stdUpperBound: 240 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 180, aircraftRegisterId: '7092902880000000560' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155587',
        definition: { category: '', label: 'KER', stcId: '10', flightNumber: 'W5 1059', departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000002340' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 85,
          times: [{ stdLowerBound: 320, stdUpperBound: 440 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 85,
              times: [{ stdLowerBound: 320, stdUpperBound: 440 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 380, aircraftRegisterId: '7092902880000000573' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155658',
        definition: { category: '', label: 'KER', stcId: '10', flightNumber: 'W5 1052', departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 930, stdUpperBound: 1050 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 930, stdUpperBound: 1050 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 990, aircraftRegisterId: '7092902880000000573' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155625',
        definition: { category: '', label: 'KER', stcId: '10', flightNumber: 'W5 1054', departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 610, stdUpperBound: 730 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 610, stdUpperBound: 730 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 670, aircraftRegisterId: '7092902880000000573' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155664',
        definition: { category: '', label: 'KIH', stcId: '3', flightNumber: 'W5 1012', departureAirportId: '7092901520000006305', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 105,
          times: [{ stdLowerBound: 990, stdUpperBound: 1110 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 105,
              times: [{ stdLowerBound: 990, stdUpperBound: 1110 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 1050, aircraftRegisterId: '7092902880000000283' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155622',
        definition: { category: '', label: 'THR', stcId: '10', flightNumber: 'W5 1091', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000002340' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 80,
          times: [{ stdLowerBound: 625, stdUpperBound: 745 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 80,
              times: [{ stdLowerBound: 625, stdUpperBound: 745 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 685, aircraftRegisterId: '7092902880000000560' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155565',
        definition: { category: '', label: 'THR', stcId: '10', flightNumber: 'W5 1051', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006282' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 160, stdUpperBound: 280 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 160, stdUpperBound: 280 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 220, aircraftRegisterId: '7092902880000000573' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155674',
        definition: { category: '', label: 'THR', stcId: '10', flightNumber: 'W5 1053', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006282' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 1090, stdUpperBound: 1210 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 1090, stdUpperBound: 1210 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 1150, aircraftRegisterId: '7092902880000000573' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155641',
        definition: { category: '', label: 'THR', stcId: '10', flightNumber: 'W5 1055', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006282' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 770, stdUpperBound: 890 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 770, stdUpperBound: 890 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 830, aircraftRegisterId: '7092902880000000573' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155647',
        definition: { category: '', label: 'KIH', stcId: '3', flightNumber: 'W5 1013', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006305' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 110,
          times: [{ stdLowerBound: 805, stdUpperBound: 925 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 110,
              times: [{ stdLowerBound: 805, stdUpperBound: 925 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 865, aircraftRegisterId: '7092902880000000283' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155556',
        definition: { category: '', label: 'PGU', stcId: '3', flightNumber: 'W5 1016', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000009177' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 110,
          times: [{ stdLowerBound: 45, stdUpperBound: 165 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 110,
              times: [{ stdLowerBound: 45, stdUpperBound: 165 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 105, aircraftRegisterId: '7092902880000000283' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155607',
        definition: { category: '', label: 'PGU', stcId: '3', flightNumber: 'W5 1018', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000009177' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 105,
          times: [{ stdLowerBound: 465, stdUpperBound: 585 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 105,
              times: [{ stdLowerBound: 465, stdUpperBound: 585 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 525, aircraftRegisterId: '7092902880000000283' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155578',
        definition: { category: '', label: 'PGU', stcId: '3', flightNumber: 'W5 1017', departureAirportId: '7092901520000009177', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 225, stdUpperBound: 345 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 225, stdUpperBound: 345 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 285, aircraftRegisterId: '7092902880000000283' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155626',
        definition: { category: '', label: 'PGU', stcId: '3', flightNumber: 'W5 1019', departureAirportId: '7092901520000009177', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 640, stdUpperBound: 760 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 640, stdUpperBound: 760 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 700, aircraftRegisterId: '7092902880000000283' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000157154',
        definition: {
          category: 'مهدالبراق',
          label: 'BGW',
          stcId: '3',
          flightNumber: 'W5 5037',
          departureAirportId: '7092901520000000350',
          arrivalAirportId: '7092901520000001588'
        },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 555, stdUpperBound: 675 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000292' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 555, stdUpperBound: 675 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000292' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 615, aircraftRegisterId: '7092902880000000292' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000157180',
        definition: {
          category: 'مهدالبراق',
          label: 'BGW',
          stcId: '13',
          flightNumber: 'W5 5099',
          departureAirportId: '7092901520000000350',
          arrivalAirportId: '7092901520000001588'
        },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 1350, stdUpperBound: 1440 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000298' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 1350, stdUpperBound: 1440 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000298' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 1410, aircraftRegisterId: '7092902880000000298' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000157168',
        definition: {
          category: 'مهدالبراق',
          label: 'BGW',
          stcId: '13',
          flightNumber: 'W5 5083',
          departureAirportId: '7092901520000000350',
          arrivalAirportId: '7092901520000002340'
        },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 135,
          times: [{ stdLowerBound: 915, stdUpperBound: 1035 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000298' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 135,
              times: [{ stdLowerBound: 915, stdUpperBound: 1035 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000298' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 975, aircraftRegisterId: '7092902880000000298' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155665',
        definition: { category: '', label: 'BND', stcId: '10', flightNumber: 'W5 4592', departureAirportId: '7092901520000000426', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 105,
          times: [{ stdLowerBound: 1000, stdUpperBound: 1120 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000265' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 105,
              times: [{ stdLowerBound: 1000, stdUpperBound: 1120 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000265' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 1060, aircraftRegisterId: '7092902880000000265' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000157162',
        definition: {
          category: 'مهدالبراق',
          label: 'BGW',
          stcId: '13',
          flightNumber: 'W5 5092',
          departureAirportId: '7092901520000001588',
          arrivalAirportId: '7092901520000000350'
        },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 750, stdUpperBound: 870 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000298' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 750, stdUpperBound: 870 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000298' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 810, aircraftRegisterId: '7092902880000000298' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000157136',
        definition: { category: 'شمسا', label: 'NJF', stcId: '3', flightNumber: 'W5 5040', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000002646' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 30, stdUpperBound: 150 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000292' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 30, stdUpperBound: 150 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000292' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 90, aircraftRegisterId: '7092902880000000292' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155657',
        definition: { category: 'شمسا', label: 'NJF', stcId: '3', flightNumber: 'W5 5042', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000002646' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 930, stdUpperBound: 1050 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000292' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 930, stdUpperBound: 1050 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000292' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 990, aircraftRegisterId: '7092902880000000292' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155598',
        definition: { category: 'شمسا', label: 'NJF', stcId: '10', flightNumber: 'W5 5062', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000002646' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 420, stdUpperBound: 540 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000298' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 420, stdUpperBound: 540 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000298' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 480, aircraftRegisterId: '7092902880000000298' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155581',
        definition: { category: '', label: 'VKO', stcId: '10', flightNumber: 'W5 0084', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000004007' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 225,
          times: [{ stdLowerBound: 120, stdUpperBound: 240 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000291' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 225,
              times: [{ stdLowerBound: 120, stdUpperBound: 240 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000291' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 180, aircraftRegisterId: '7092902880000000291' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155566',
        definition: { category: '', label: 'BEY', stcId: '3', flightNumber: 'W5 1152', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000004781' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 140,
          times: [{ stdLowerBound: 120, stdUpperBound: 240 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000282' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 140,
              times: [{ stdLowerBound: 120, stdUpperBound: 240 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000282' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 180, aircraftRegisterId: '7092902880000000282' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155643',
        definition: { category: '', label: 'DXB2', stcId: '10', flightNumber: 'W5 0065', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000005420' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 120,
          times: [{ stdLowerBound: 750, stdUpperBound: 870 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000291' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 120,
              times: [{ stdLowerBound: 750, stdUpperBound: 870 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000291' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 810, aircraftRegisterId: '7092902880000000291' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155560',
        definition: { category: '', label: 'EBL', stcId: '10', flightNumber: 'W5 5060', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000009171' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 90, stdUpperBound: 210 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000298' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 90, stdUpperBound: 210 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000298' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 150, aircraftRegisterId: '7092902880000000298' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000157174',
        definition: {
          category: 'مهدالبراق',
          label: 'BGW',
          stcId: '13',
          flightNumber: 'W5 5084',
          departureAirportId: '7092901520000002340',
          arrivalAirportId: '7092901520000000350'
        },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 150,
          times: [{ stdLowerBound: 1125, stdUpperBound: 1245 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000298' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'STB2',
              originPermission: true,
              destinationPermission: true,
              blockTime: 150,
              times: [{ stdLowerBound: 1125, stdUpperBound: 1245 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000298' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 1185, aircraftRegisterId: '7092902880000000298' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155637',
        definition: { category: '', label: 'BEY', stcId: '3', flightNumber: 'W5 1156', departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000004781' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 200,
          times: [{ stdLowerBound: 620, stdUpperBound: 740 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000282' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 200,
              times: [{ stdLowerBound: 620, stdUpperBound: 740 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000282' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 680, aircraftRegisterId: '7092902880000000282' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155667',
        definition: { category: '', label: 'MHD', stcId: '10', flightNumber: 'W5 1036', departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 85,
          times: [{ stdLowerBound: 1020, stdUpperBound: 1140 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 85,
              times: [{ stdLowerBound: 1020, stdUpperBound: 1140 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 1080, aircraftRegisterId: '7092902880000000273' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155630',
        definition: { category: '', label: 'MHD', stcId: '10', flightNumber: 'W5 1080', departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 85,
          times: [{ stdLowerBound: 680, stdUpperBound: 800 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000265' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 85,
              times: [{ stdLowerBound: 680, stdUpperBound: 800 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000265' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 740, aircraftRegisterId: '7092902880000000265' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155582',
        definition: { category: '', label: 'LHE', stcId: '10', flightNumber: 'W5 5111', departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008952' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 180,
          times: [{ stdLowerBound: 180, stdUpperBound: 300 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000265' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 180,
              times: [{ stdLowerBound: 180, stdUpperBound: 300 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000265' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 240, aircraftRegisterId: '7092902880000000265' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155673',
        definition: { category: 'شمسا', label: 'NJF', stcId: '3', flightNumber: 'W5 5041', departureAirportId: '7092901520000002646', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 1095, stdUpperBound: 1215 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000292' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 1095, stdUpperBound: 1215 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000292' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 1155, aircraftRegisterId: '7092902880000000292' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155619',
        definition: { category: 'شمسا', label: 'NJF', stcId: '10', flightNumber: 'W5 5061', departureAirportId: '7092901520000002646', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 585, stdUpperBound: 705 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000298' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 585, stdUpperBound: 705 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000298' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 645, aircraftRegisterId: '7092902880000000298' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000158178',
        definition: { category: '', label: 'SYZ', stcId: '3', flightNumber: 'W5 5006', departureAirportId: '7092901520000002646', arrivalAirportId: '7092901520000008084' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 105,
          times: [{ stdLowerBound: 195, stdUpperBound: 315 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000292' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 105,
              times: [{ stdLowerBound: 195, stdUpperBound: 315 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000292' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 255, aircraftRegisterId: '7092902880000000292' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155614',
        definition: { category: '', label: 'VKO', stcId: '10', flightNumber: 'W5 0085', departureAirportId: '7092901520000004007', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 210,
          times: [{ stdLowerBound: 420, stdUpperBound: 540 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000291' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 210,
              times: [{ stdLowerBound: 420, stdUpperBound: 540 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000291' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 480, aircraftRegisterId: '7092902880000000291' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155659',
        definition: { category: '', label: 'BEY', stcId: '3', flightNumber: 'W5 1153', departureAirportId: '7092901520000004781', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 130,
          times: [{ stdLowerBound: 910, stdUpperBound: 1030 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000282' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 130,
              times: [{ stdLowerBound: 910, stdUpperBound: 1030 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000282' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 970, aircraftRegisterId: '7092902880000000282' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155599',
        definition: { category: '', label: 'BEY', stcId: '3', flightNumber: 'W5 1157', departureAirportId: '7092901520000004781', arrivalAirportId: '7092901520000002340' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 180,
          times: [{ stdLowerBound: 350, stdUpperBound: 470 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000282' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 180,
              times: [{ stdLowerBound: 350, stdUpperBound: 470 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000282' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 410, aircraftRegisterId: '7092902880000000282' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155662',
        definition: { category: '', label: 'DXB2', stcId: '10', flightNumber: 'W5 0064', departureAirportId: '7092901520000005420', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 120,
          times: [{ stdLowerBound: 960, stdUpperBound: 1080 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000291' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 120,
              times: [{ stdLowerBound: 960, stdUpperBound: 1080 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000291' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 1020, aircraftRegisterId: '7092902880000000291' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155550',
        definition: { category: '', label: 'KER', stcId: '10', flightNumber: 'W5 1050', departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 0, stdUpperBound: 120 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000299' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 0, stdUpperBound: 120 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000299' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 60, aircraftRegisterId: '7092902880000000299' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155632',
        definition: { category: '', label: 'KIH', stcId: '3', flightNumber: 'W5 1042', departureAirportId: '7092901520000006305', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 95,
          times: [{ stdLowerBound: 695, stdUpperBound: 815 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 95,
              times: [{ stdLowerBound: 695, stdUpperBound: 815 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 755, aircraftRegisterId: '7092902880000000273' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000158182',
        definition: {
          category: 'مهدالبراق',
          label: 'BGW',
          stcId: '3',
          flightNumber: 'W5 5007',
          departureAirportId: '7092901520000008084',
          arrivalAirportId: '7092901520000000350'
        },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 115,
          times: [{ stdLowerBound: 370, stdUpperBound: 490 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000292' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 115,
              times: [{ stdLowerBound: 370, stdUpperBound: 490 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000292' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 430, aircraftRegisterId: '7092902880000000292' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155650',
        definition: { category: '', label: 'BND', stcId: '10', flightNumber: 'W5 4593', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000000426' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 830, stdUpperBound: 950 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000265' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 830, stdUpperBound: 950 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000265' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 890, aircraftRegisterId: '7092902880000000265' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155652',
        definition: { category: '', label: 'THR', stcId: '10', flightNumber: 'W5 1037', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000002340' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 860, stdUpperBound: 980 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 860, stdUpperBound: 980 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 920, aircraftRegisterId: '7092902880000000273' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155551',
        definition: { category: '', label: 'THR', stcId: '10', flightNumber: 'W5 1081', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000002340' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 20, stdUpperBound: 140 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000265' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 20, stdUpperBound: 140 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000265' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 80, aircraftRegisterId: '7092902880000000265' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155611',
        definition: { category: '', label: 'KIH', stcId: '3', flightNumber: 'W5 1043', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006305' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 105,
          times: [{ stdLowerBound: 520, stdUpperBound: 640 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 105,
              times: [{ stdLowerBound: 520, stdUpperBound: 640 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 580, aircraftRegisterId: '7092902880000000273' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155610',
        definition: { category: '', label: 'LHE', stcId: '10', flightNumber: 'W5 5110', departureAirportId: '7092901520000008952', arrivalAirportId: '7092901520000002340' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 190,
          times: [{ stdLowerBound: 430, stdUpperBound: 550 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000265' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 190,
              times: [{ stdLowerBound: 430, stdUpperBound: 550 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000265' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 490, aircraftRegisterId: '7092902880000000265' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155580',
        definition: { category: '', label: 'EBL', stcId: '10', flightNumber: 'W5 5059', departureAirportId: '7092901520000009171', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 255, stdUpperBound: 375 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000298' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 255, stdUpperBound: 375 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000298' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 315, aircraftRegisterId: '7092902880000000298' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155606',
        definition: { category: '', label: 'ESB', stcId: '10', flightNumber: 'W5 0119', departureAirportId: '7092901520000001070', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 140,
          times: [{ stdLowerBound: 420, stdUpperBound: 540 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000348' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 140,
              times: [{ stdLowerBound: 420, stdUpperBound: 540 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000348' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 480, aircraftRegisterId: '7092902880000000348' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155576',
        definition: { category: '', label: 'ESB', stcId: '10', flightNumber: 'W5 0118', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000001070' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 165,
          times: [{ stdLowerBound: 150, stdUpperBound: 270 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000348' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 165,
              times: [{ stdLowerBound: 150, stdUpperBound: 270 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000348' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 210, aircraftRegisterId: '7092902880000000348' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155570',
        definition: { category: '', label: 'IST', stcId: '10', flightNumber: 'W5 0112', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000001628' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 195,
          times: [{ stdLowerBound: 80, stdUpperBound: 200 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001025' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 195,
              times: [{ stdLowerBound: 80, stdUpperBound: 200 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001025' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 140, aircraftRegisterId: '7092902880000001025' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155675',
        definition: { category: '', label: 'PEK', stcId: '10', flightNumber: 'W5 0079', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000002937' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 390,
          times: [{ stdLowerBound: 915, stdUpperBound: 1035 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001025' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 390,
              times: [{ stdLowerBound: 915, stdUpperBound: 1035 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001025' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 975, aircraftRegisterId: '7092902880000001025' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155671',
        definition: { category: '', label: 'DEL', stcId: '10', flightNumber: 'W5 0071', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000005317' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 290,
          times: [{ stdLowerBound: 850, stdUpperBound: 970 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000348' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 290,
              times: [{ stdLowerBound: 850, stdUpperBound: 970 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000348' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 910, aircraftRegisterId: '7092902880000000348' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155569',
        definition: { category: '', label: 'DXB1', stcId: '10', flightNumber: 'W5 0061', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000005420' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 120,
          times: [{ stdLowerBound: 150, stdUpperBound: 270 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000268' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 120,
              times: [{ stdLowerBound: 150, stdUpperBound: 270 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000268' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 210, aircraftRegisterId: '7092902880000000268' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155609',
        definition: { category: '', label: 'IST', stcId: '10', flightNumber: 'W5 0113', departureAirportId: '7092901520000001628', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 180,
          times: [{ stdLowerBound: 435, stdUpperBound: 555 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001025' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 180,
              times: [{ stdLowerBound: 435, stdUpperBound: 555 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001025' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 495, aircraftRegisterId: '7092902880000001025' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155681',
        definition: { category: '', label: 'DEL', stcId: '10', flightNumber: 'W5 0070', departureAirportId: '7092901520000005317', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 320,
          times: [{ stdLowerBound: 1230, stdUpperBound: 1350 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000348' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 320,
              times: [{ stdLowerBound: 1230, stdUpperBound: 1350 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000348' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 1290, aircraftRegisterId: '7092902880000000348' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155602',
        definition: { category: '', label: 'DXB1', stcId: '10', flightNumber: 'W5 0060', departureAirportId: '7092901520000005420', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 120,
          times: [{ stdLowerBound: 420, stdUpperBound: 540 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000268' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 120,
              times: [{ stdLowerBound: 420, stdUpperBound: 540 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000268' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 480, aircraftRegisterId: '7092902880000000268' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155579',
        definition: { category: '', label: 'BND', stcId: '10', flightNumber: 'W5 1094', departureAirportId: '7092901520000000426', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 105,
          times: [{ stdLowerBound: 240, stdUpperBound: 360 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000280' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 105,
              times: [{ stdLowerBound: 240, stdUpperBound: 360 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000280' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 300, aircraftRegisterId: '7092902880000000280' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155552',
        definition: { category: '', label: 'BND', stcId: '10', flightNumber: 'W5 1095', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000000426' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 105,
          times: [{ stdLowerBound: 15, stdUpperBound: 135 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000280' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 105,
              times: [{ stdLowerBound: 15, stdUpperBound: 135 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000280' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 75, aircraftRegisterId: '7092902880000000280' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155585',
        definition: { category: '', label: 'SYZ', stcId: '10', flightNumber: 'W5 4563', departureAirportId: '7092901520000000247', arrivalAirportId: '7092901520000008084' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 60,
          times: [{ stdLowerBound: 330, stdUpperBound: 450 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 60,
              times: [{ stdLowerBound: 330, stdUpperBound: 450 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 390, aircraftRegisterId: '7092902880000000306' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155548',
        definition: { category: '', label: 'IFN', stcId: '10', flightNumber: 'W5 4530', departureAirportId: '7092901520000001564', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 60,
          times: [{ stdLowerBound: 0, stdUpperBound: 120 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 60,
              times: [{ stdLowerBound: 0, stdUpperBound: 120 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 60, aircraftRegisterId: '7092902880000000910' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155574',
        definition: { category: '', label: 'IFN', stcId: '10', flightNumber: 'W5 4532', departureAirportId: '7092901520000001564', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 60,
          times: [{ stdLowerBound: 240, stdUpperBound: 360 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 60,
              times: [{ stdLowerBound: 240, stdUpperBound: 360 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 300, aircraftRegisterId: '7092902880000000304' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155629',
        definition: { category: '', label: 'KHD', stcId: '10', flightNumber: 'W5 1007', departureAirportId: '7092901520000001849', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 70,
          times: [{ stdLowerBound: 690, stdUpperBound: 810 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 70,
              times: [{ stdLowerBound: 690, stdUpperBound: 810 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 750, aircraftRegisterId: '7092902880000000310' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155553',
        definition: { category: '', label: 'SYJ', stcId: '10', flightNumber: 'W5 1062', departureAirportId: '7092901520000003603', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 30, stdUpperBound: 150 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 30, stdUpperBound: 150 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 90, aircraftRegisterId: '7092902880000000310' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155654',
        definition: { category: '', label: 'SYJ', stcId: '10', flightNumber: 'W5 1072', departureAirportId: '7092901520000003603', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 870, stdUpperBound: 990 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 870, stdUpperBound: 990 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 930, aircraftRegisterId: '7092902880000000910' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155575',
        definition: { category: '', label: 'CQD', stcId: '10', flightNumber: 'W5 4581', departureAirportId: '7092901520000005186', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 75,
          times: [{ stdLowerBound: 240, stdUpperBound: 360 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 75,
              times: [{ stdLowerBound: 240, stdUpperBound: 360 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 300, aircraftRegisterId: '7092902880000000910' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155621',
        definition: { category: '', label: 'KIH', stcId: '10', flightNumber: 'W5 4594', departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000006305' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 75,
          times: [{ stdLowerBound: 630, stdUpperBound: 750 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 75,
              times: [{ stdLowerBound: 630, stdUpperBound: 750 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 690, aircraftRegisterId: '7092902880000000306' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155555',
        definition: { category: '', label: 'SYZ', stcId: '10', flightNumber: 'W5 4562', departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000008084' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 65,
          times: [{ stdLowerBound: 90, stdUpperBound: 210 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 65,
              times: [{ stdLowerBound: 90, stdUpperBound: 210 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 150, aircraftRegisterId: '7092902880000000306' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155639',
        definition: { category: '', label: 'KIH', stcId: '10', flightNumber: 'W5 4595', departureAirportId: '7092901520000006305', arrivalAirportId: '7092901520000006282' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 75,
          times: [{ stdLowerBound: 765, stdUpperBound: 885 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 75,
              times: [{ stdLowerBound: 765, stdUpperBound: 885 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 825, aircraftRegisterId: '7092902880000000306' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155567',
        definition: { category: '', label: 'AWZ', stcId: '10', flightNumber: 'W5 4562', departureAirportId: '7092901520000008084', arrivalAirportId: '7092901520000000247' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 75,
          times: [{ stdLowerBound: 195, stdUpperBound: 315 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 75,
              times: [{ stdLowerBound: 195, stdUpperBound: 315 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 255, aircraftRegisterId: '7092902880000000306' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155596',
        definition: { category: '', label: 'SYZ', stcId: '10', flightNumber: 'W5 4563', departureAirportId: '7092901520000008084', arrivalAirportId: '7092901520000006282' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 60,
          times: [{ stdLowerBound: 435, stdUpperBound: 555 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 60,
              times: [{ stdLowerBound: 435, stdUpperBound: 555 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 495, aircraftRegisterId: '7092902880000000306' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155668',
        definition: { category: '', label: 'SYZ', stcId: '10', flightNumber: 'W5 1086', departureAirportId: '7092901520000008084', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 85,
          times: [{ stdLowerBound: 1020, stdUpperBound: 1140 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 85,
              times: [{ stdLowerBound: 1020, stdUpperBound: 1140 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 1080, aircraftRegisterId: '7092902880000000310' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155594',
        definition: { category: '', label: 'SYZ', stcId: '10', flightNumber: 'W5 1088', departureAirportId: '7092901520000008084', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 85,
          times: [{ stdLowerBound: 380, stdUpperBound: 500 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 85,
              times: [{ stdLowerBound: 380, stdUpperBound: 500 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 440, aircraftRegisterId: '7092902880000000310' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155591',
        definition: { category: '', label: 'TCX', stcId: '10', flightNumber: 'W5 1028', departureAirportId: '7092901520000008147', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 525, stdUpperBound: 645 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 525, stdUpperBound: 645 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 585, aircraftRegisterId: '7092902880000000304' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155660',
        definition: { category: '', label: 'BXR', stcId: '10', flightNumber: 'W5 4577', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000000546' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 120,
          times: [{ stdLowerBound: 940, stdUpperBound: 1060 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 120,
              times: [{ stdLowerBound: 940, stdUpperBound: 1060 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 1000, aircraftRegisterId: '7092902880000001208' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155661',
        definition: { category: '', label: 'IFN', stcId: '10', flightNumber: 'W5 4531', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000001564' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 70,
          times: [{ stdLowerBound: 1000, stdUpperBound: 1120 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 70,
              times: [{ stdLowerBound: 1000, stdUpperBound: 1120 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 1060, aircraftRegisterId: '7092902880000000304' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155561',
        definition: { category: '', label: 'IFN', stcId: '10', flightNumber: 'W5 4533', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000001564' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 65,
          times: [{ stdLowerBound: 125, stdUpperBound: 245 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 65,
              times: [{ stdLowerBound: 125, stdUpperBound: 245 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 185, aircraftRegisterId: '7092902880000000304' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155615',
        definition: { category: '', label: 'KHD', stcId: '10', flightNumber: 'W5 1008', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000001849' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 75,
          times: [{ stdLowerBound: 570, stdUpperBound: 690 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 75,
              times: [{ stdLowerBound: 570, stdUpperBound: 690 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 630, aircraftRegisterId: '7092902880000000310' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155635',
        definition: { category: '', label: 'SYJ', stcId: '10', flightNumber: 'W5 1073', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000003603' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 95,
          times: [{ stdLowerBound: 725, stdUpperBound: 845 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 95,
              times: [{ stdLowerBound: 725, stdUpperBound: 845 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 785, aircraftRegisterId: '7092902880000000910' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155562',
        definition: { category: '', label: 'CQD', stcId: '10', flightNumber: 'W5 4580', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000005186' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 75,
          times: [{ stdLowerBound: 120, stdUpperBound: 240 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 75,
              times: [{ stdLowerBound: 120, stdUpperBound: 240 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 180, aircraftRegisterId: '7092902880000000910' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155653',
        definition: { category: '', label: 'SYZ', stcId: '10', flightNumber: 'W5 1087', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000008084' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 870, stdUpperBound: 990 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 870, stdUpperBound: 990 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 930, aircraftRegisterId: '7092902880000000310' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155577',
        definition: { category: '', label: 'SYZ', stcId: '10', flightNumber: 'W5 1089', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000008084' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 80,
          times: [{ stdLowerBound: 240, stdUpperBound: 360 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 80,
              times: [{ stdLowerBound: 240, stdUpperBound: 360 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 300, aircraftRegisterId: '7092902880000000310' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155573',
        definition: { category: '', label: 'TCX', stcId: '10', flightNumber: 'W5 1029', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000008147' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 390, stdUpperBound: 510 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 390, stdUpperBound: 510 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 450, aircraftRegisterId: '7092902880000000304' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155603',
        definition: { category: '', label: 'IIL', stcId: '10', flightNumber: 'W5 4572', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000009181' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 80,
          times: [{ stdLowerBound: 460, stdUpperBound: 580 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 80,
              times: [{ stdLowerBound: 460, stdUpperBound: 580 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 520, aircraftRegisterId: '7092902880000000910' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155634',
        definition: { category: '', label: 'AFZ', stcId: '10', flightNumber: 'W5 4537', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000009473' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 75,
          times: [{ stdLowerBound: 735, stdUpperBound: 855 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 75,
              times: [{ stdLowerBound: 735, stdUpperBound: 855 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 795, aircraftRegisterId: '7092902880000000304' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000164117',
        definition: { category: '', label: 'LFM', stcId: '3', flightNumber: 'W5 4597', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000010170' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 105,
          times: [{ stdLowerBound: 90, stdUpperBound: 210 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 105,
              times: [{ stdLowerBound: 90, stdUpperBound: 210 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 150, aircraftRegisterId: '7092902880000001208' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155618',
        definition: { category: '', label: 'IIL', stcId: '10', flightNumber: 'W5 4573', departureAirportId: '7092901520000009181', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 75,
          times: [{ stdLowerBound: 585, stdUpperBound: 705 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 75,
              times: [{ stdLowerBound: 585, stdUpperBound: 705 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 645, aircraftRegisterId: '7092902880000000910' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155651',
        definition: { category: '', label: 'AFZ', stcId: '10', flightNumber: 'W5 4536', departureAirportId: '7092901520000009473', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 75,
          times: [{ stdLowerBound: 855, stdUpperBound: 975 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 75,
              times: [{ stdLowerBound: 855, stdUpperBound: 975 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 915, aircraftRegisterId: '7092902880000000304' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000161151',
        definition: { category: '', label: 'JAR', stcId: '3', flightNumber: 'W5 4598', departureAirportId: '7092901520000009682', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 720, stdUpperBound: 840 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 720, stdUpperBound: 840 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 780, aircraftRegisterId: '7092902880000001208' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000164118',
        definition: { category: '', label: 'JAR', stcId: '3', flightNumber: 'W5 4583', departureAirportId: '7092901520000010170', arrivalAirportId: '7092901520000009682' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 35,
          times: [{ stdLowerBound: 435, stdUpperBound: 555 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 35,
              times: [{ stdLowerBound: 435, stdUpperBound: 555 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 495, aircraftRegisterId: '7092902880000001208' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155631',
        definition: { category: '', label: 'FCO', stcId: '10', flightNumber: 'W5 0141', departureAirportId: '7092901520000001126', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 270,
          times: [{ stdLowerBound: 510, stdUpperBound: 630 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000998' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 270,
              times: [{ stdLowerBound: 510, stdUpperBound: 630 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000998' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 570, aircraftRegisterId: '7092902880000000998' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155589',
        definition: { category: '', label: 'FCO', stcId: '10', flightNumber: 'W5 0140', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000001126' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 300,
          times: [{ stdLowerBound: 105, stdUpperBound: 225 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000998' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 300,
              times: [{ stdLowerBound: 105, stdUpperBound: 225 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000998' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 165, aircraftRegisterId: '7092902880000000998' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155645',
        definition: { category: '', label: 'IST', stcId: '10', flightNumber: 'W5 0114', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000001628' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 195,
          times: [{ stdLowerBound: 705, stdUpperBound: 825 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001088' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 195,
              times: [{ stdLowerBound: 705, stdUpperBound: 825 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001088' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 765, aircraftRegisterId: '7092902880000001088' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155590',
        definition: { category: '', label: 'IST', stcId: '10', flightNumber: 'W5 0116', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000001628' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 195,
          times: [{ stdLowerBound: 210, stdUpperBound: 330 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001060' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 195,
              times: [{ stdLowerBound: 210, stdUpperBound: 330 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001060' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 270, aircraftRegisterId: '7092902880000001060' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155678',
        definition: { category: '', label: 'PVG', stcId: '10', flightNumber: 'W5 0077', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000003099' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 490,
          times: [{ stdLowerBound: 910, stdUpperBound: 1030 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001060' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 490,
              times: [{ stdLowerBound: 910, stdUpperBound: 1030 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001060' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 970, aircraftRegisterId: '7092902880000001060' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155680',
        definition: { category: '', label: 'CAN', stcId: '10', flightNumber: 'W5 0081', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000005013' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 470,
          times: [{ stdLowerBound: 960, stdUpperBound: 1080 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000998' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 470,
              times: [{ stdLowerBound: 960, stdUpperBound: 1080 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000998' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 1020, aircraftRegisterId: '7092902880000000998' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155672',
        definition: { category: '', label: 'IST', stcId: '10', flightNumber: 'W5 0115', departureAirportId: '7092901520000001628', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 180,
          times: [{ stdLowerBound: 990, stdUpperBound: 1110 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001088' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 180,
              times: [{ stdLowerBound: 990, stdUpperBound: 1110 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001088' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 1050, aircraftRegisterId: '7092902880000001088' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155620',
        definition: { category: '', label: 'IST', stcId: '10', flightNumber: 'W5 0117', departureAirportId: '7092901520000001628', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 180,
          times: [{ stdLowerBound: 495, stdUpperBound: 615 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001060' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 180,
              times: [{ stdLowerBound: 495, stdUpperBound: 615 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001060' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 555, aircraftRegisterId: '7092902880000001060' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155679',
        definition: { category: '', label: 'PVG', stcId: '10', flightNumber: 'W5 0076', departureAirportId: '7092901520000003099', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 570,
          times: [{ stdLowerBound: 840, stdUpperBound: 960 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000970' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 570,
              times: [{ stdLowerBound: 840, stdUpperBound: 960 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000970' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 900, aircraftRegisterId: '7092902880000000970' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155677',
        definition: { category: '', label: 'KUL', stcId: '10', flightNumber: 'W5 0082', departureAirportId: '7092901520000006443', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 480,
          times: [{ stdLowerBound: 855, stdUpperBound: 975 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000270' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 480,
              times: [{ stdLowerBound: 855, stdUpperBound: 975 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000270' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 3,
            flight: { std: 915, aircraftRegisterId: '7092902880000000270' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155804',
        definition: {
          category: 'مهدالبراق',
          label: 'BGW',
          stcId: '13',
          flightNumber: 'W5 5081',
          departureAirportId: '7092901520000000350',
          arrivalAirportId: '7092901520000002340'
        },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 140,
          times: [{ stdLowerBound: 1195, stdUpperBound: 1315 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 140,
              times: [{ stdLowerBound: 1195, stdUpperBound: 1315 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 1255, aircraftRegisterId: '7092902880000000560' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155798',
        definition: {
          category: 'مهدالبراق',
          label: 'BGW',
          stcId: '13',
          flightNumber: 'W5 5082',
          departureAirportId: '7092901520000002340',
          arrivalAirportId: '7092901520000000350'
        },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 150,
          times: [{ stdLowerBound: 975, stdUpperBound: 1095 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'STB2',
              originPermission: true,
              destinationPermission: true,
              blockTime: 150,
              times: [{ stdLowerBound: 975, stdUpperBound: 1095 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 1035, aircraftRegisterId: '7092902880000000560' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155709',
        definition: { category: 'شمسا', label: 'NJF', stcId: '13', flightNumber: 'W5 5088', departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000002646' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 150,
          times: [{ stdLowerBound: 150, stdUpperBound: 270 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 150,
              times: [{ stdLowerBound: 150, stdUpperBound: 270 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 210, aircraftRegisterId: '7092902880000000560' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155754',
        definition: { category: '', label: 'KIH', stcId: '3', flightNumber: 'W5 1044', departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000006305' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 120,
          times: [{ stdLowerBound: 585, stdUpperBound: 705 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 120,
              times: [{ stdLowerBound: 585, stdUpperBound: 705 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 645, aircraftRegisterId: '7092902880000000560' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155707',
        definition: { category: '', label: 'MHD', stcId: '10', flightNumber: 'W5 1030', departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 210, stdUpperBound: 330 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 210, stdUpperBound: 330 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 270, aircraftRegisterId: '7092902880000000283' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155733',
        definition: { category: 'شمسا', label: 'NJF', stcId: '13', flightNumber: 'W5 5087', departureAirportId: '7092901520000002646', arrivalAirportId: '7092901520000002340' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 135,
          times: [{ stdLowerBound: 375, stdUpperBound: 495 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 135,
              times: [{ stdLowerBound: 375, stdUpperBound: 495 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 435, aircraftRegisterId: '7092902880000000560' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155685',
        definition: { category: '', label: 'KER', stcId: '10', flightNumber: 'W5 1050', departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 0, stdUpperBound: 120 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 0, stdUpperBound: 120 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 60, aircraftRegisterId: '7092902880000000573' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155786',
        definition: { category: '', label: 'KER', stcId: '10', flightNumber: 'W5 1052', departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 930, stdUpperBound: 1050 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 930, stdUpperBound: 1050 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 990, aircraftRegisterId: '7092902880000000573' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155727',
        definition: { category: '', label: 'KER', stcId: '10', flightNumber: 'W5 1054', departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 320, stdUpperBound: 440 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 320, stdUpperBound: 440 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 380, aircraftRegisterId: '7092902880000000573' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155773',
        definition: { category: '', label: 'KIH', stcId: '3', flightNumber: 'W5 1045', departureAirportId: '7092901520000006305', arrivalAirportId: '7092901520000002340' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 120,
          times: [{ stdLowerBound: 780, stdUpperBound: 900 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 120,
              times: [{ stdLowerBound: 780, stdUpperBound: 900 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 840, aircraftRegisterId: '7092902880000000560' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155792',
        definition: { category: '', label: 'KIH', stcId: '3', flightNumber: 'W5 1012', departureAirportId: '7092901520000006305', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 105,
          times: [{ stdLowerBound: 990, stdUpperBound: 1110 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 105,
              times: [{ stdLowerBound: 990, stdUpperBound: 1110 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 1050, aircraftRegisterId: '7092902880000000283' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155686',
        definition: { category: '', label: 'THR', stcId: '10', flightNumber: 'W5 1081', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000002340' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 20, stdUpperBound: 140 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 20, stdUpperBound: 140 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 80, aircraftRegisterId: '7092902880000000283' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155702',
        definition: { category: '', label: 'THR', stcId: '10', flightNumber: 'W5 1051', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006282' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 160, stdUpperBound: 280 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 160, stdUpperBound: 280 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 220, aircraftRegisterId: '7092902880000000573' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155802',
        definition: { category: '', label: 'THR', stcId: '10', flightNumber: 'W5 1053', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006282' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 1090, stdUpperBound: 1210 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 1090, stdUpperBound: 1210 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 1150, aircraftRegisterId: '7092902880000000573' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155769',
        definition: { category: '', label: 'THR', stcId: '10', flightNumber: 'W5 1055', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006282' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 770, stdUpperBound: 890 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 770, stdUpperBound: 890 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 830, aircraftRegisterId: '7092902880000000573' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155777',
        definition: { category: '', label: 'KIH', stcId: '3', flightNumber: 'W5 1013', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006305' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 110,
          times: [{ stdLowerBound: 805, stdUpperBound: 925 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 110,
              times: [{ stdLowerBound: 805, stdUpperBound: 925 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 865, aircraftRegisterId: '7092902880000000283' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155741',
        definition: { category: '', label: 'PGU', stcId: '3', flightNumber: 'W5 1018', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000009177' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 105,
          times: [{ stdLowerBound: 465, stdUpperBound: 585 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 105,
              times: [{ stdLowerBound: 465, stdUpperBound: 585 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 525, aircraftRegisterId: '7092902880000000283' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155758',
        definition: { category: '', label: 'PGU', stcId: '3', flightNumber: 'W5 1019', departureAirportId: '7092901520000009177', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 640, stdUpperBound: 760 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 640, stdUpperBound: 760 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 700, aircraftRegisterId: '7092902880000000283' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155715',
        definition: { category: '', label: 'BND', stcId: '10', flightNumber: 'W5 1094', departureAirportId: '7092901520000000426', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 105,
          times: [{ stdLowerBound: 240, stdUpperBound: 360 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000265' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 105,
              times: [{ stdLowerBound: 240, stdUpperBound: 360 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000265' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 300, aircraftRegisterId: '7092902880000000265' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155796',
        definition: { category: '', label: 'BND', stcId: '10', flightNumber: 'W5 4592', departureAirportId: '7092901520000000426', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 105,
          times: [{ stdLowerBound: 1000, stdUpperBound: 1120 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 105,
              times: [{ stdLowerBound: 1000, stdUpperBound: 1120 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 1060, aircraftRegisterId: '7092902880000000273' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155807',
        definition: { category: '', label: 'BKK', stcId: '10', flightNumber: 'W5 0051', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000000397' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 405,
          times: [{ stdLowerBound: 1000, stdUpperBound: 1120 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000292' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 405,
              times: [{ stdLowerBound: 1000, stdUpperBound: 1120 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000292' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 1060, aircraftRegisterId: '7092902880000000292' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155775',
        definition: { category: '', label: 'IST', stcId: '10', flightNumber: 'W5 0114', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000001628' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 195,
          times: [{ stdLowerBound: 705, stdUpperBound: 825 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000282' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 195,
              times: [{ stdLowerBound: 705, stdUpperBound: 825 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000282' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 765, aircraftRegisterId: '7092902880000000282' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155774',
        definition: { category: 'شمسا', label: 'NJF', stcId: '3', flightNumber: 'W5 5042', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000002646' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 810, stdUpperBound: 930 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000298' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 810, stdUpperBound: 930 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000298' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 870, aircraftRegisterId: '7092902880000000298' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155734',
        definition: { category: 'شمسا', label: 'NJF', stcId: '10', flightNumber: 'W5 5062', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000002646' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 420, stdUpperBound: 540 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000298' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 420, stdUpperBound: 540 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000298' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 480, aircraftRegisterId: '7092902880000000298' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155716',
        definition: { category: '', label: 'VKO', stcId: '10', flightNumber: 'W5 0084', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000004007' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 225,
          times: [{ stdLowerBound: 120, stdUpperBound: 240 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000291' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 225,
              times: [{ stdLowerBound: 120, stdUpperBound: 240 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000291' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 180, aircraftRegisterId: '7092902880000000291' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155704',
        definition: { category: '', label: 'DXB1', stcId: '10', flightNumber: 'W5 0061', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000005420' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 120,
          times: [{ stdLowerBound: 150, stdUpperBound: 270 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000282' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 120,
              times: [{ stdLowerBound: 150, stdUpperBound: 270 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000282' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 210, aircraftRegisterId: '7092902880000000282' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155770',
        definition: { category: '', label: 'DXB2', stcId: '10', flightNumber: 'W5 0065', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000005420' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 120,
          times: [{ stdLowerBound: 750, stdUpperBound: 870 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000291' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 120,
              times: [{ stdLowerBound: 750, stdUpperBound: 870 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000291' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 810, aircraftRegisterId: '7092902880000000291' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155698',
        definition: { category: '', label: 'EVN', stcId: '10', flightNumber: 'W5 1150', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000005545' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 150, stdUpperBound: 270 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000292' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 150, stdUpperBound: 270 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000292' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 210, aircraftRegisterId: '7092902880000000292' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155740',
        definition: { category: '', label: 'ISU', stcId: '10', flightNumber: 'W5 5058', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000009175' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 480, stdUpperBound: 600 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000292' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 480, stdUpperBound: 600 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000292' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 540, aircraftRegisterId: '7092902880000000292' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155801',
        definition: { category: '', label: 'IST', stcId: '10', flightNumber: 'W5 0115', departureAirportId: '7092901520000001628', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 180,
          times: [{ stdLowerBound: 990, stdUpperBound: 1110 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000282' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 180,
              times: [{ stdLowerBound: 990, stdUpperBound: 1110 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000282' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 1050, aircraftRegisterId: '7092902880000000282' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155755',
        definition: { category: '', label: 'MHD', stcId: '10', flightNumber: 'W5 1034', departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 615, stdUpperBound: 735 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 615, stdUpperBound: 735 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 675, aircraftRegisterId: '7092902880000000273' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155788',
        definition: { category: 'شمسا', label: 'NJF', stcId: '3', flightNumber: 'W5 5041', departureAirportId: '7092901520000002646', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 975, stdUpperBound: 1095 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000298' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 975, stdUpperBound: 1095 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000298' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 1035, aircraftRegisterId: '7092902880000000298' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155752',
        definition: { category: 'شمسا', label: 'NJF', stcId: '10', flightNumber: 'W5 5061', departureAirportId: '7092901520000002646', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 585, stdUpperBound: 705 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000298' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 585, stdUpperBound: 705 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000298' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 645, aircraftRegisterId: '7092902880000000298' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155749',
        definition: { category: '', label: 'VKO', stcId: '10', flightNumber: 'W5 0085', departureAirportId: '7092901520000004007', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 210,
          times: [{ stdLowerBound: 420, stdUpperBound: 540 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000291' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 210,
              times: [{ stdLowerBound: 420, stdUpperBound: 540 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000291' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 480, aircraftRegisterId: '7092902880000000291' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155736',
        definition: { category: '', label: 'DXB1', stcId: '10', flightNumber: 'W5 0060', departureAirportId: '7092901520000005420', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 120,
          times: [{ stdLowerBound: 420, stdUpperBound: 540 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000282' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 120,
              times: [{ stdLowerBound: 420, stdUpperBound: 540 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000282' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 480, aircraftRegisterId: '7092902880000000282' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155790',
        definition: { category: '', label: 'DXB2', stcId: '10', flightNumber: 'W5 0064', departureAirportId: '7092901520000005420', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 120,
          times: [{ stdLowerBound: 960, stdUpperBound: 1080 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000291' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 120,
              times: [{ stdLowerBound: 960, stdUpperBound: 1080 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000291' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 1020, aircraftRegisterId: '7092902880000000291' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155722',
        definition: { category: '', label: 'EVN', stcId: '10', flightNumber: 'W5 1151', departureAirportId: '7092901520000005545', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 315, stdUpperBound: 435 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000292' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 315, stdUpperBound: 435 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000292' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 375, aircraftRegisterId: '7092902880000000292' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155762',
        definition: { category: '', label: 'KIH', stcId: '3', flightNumber: 'W5 1042', departureAirportId: '7092901520000006305', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 95,
          times: [{ stdLowerBound: 695, stdUpperBound: 815 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000265' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 95,
              times: [{ stdLowerBound: 695, stdUpperBound: 815 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000265' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 755, aircraftRegisterId: '7092902880000000265' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155688',
        definition: { category: '', label: 'BND', stcId: '10', flightNumber: 'W5 1095', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000000426' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 105,
          times: [{ stdLowerBound: 15, stdUpperBound: 135 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000265' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 105,
              times: [{ stdLowerBound: 15, stdUpperBound: 135 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000265' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 75, aircraftRegisterId: '7092902880000000265' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155779',
        definition: { category: '', label: 'BND', stcId: '10', flightNumber: 'W5 4593', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000000426' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 830, stdUpperBound: 950 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 830, stdUpperBound: 950 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 890, aircraftRegisterId: '7092902880000000273' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155735',
        definition: { category: '', label: 'THR', stcId: '10', flightNumber: 'W5 1035', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000002340' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 450, stdUpperBound: 570 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 450, stdUpperBound: 570 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 510, aircraftRegisterId: '7092902880000000273' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155746',
        definition: { category: '', label: 'KIH', stcId: '3', flightNumber: 'W5 1043', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006305' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 105,
          times: [{ stdLowerBound: 520, stdUpperBound: 640 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000265' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 105,
              times: [{ stdLowerBound: 520, stdUpperBound: 640 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000265' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 580, aircraftRegisterId: '7092902880000000265' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155690',
        definition: { category: '', label: 'PGU', stcId: '3', flightNumber: 'W5 1016', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000009177' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 110,
          times: [{ stdLowerBound: 45, stdUpperBound: 165 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 110,
              times: [{ stdLowerBound: 45, stdUpperBound: 165 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 105, aircraftRegisterId: '7092902880000000273' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155757',
        definition: { category: '', label: 'ISU', stcId: '10', flightNumber: 'W5 5057', departureAirportId: '7092901520000009175', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 75,
          times: [{ stdLowerBound: 645, stdUpperBound: 765 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000292' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 75,
              times: [{ stdLowerBound: 645, stdUpperBound: 765 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000292' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 705, aircraftRegisterId: '7092902880000000292' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155713',
        definition: { category: '', label: 'PGU', stcId: '3', flightNumber: 'W5 1017', departureAirportId: '7092901520000009177', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 225, stdUpperBound: 345 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 225, stdUpperBound: 345 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 285, aircraftRegisterId: '7092902880000000273' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155705',
        definition: { category: '', label: 'IST', stcId: '10', flightNumber: 'W5 0112', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000001628' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 195,
          times: [{ stdLowerBound: 80, stdUpperBound: 200 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000268' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 195,
              times: [{ stdLowerBound: 80, stdUpperBound: 200 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000268' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 140, aircraftRegisterId: '7092902880000000268' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155724',
        definition: { category: '', label: 'IST', stcId: '10', flightNumber: 'W5 0116', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000001628' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 195,
          times: [{ stdLowerBound: 210, stdUpperBound: 330 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000348' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 195,
              times: [{ stdLowerBound: 210, stdUpperBound: 330 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000348' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 270, aircraftRegisterId: '7092902880000000348' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155815',
        definition: { category: '', label: 'KUL', stcId: '10', flightNumber: 'W5 0083', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000006443' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 480,
          times: [{ stdLowerBound: 1020, stdUpperBound: 1140 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000268' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 480,
              times: [{ stdLowerBound: 1020, stdUpperBound: 1140 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000268' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 1080, aircraftRegisterId: '7092902880000000268' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155799',
        definition: { category: '', label: 'LHE', stcId: '10', flightNumber: 'W5 1195', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000008952' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 200,
          times: [{ stdLowerBound: 930, stdUpperBound: 1050 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000348' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 200,
              times: [{ stdLowerBound: 930, stdUpperBound: 1050 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000348' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 990, aircraftRegisterId: '7092902880000000348' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155743',
        definition: { category: '', label: 'IST', stcId: '10', flightNumber: 'W5 0113', departureAirportId: '7092901520000001628', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 180,
          times: [{ stdLowerBound: 435, stdUpperBound: 555 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000268' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 180,
              times: [{ stdLowerBound: 435, stdUpperBound: 555 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000268' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 495, aircraftRegisterId: '7092902880000000268' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155753',
        definition: { category: '', label: 'IST', stcId: '10', flightNumber: 'W5 0117', departureAirportId: '7092901520000001628', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 180,
          times: [{ stdLowerBound: 495, stdUpperBound: 615 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000348' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 180,
              times: [{ stdLowerBound: 495, stdUpperBound: 615 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000348' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 555, aircraftRegisterId: '7092902880000000348' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155803',
        definition: { category: '', label: 'PEK', stcId: '10', flightNumber: 'W5 0078', departureAirportId: '7092901520000002937', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 485,
          times: [{ stdLowerBound: 815, stdUpperBound: 935 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001025' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 485,
              times: [{ stdLowerBound: 815, stdUpperBound: 935 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001025' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 875, aircraftRegisterId: '7092902880000001025' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155809',
        definition: { category: '', label: 'LHE', stcId: '10', flightNumber: 'W5 1194', departureAirportId: '7092901520000008952', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 225,
          times: [{ stdLowerBound: 1200, stdUpperBound: 1320 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000348' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 225,
              times: [{ stdLowerBound: 1200, stdUpperBound: 1320 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000348' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 1260, aircraftRegisterId: '7092902880000000348' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155794',
        definition: { category: '', label: 'MHD', stcId: '10', flightNumber: 'W5 1036', departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 85,
          times: [{ stdLowerBound: 1020, stdUpperBound: 1140 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000280' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 85,
              times: [{ stdLowerBound: 1020, stdUpperBound: 1140 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000280' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 1080, aircraftRegisterId: '7092902880000000280' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155780',
        definition: { category: '', label: 'THR', stcId: '10', flightNumber: 'W5 1037', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000002340' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 850, stdUpperBound: 970 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000280' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 850, stdUpperBound: 970 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000280' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 910, aircraftRegisterId: '7092902880000000280' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155725',
        definition: { category: '', label: 'KHK', stcId: '3', flightNumber: 'W5 4525', departureAirportId: '7092901520000000247', arrivalAirportId: '7092901520000001855' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 60,
          times: [{ stdLowerBound: 355, stdUpperBound: 475 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 60,
              times: [{ stdLowerBound: 355, stdUpperBound: 475 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 415, aircraftRegisterId: '7092902880000000304' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155793',
        definition: { category: '', label: 'AWZ', stcId: '10', flightNumber: 'W5 1061', departureAirportId: '7092901520000000247', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 70,
          times: [{ stdLowerBound: 1030, stdUpperBound: 1150 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 70,
              times: [{ stdLowerBound: 1030, stdUpperBound: 1150 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 1090, aircraftRegisterId: '7092902880000000310' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155694',
        definition: { category: '', label: 'AWZ', stcId: '10', flightNumber: 'W5 4587', departureAirportId: '7092901520000000247', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 70,
          times: [{ stdLowerBound: 110, stdUpperBound: 230 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 70,
              times: [{ stdLowerBound: 110, stdUpperBound: 230 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 170, aircraftRegisterId: '7092902880000000310' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155687',
        definition: { category: '', label: 'BXR', stcId: '10', flightNumber: 'W5 4576', departureAirportId: '7092901520000000546', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 120,
          times: [{ stdLowerBound: 0, stdUpperBound: 110 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 120,
              times: [{ stdLowerBound: 0, stdUpperBound: 110 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 50, aircraftRegisterId: '7092902880000001208' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155742',
        definition: { category: '', label: 'IFN', stcId: '10', flightNumber: 'W5 4561', departureAirportId: '7092901520000001564', arrivalAirportId: '7092901520000006282' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 70,
          times: [{ stdLowerBound: 530, stdUpperBound: 650 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 70,
              times: [{ stdLowerBound: 530, stdUpperBound: 650 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 590, aircraftRegisterId: '7092902880000000306' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155712',
        definition: { category: '', label: 'TBZ', stcId: '10', flightNumber: 'W5 4560', departureAirportId: '7092901520000001564', arrivalAirportId: '7092901520000008123' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 220, stdUpperBound: 340 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 220, stdUpperBound: 340 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 280, aircraftRegisterId: '7092902880000000306' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155683',
        definition: { category: '', label: 'IFN', stcId: '10', flightNumber: 'W5 4530', departureAirportId: '7092901520000001564', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 60,
          times: [{ stdLowerBound: 0, stdUpperBound: 120 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 60,
              times: [{ stdLowerBound: 0, stdUpperBound: 120 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 60, aircraftRegisterId: '7092902880000000304' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155726',
        definition: { category: '', label: 'IFN', stcId: '10', flightNumber: 'W5 4538', departureAirportId: '7092901520000001564', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 75,
          times: [{ stdLowerBound: 345, stdUpperBound: 465 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 75,
              times: [{ stdLowerBound: 345, stdUpperBound: 465 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 405, aircraftRegisterId: '7092902880000001208' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155760',
        definition: { category: '', label: 'KHD', stcId: '10', flightNumber: 'W5 1007', departureAirportId: '7092901520000001849', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 60,
          times: [{ stdLowerBound: 690, stdUpperBound: 810 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 60,
              times: [{ stdLowerBound: 690, stdUpperBound: 810 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 750, aircraftRegisterId: '7092902880000000310' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155710',
        definition: { category: '', label: 'AWZ', stcId: '3', flightNumber: 'W5 4524', departureAirportId: '7092901520000001855', arrivalAirportId: '7092901520000000247' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 60,
          times: [{ stdLowerBound: 250, stdUpperBound: 370 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 60,
              times: [{ stdLowerBound: 250, stdUpperBound: 370 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 310, aircraftRegisterId: '7092902880000000304' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155739',
        definition: { category: '', label: 'KHK', stcId: '3', flightNumber: 'W5 4551', departureAirportId: '7092901520000001855', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 110,
          times: [{ stdLowerBound: 450, stdUpperBound: 570 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 110,
              times: [{ stdLowerBound: 450, stdUpperBound: 570 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 510, aircraftRegisterId: '7092902880000000304' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155787',
        definition: { category: '', label: 'MHD', stcId: '10', flightNumber: 'W5 1058', departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000006282' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 960, stdUpperBound: 1080 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 960, stdUpperBound: 1080 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 1020, aircraftRegisterId: '7092902880000001208' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155784',
        definition: { category: '', label: 'SYJ', stcId: '10', flightNumber: 'W5 1072', departureAirportId: '7092901520000003603', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 870, stdUpperBound: 990 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 870, stdUpperBound: 990 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 930, aircraftRegisterId: '7092902880000000304' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155778',
        definition: { category: '', label: 'CQD', stcId: '10', flightNumber: 'W5 4543', departureAirportId: '7092901520000005186', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 70,
          times: [{ stdLowerBound: 850, stdUpperBound: 970 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 70,
              times: [{ stdLowerBound: 850, stdUpperBound: 970 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 910, aircraftRegisterId: '7092902880000000910' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155691',
        definition: { category: '', label: 'IFN', stcId: '10', flightNumber: 'W5 4560', departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000001564' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 70,
          times: [{ stdLowerBound: 90, stdUpperBound: 210 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 70,
              times: [{ stdLowerBound: 90, stdUpperBound: 210 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 150, aircraftRegisterId: '7092902880000000306' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155772',
        definition: { category: '', label: 'KER', stcId: '10', flightNumber: 'W5 1059', departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000002340' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 810, stdUpperBound: 930 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 810, stdUpperBound: 930 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 870, aircraftRegisterId: '7092902880000001208' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155764',
        definition: { category: '', label: 'KER', stcId: '10', flightNumber: 'W5 1078', departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 110,
          times: [{ stdLowerBound: 690, stdUpperBound: 810 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 110,
              times: [{ stdLowerBound: 690, stdUpperBound: 810 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 750, aircraftRegisterId: '7092902880000000306' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155795',
        definition: { category: '', label: 'SYZ', stcId: '10', flightNumber: 'W5 1086', departureAirportId: '7092901520000008084', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 85,
          times: [{ stdLowerBound: 1020, stdUpperBound: 1140 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 85,
              times: [{ stdLowerBound: 1020, stdUpperBound: 1140 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 1080, aircraftRegisterId: '7092902880000000306' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155731',
        definition: { category: '', label: 'SYZ', stcId: '10', flightNumber: 'W5 1088', departureAirportId: '7092901520000008084', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 85,
          times: [{ stdLowerBound: 380, stdUpperBound: 500 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 85,
              times: [{ stdLowerBound: 380, stdUpperBound: 500 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 440, aircraftRegisterId: '7092902880000000310' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155732',
        definition: { category: '', label: 'IFN', stcId: '10', flightNumber: 'W5 4561', departureAirportId: '7092901520000008123', arrivalAirportId: '7092901520000001564' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 380, stdUpperBound: 500 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 380, stdUpperBound: 500 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 440, aircraftRegisterId: '7092902880000000306' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155782',
        definition: { category: '', label: 'AWZ', stcId: '10', flightNumber: 'W5 1060', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000000247' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 70,
          times: [{ stdLowerBound: 890, stdUpperBound: 1010 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 70,
              times: [{ stdLowerBound: 890, stdUpperBound: 1010 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 950, aircraftRegisterId: '7092902880000000310' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155682',
        definition: { category: '', label: 'AWZ', stcId: '10', flightNumber: 'W5 4586', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000000247' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 70,
          times: [{ stdLowerBound: 0, stdUpperBound: 90 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 70,
              times: [{ stdLowerBound: 0, stdUpperBound: 90 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 30, aircraftRegisterId: '7092902880000000310' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155789',
        definition: { category: '', label: 'IFN', stcId: '10', flightNumber: 'W5 4531', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000001564' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 70,
          times: [{ stdLowerBound: 1000, stdUpperBound: 1120 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 70,
              times: [{ stdLowerBound: 1000, stdUpperBound: 1120 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 1060, aircraftRegisterId: '7092902880000000910' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155706',
        definition: { category: '', label: 'IFN', stcId: '10', flightNumber: 'W5 4539', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000001564' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 75,
          times: [{ stdLowerBound: 210, stdUpperBound: 330 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 75,
              times: [{ stdLowerBound: 210, stdUpperBound: 330 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 270, aircraftRegisterId: '7092902880000001208' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155750',
        definition: { category: '', label: 'KHD', stcId: '10', flightNumber: 'W5 1008', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000001849' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 75,
          times: [{ stdLowerBound: 570, stdUpperBound: 690 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 75,
              times: [{ stdLowerBound: 570, stdUpperBound: 690 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 630, aircraftRegisterId: '7092902880000000310' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155697',
        definition: { category: '', label: 'KHK', stcId: '3', flightNumber: 'W5 4550', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000001855' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 110,
          times: [{ stdLowerBound: 110, stdUpperBound: 230 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 110,
              times: [{ stdLowerBound: 110, stdUpperBound: 230 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 170, aircraftRegisterId: '7092902880000000304' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155765',
        definition: { category: '', label: 'SYJ', stcId: '10', flightNumber: 'W5 1073', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000003603' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 95,
          times: [{ stdLowerBound: 725, stdUpperBound: 845 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 95,
              times: [{ stdLowerBound: 725, stdUpperBound: 845 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 785, aircraftRegisterId: '7092902880000000304' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155763',
        definition: { category: '', label: 'CQD', stcId: '10', flightNumber: 'W5 4542', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000005186' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 70,
          times: [{ stdLowerBound: 730, stdUpperBound: 850 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 70,
              times: [{ stdLowerBound: 730, stdUpperBound: 850 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 790, aircraftRegisterId: '7092902880000000910' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155748',
        definition: { category: '', label: 'THR', stcId: '10', flightNumber: 'W5 1079', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006282' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 530, stdUpperBound: 650 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 530, stdUpperBound: 650 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 590, aircraftRegisterId: '7092902880000001208' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155800',
        definition: { category: '', label: 'RJN', stcId: '10', flightNumber: 'W5 4571', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000007677' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 105,
          times: [{ stdLowerBound: 1035, stdUpperBound: 1155 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 105,
              times: [{ stdLowerBound: 1035, stdUpperBound: 1155 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 1095, aircraftRegisterId: '7092902880000000304' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155783',
        definition: { category: '', label: 'SYZ', stcId: '10', flightNumber: 'W5 1087', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000008084' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 85,
          times: [{ stdLowerBound: 875, stdUpperBound: 995 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 85,
              times: [{ stdLowerBound: 875, stdUpperBound: 995 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 935, aircraftRegisterId: '7092902880000000306' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155711',
        definition: { category: '', label: 'SYZ', stcId: '10', flightNumber: 'W5 1089', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000008084' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 80,
          times: [{ stdLowerBound: 240, stdUpperBound: 360 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 80,
              times: [{ stdLowerBound: 240, stdUpperBound: 360 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 300, aircraftRegisterId: '7092902880000000310' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155692',
        definition: { category: '', label: 'ACZ', stcId: '10', flightNumber: 'W5 1085', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000008889' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 120,
          times: [{ stdLowerBound: 40, stdUpperBound: 160 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 120,
              times: [{ stdLowerBound: 40, stdUpperBound: 160 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 100, aircraftRegisterId: '7092902880000000910' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155737',
        definition: { category: '', label: 'IIL', stcId: '10', flightNumber: 'W5 4572', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000009181' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 80,
          times: [{ stdLowerBound: 460, stdUpperBound: 580 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 80,
              times: [{ stdLowerBound: 460, stdUpperBound: 580 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 520, aircraftRegisterId: '7092902880000000910' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155714',
        definition: { category: '', label: 'ACZ', stcId: '10', flightNumber: 'W5 1084', departureAirportId: '7092901520000008889', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 125,
          times: [{ stdLowerBound: 210, stdUpperBound: 330 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 125,
              times: [{ stdLowerBound: 210, stdUpperBound: 330 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 270, aircraftRegisterId: '7092902880000000910' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155751',
        definition: { category: '', label: 'IIL', stcId: '10', flightNumber: 'W5 4573', departureAirportId: '7092901520000009181', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 75,
          times: [{ stdLowerBound: 585, stdUpperBound: 705 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 75,
              times: [{ stdLowerBound: 585, stdUpperBound: 705 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 645, aircraftRegisterId: '7092902880000000910' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155813',
        definition: { category: '', label: 'PVG', stcId: '10', flightNumber: 'W5 0077', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000003099' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 510,
          times: [{ stdLowerBound: 990, stdUpperBound: 1110 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001088' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 510,
              times: [{ stdLowerBound: 990, stdUpperBound: 1110 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001088' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 1050, aircraftRegisterId: '7092902880000001088' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155729',
        definition: { category: '', label: 'MXP', stcId: '10', flightNumber: 'W5 0110', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000006983' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 325,
          times: [{ stdLowerBound: 110, stdUpperBound: 230 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001088' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 325,
              times: [{ stdLowerBound: 110, stdUpperBound: 230 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001088' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 170, aircraftRegisterId: '7092902880000001088' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155810',
        definition: { category: '', label: 'SZX', stcId: '10', flightNumber: 'W5 0087', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000010173' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 525,
          times: [{ stdLowerBound: 945, stdUpperBound: 1065 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000270' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 525,
              times: [{ stdLowerBound: 945, stdUpperBound: 1065 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000270' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 1005, aircraftRegisterId: '7092902880000000270' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155808',
        definition: { category: '', label: 'PVG', stcId: '10', flightNumber: 'W5 0076', departureAirportId: '7092901520000003099', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 570,
          times: [{ stdLowerBound: 840, stdUpperBound: 960 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001060' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 570,
              times: [{ stdLowerBound: 840, stdUpperBound: 960 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001060' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 900, aircraftRegisterId: '7092902880000001060' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155806',
        definition: { category: '', label: 'CAN', stcId: '10', flightNumber: 'W5 0080', departureAirportId: '7092901520000005013', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 530,
          times: [{ stdLowerBound: 870, stdUpperBound: 990 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000998' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 530,
              times: [{ stdLowerBound: 870, stdUpperBound: 990 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000998' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 930, aircraftRegisterId: '7092902880000000998' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155766',
        definition: { category: '', label: 'MXP', stcId: '10', flightNumber: 'W5 0111', departureAirportId: '7092901520000006983', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 285,
          times: [{ stdLowerBound: 535, stdUpperBound: 655 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001088' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 285,
              times: [{ stdLowerBound: 535, stdUpperBound: 655 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001088' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 4,
            flight: { std: 595, aircraftRegisterId: '7092902880000001088' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155838',
        definition: {
          category: 'مهدالبراق',
          label: 'BGW',
          stcId: '3',
          flightNumber: 'W5 5037',
          departureAirportId: '7092901520000000350',
          arrivalAirportId: '7092901520000001588'
        },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 215, stdUpperBound: 335 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 215, stdUpperBound: 335 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 275, aircraftRegisterId: '7092902880000000560' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155842',
        definition: { category: '', label: 'BND', stcId: '10', flightNumber: 'W5 1094', departureAirportId: '7092901520000000426', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 105,
          times: [{ stdLowerBound: 240, stdUpperBound: 360 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 105,
              times: [{ stdLowerBound: 240, stdUpperBound: 360 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 300, aircraftRegisterId: '7092902880000000283' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155860',
        definition: { category: 'شمسا', label: 'NJF', stcId: '3', flightNumber: 'W5 5040', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000002646' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 85,
          times: [{ stdLowerBound: 380, stdUpperBound: 500 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 85,
              times: [{ stdLowerBound: 380, stdUpperBound: 500 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 440, aircraftRegisterId: '7092902880000000560' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155820',
        definition: {
          category: 'مهدالبراق',
          label: 'BGW',
          stcId: '3',
          flightNumber: 'W5 5002',
          departureAirportId: '7092901520000002340',
          arrivalAirportId: '7092901520000000350'
        },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 155,
          times: [{ stdLowerBound: 0, stdUpperBound: 105 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 155,
              times: [{ stdLowerBound: 0, stdUpperBound: 105 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 45, aircraftRegisterId: '7092902880000000560' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155869',
        definition: { category: '', label: 'MHD', stcId: '10', flightNumber: 'W5 1058', departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000006282' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 85,
          times: [{ stdLowerBound: 465, stdUpperBound: 585 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 85,
              times: [{ stdLowerBound: 465, stdUpperBound: 585 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 525, aircraftRegisterId: '7092902880000000573' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155901',
        definition: { category: '', label: 'KIH', stcId: '3', flightNumber: 'W5 1044', departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000006305' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 120,
          times: [{ stdLowerBound: 765, stdUpperBound: 885 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 120,
              times: [{ stdLowerBound: 765, stdUpperBound: 885 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 825, aircraftRegisterId: '7092902880000000560' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155886',
        definition: { category: '', label: 'MHD', stcId: '10', flightNumber: 'W5 1034', departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 615, stdUpperBound: 735 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 615, stdUpperBound: 735 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 675, aircraftRegisterId: '7092902880000000283' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155881',
        definition: { category: 'شمسا', label: 'NJF', stcId: '3', flightNumber: 'W5 5003', departureAirportId: '7092901520000002646', arrivalAirportId: '7092901520000002340' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 135,
          times: [{ stdLowerBound: 540, stdUpperBound: 660 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 135,
              times: [{ stdLowerBound: 540, stdUpperBound: 660 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 600, aircraftRegisterId: '7092902880000000560' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155851',
        definition: { category: '', label: 'KER', stcId: '10', flightNumber: 'W5 1059', departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000002340' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 85,
          times: [{ stdLowerBound: 320, stdUpperBound: 440 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 85,
              times: [{ stdLowerBound: 320, stdUpperBound: 440 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 380, aircraftRegisterId: '7092902880000000573' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155932',
        definition: { category: 'شمسا', label: 'NJF', stcId: '3', flightNumber: 'W5 5024', departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000002646' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 140,
          times: [{ stdLowerBound: 1260, stdUpperBound: 1380 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 140,
              times: [{ stdLowerBound: 1260, stdUpperBound: 1380 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 1320, aircraftRegisterId: '7092902880000000283' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155816',
        definition: { category: '', label: 'KER', stcId: '10', flightNumber: 'W5 1050', departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 0, stdUpperBound: 120 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 0, stdUpperBound: 120 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 60, aircraftRegisterId: '7092902880000000573' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155913',
        definition: { category: '', label: 'KER', stcId: '10', flightNumber: 'W5 1052', departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 930, stdUpperBound: 1050 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 930, stdUpperBound: 1050 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 990, aircraftRegisterId: '7092902880000000283' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155888',
        definition: { category: '', label: 'KER', stcId: '10', flightNumber: 'W5 1054', departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 610, stdUpperBound: 730 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 610, stdUpperBound: 730 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 670, aircraftRegisterId: '7092902880000000573' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155915',
        definition: { category: '', label: 'KIH', stcId: '3', flightNumber: 'W5 1045', departureAirportId: '7092901520000006305', arrivalAirportId: '7092901520000002340' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 120,
          times: [{ stdLowerBound: 960, stdUpperBound: 1080 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 120,
              times: [{ stdLowerBound: 960, stdUpperBound: 1080 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 1020, aircraftRegisterId: '7092902880000000560' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155919',
        definition: { category: '', label: 'KIH', stcId: '3', flightNumber: 'W5 1012', departureAirportId: '7092901520000006305', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 105,
          times: [{ stdLowerBound: 990, stdUpperBound: 1110 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 105,
              times: [{ stdLowerBound: 990, stdUpperBound: 1110 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 1050, aircraftRegisterId: '7092902880000000573' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155818',
        definition: { category: '', label: 'BND', stcId: '10', flightNumber: 'W5 1095', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000000426' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 105,
          times: [{ stdLowerBound: 15, stdUpperBound: 135 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 105,
              times: [{ stdLowerBound: 15, stdUpperBound: 135 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 75, aircraftRegisterId: '7092902880000000283' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155865',
        definition: { category: '', label: 'THR', stcId: '10', flightNumber: 'W5 1035', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000002340' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 450, stdUpperBound: 570 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 450, stdUpperBound: 570 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 510, aircraftRegisterId: '7092902880000000283' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155827',
        definition: { category: '', label: 'THR', stcId: '10', flightNumber: 'W5 1051', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006282' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 160, stdUpperBound: 280 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 160, stdUpperBound: 280 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 220, aircraftRegisterId: '7092902880000000573' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155927',
        definition: { category: '', label: 'THR', stcId: '10', flightNumber: 'W5 1053', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006282' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 1090, stdUpperBound: 1210 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 1090, stdUpperBound: 1210 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 1150, aircraftRegisterId: '7092902880000000283' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155899',
        definition: { category: '', label: 'THR', stcId: '10', flightNumber: 'W5 1055', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006282' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 770, stdUpperBound: 890 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 770, stdUpperBound: 890 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 830, aircraftRegisterId: '7092902880000000283' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155905',
        definition: { category: '', label: 'KIH', stcId: '3', flightNumber: 'W5 1013', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006305' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 105,
          times: [{ stdLowerBound: 810, stdUpperBound: 930 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 105,
              times: [{ stdLowerBound: 810, stdUpperBound: 930 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 870, aircraftRegisterId: '7092902880000000573' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155825',
        definition: { category: '', label: 'AWZ', stcId: '10', flightNumber: 'W5 4587', departureAirportId: '7092901520000000247', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 70,
          times: [{ stdLowerBound: 110, stdUpperBound: 230 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 70,
              times: [{ stdLowerBound: 110, stdUpperBound: 230 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 170, aircraftRegisterId: '7092902880000000273' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000164127',
        definition: {
          category: 'مهدالبراق',
          label: 'BGW',
          stcId: '13',
          flightNumber: 'W5 5091',
          departureAirportId: '7092901520000000350',
          arrivalAirportId: '7092901520000001588'
        },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 1350, stdUpperBound: 1440 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000298' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 1350, stdUpperBound: 1440 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000298' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 1410, aircraftRegisterId: '7092902880000000298' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000164125',
        definition: {
          category: 'مهدالبراق',
          label: 'BGW',
          stcId: '13',
          flightNumber: 'W5 5083',
          departureAirportId: '7092901520000000350',
          arrivalAirportId: '7092901520000002340'
        },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 140,
          times: [{ stdLowerBound: 930, stdUpperBound: 1050 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000298' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 140,
              times: [{ stdLowerBound: 930, stdUpperBound: 1050 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000298' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 990, aircraftRegisterId: '7092902880000000298' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155928',
        definition: { category: '', label: 'BKK', stcId: '10', flightNumber: 'W5 0050', departureAirportId: '7092901520000000397', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 445,
          times: [{ stdLowerBound: 875, stdUpperBound: 995 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000292' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 445,
              times: [{ stdLowerBound: 875, stdUpperBound: 995 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000292' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 935, aircraftRegisterId: '7092902880000000292' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155920',
        definition: { category: '', label: 'BND', stcId: '10', flightNumber: 'W5 4592', departureAirportId: '7092901520000000426', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 105,
          times: [{ stdLowerBound: 1000, stdUpperBound: 1120 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000299' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 105,
              times: [{ stdLowerBound: 1000, stdUpperBound: 1120 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000299' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 1060, aircraftRegisterId: '7092902880000000299' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155917',
        definition: { category: '', label: 'DAM', stcId: '3', flightNumber: 'W5 0143', departureAirportId: '7092901520000000851', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 125,
          times: [{ stdLowerBound: 960, stdUpperBound: 1080 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000291' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 125,
              times: [{ stdLowerBound: 960, stdUpperBound: 1080 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000291' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 1020, aircraftRegisterId: '7092902880000000291' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155871',
        definition: { category: '', label: 'ESB', stcId: '10', flightNumber: 'W5 0119', departureAirportId: '7092901520000001070', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 140,
          times: [{ stdLowerBound: 420, stdUpperBound: 540 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000298' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 140,
              times: [{ stdLowerBound: 420, stdUpperBound: 540 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000298' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 480, aircraftRegisterId: '7092902880000000298' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000164124',
        definition: {
          category: 'مهدالبراق',
          label: 'BGW',
          stcId: '13',
          flightNumber: 'W5 5092',
          departureAirportId: '7092901520000001588',
          arrivalAirportId: '7092901520000000350'
        },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 765, stdUpperBound: 885 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000298' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 765, stdUpperBound: 885 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000298' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 825, aircraftRegisterId: '7092902880000000298' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155933',
        definition: { category: '', label: 'BKK', stcId: '10', flightNumber: 'W5 0051', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000000397' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 405,
          times: [{ stdLowerBound: 1000, stdUpperBound: 1120 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000282' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 405,
              times: [{ stdLowerBound: 1000, stdUpperBound: 1120 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000282' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 1060, aircraftRegisterId: '7092902880000000282' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155902',
        definition: { category: '', label: 'DAM', stcId: '3', flightNumber: 'W5 0142', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000000851' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 140,
          times: [{ stdLowerBound: 750, stdUpperBound: 870 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000291' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 140,
              times: [{ stdLowerBound: 750, stdUpperBound: 870 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000291' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 810, aircraftRegisterId: '7092902880000000291' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155930',
        definition: { category: '', label: 'DNZ', stcId: '3', flightNumber: 'W5 1138', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000000937' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 195,
          times: [{ stdLowerBound: 1155, stdUpperBound: 1275 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000291' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 195,
              times: [{ stdLowerBound: 1155, stdUpperBound: 1275 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000291' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 1215, aircraftRegisterId: '7092902880000000291' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155839',
        definition: { category: '', label: 'ESB', stcId: '10', flightNumber: 'W5 0118', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000001070' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 165,
          times: [{ stdLowerBound: 150, stdUpperBound: 270 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000298' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 165,
              times: [{ stdLowerBound: 150, stdUpperBound: 270 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000298' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 210, aircraftRegisterId: '7092902880000000298' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155843',
        definition: { category: '', label: 'VKO', stcId: '10', flightNumber: 'W5 0084', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000004007' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 225,
          times: [{ stdLowerBound: 120, stdUpperBound: 240 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000291' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 225,
              times: [{ stdLowerBound: 120, stdUpperBound: 240 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000291' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 180, aircraftRegisterId: '7092902880000000291' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155832',
        definition: { category: '', label: 'DXB1', stcId: '10', flightNumber: 'W5 0061', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000005420' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 120,
          times: [{ stdLowerBound: 150, stdUpperBound: 270 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000282' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 120,
              times: [{ stdLowerBound: 150, stdUpperBound: 270 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000282' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 210, aircraftRegisterId: '7092902880000000282' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000164126',
        definition: {
          category: 'مهدالبراق',
          label: 'BGW',
          stcId: '13',
          flightNumber: 'W5 5084',
          departureAirportId: '7092901520000002340',
          arrivalAirportId: '7092901520000000350'
        },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 150,
          times: [{ stdLowerBound: 1140, stdUpperBound: 1260 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000298' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 150,
              times: [{ stdLowerBound: 1140, stdUpperBound: 1260 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000298' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 1200, aircraftRegisterId: '7092902880000000298' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000161033',
        definition: { category: '', label: 'BSR', stcId: '3', flightNumber: 'W5 5106', departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008838' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 165,
          times: [{ stdLowerBound: 180, stdUpperBound: 300 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000265' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 165,
              times: [{ stdLowerBound: 180, stdUpperBound: 300 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000265' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 240, aircraftRegisterId: '7092902880000000265' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155876',
        definition: { category: '', label: 'VKO', stcId: '10', flightNumber: 'W5 0085', departureAirportId: '7092901520000004007', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 210,
          times: [{ stdLowerBound: 420, stdUpperBound: 540 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000291' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 210,
              times: [{ stdLowerBound: 420, stdUpperBound: 540 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000291' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 480, aircraftRegisterId: '7092902880000000291' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155866',
        definition: { category: '', label: 'DXB1', stcId: '10', flightNumber: 'W5 0060', departureAirportId: '7092901520000005420', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 120,
          times: [{ stdLowerBound: 420, stdUpperBound: 540 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000282' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 120,
              times: [{ stdLowerBound: 420, stdUpperBound: 540 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000282' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 480, aircraftRegisterId: '7092902880000000282' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155891',
        definition: { category: '', label: 'KIH', stcId: '3', flightNumber: 'W5 1042', departureAirportId: '7092901520000006305', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 95,
          times: [{ stdLowerBound: 695, stdUpperBound: 815 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 95,
              times: [{ stdLowerBound: 695, stdUpperBound: 815 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 755, aircraftRegisterId: '7092902880000000273' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155859',
        definition: { category: '', label: 'SYZ', stcId: '10', flightNumber: 'W5 1088', departureAirportId: '7092901520000008084', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 85,
          times: [{ stdLowerBound: 380, stdUpperBound: 500 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 85,
              times: [{ stdLowerBound: 380, stdUpperBound: 500 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 440, aircraftRegisterId: '7092902880000000273' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155811',
        definition: { category: '', label: 'AWZ', stcId: '10', flightNumber: 'W5 4586', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000000247' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 70,
          times: [{ stdLowerBound: 0, stdUpperBound: 90 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 70,
              times: [{ stdLowerBound: 0, stdUpperBound: 90 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 30, aircraftRegisterId: '7092902880000000273' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155906',
        definition: { category: '', label: 'BND', stcId: '10', flightNumber: 'W5 4593', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000000426' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 830, stdUpperBound: 950 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000299' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 830, stdUpperBound: 950 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000299' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 890, aircraftRegisterId: '7092902880000000299' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155817',
        definition: { category: '', label: 'THR', stcId: '10', flightNumber: 'W5 1081', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000002340' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 20, stdUpperBound: 140 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000265' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 20, stdUpperBound: 140 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000265' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 80, aircraftRegisterId: '7092902880000000265' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155874',
        definition: { category: '', label: 'KIH', stcId: '3', flightNumber: 'W5 1043', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006305' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 105,
          times: [{ stdLowerBound: 520, stdUpperBound: 640 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 105,
              times: [{ stdLowerBound: 520, stdUpperBound: 640 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 580, aircraftRegisterId: '7092902880000000273' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155841',
        definition: { category: '', label: 'SYZ', stcId: '10', flightNumber: 'W5 1089', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000008084' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 80,
          times: [{ stdLowerBound: 240, stdUpperBound: 360 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 80,
              times: [{ stdLowerBound: 240, stdUpperBound: 360 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 300, aircraftRegisterId: '7092902880000000273' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000161034',
        definition: { category: '', label: 'BSR', stcId: '3', flightNumber: 'W5 5107', departureAirportId: '7092901520000008838', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 75,
          times: [{ stdLowerBound: 405, stdUpperBound: 525 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000265' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 75,
              times: [{ stdLowerBound: 405, stdUpperBound: 525 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000265' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 465, aircraftRegisterId: '7092902880000000265' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155833',
        definition: { category: '', label: 'IST', stcId: '10', flightNumber: 'W5 0112', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000001628' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 195,
          times: [{ stdLowerBound: 80, stdUpperBound: 200 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000348' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 195,
              times: [{ stdLowerBound: 80, stdUpperBound: 200 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000348' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 140, aircraftRegisterId: '7092902880000000348' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155903',
        definition: { category: '', label: 'IST', stcId: '10', flightNumber: 'W5 0114', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000001628' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 195,
          times: [{ stdLowerBound: 705, stdUpperBound: 825 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000348' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 195,
              times: [{ stdLowerBound: 705, stdUpperBound: 825 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000348' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 765, aircraftRegisterId: '7092902880000000348' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155846',
        definition: { category: '', label: 'VAR', stcId: '3', flightNumber: 'W5 1114', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000003969' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 200,
          times: [{ stdLowerBound: 190, stdUpperBound: 310 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001025' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 200,
              times: [{ stdLowerBound: 190, stdUpperBound: 310 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001025' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 250, aircraftRegisterId: '7092902880000001025' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155900',
        definition: { category: '', label: 'DXB2', stcId: '10', flightNumber: 'W5 0065', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000005420' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 120,
          times: [{ stdLowerBound: 750, stdUpperBound: 870 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001025' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 120,
              times: [{ stdLowerBound: 750, stdUpperBound: 870 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001025' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 810, aircraftRegisterId: '7092902880000001025' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155873',
        definition: { category: '', label: 'IST', stcId: '10', flightNumber: 'W5 0113', departureAirportId: '7092901520000001628', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 180,
          times: [{ stdLowerBound: 435, stdUpperBound: 555 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000348' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 180,
              times: [{ stdLowerBound: 435, stdUpperBound: 555 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000348' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 495, aircraftRegisterId: '7092902880000000348' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155925',
        definition: { category: '', label: 'IST', stcId: '10', flightNumber: 'W5 0115', departureAirportId: '7092901520000001628', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 180,
          times: [{ stdLowerBound: 990, stdUpperBound: 1110 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000348' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 180,
              times: [{ stdLowerBound: 990, stdUpperBound: 1110 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000348' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 1050, aircraftRegisterId: '7092902880000000348' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155883',
        definition: { category: '', label: 'VAR', stcId: '3', flightNumber: 'W5 1113', departureAirportId: '7092901520000003969', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 180,
          times: [{ stdLowerBound: 495, stdUpperBound: 615 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001025' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 180,
              times: [{ stdLowerBound: 495, stdUpperBound: 615 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001025' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 555, aircraftRegisterId: '7092902880000001025' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155916',
        definition: { category: '', label: 'DXB2', stcId: '10', flightNumber: 'W5 0064', departureAirportId: '7092901520000005420', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 120,
          times: [{ stdLowerBound: 960, stdUpperBound: 1080 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001025' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 120,
              times: [{ stdLowerBound: 960, stdUpperBound: 1080 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001025' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 1020, aircraftRegisterId: '7092902880000001025' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155929',
        definition: { category: '', label: 'KUL', stcId: '10', flightNumber: 'W5 0082', departureAirportId: '7092901520000006443', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 480,
          times: [{ stdLowerBound: 855, stdUpperBound: 975 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000268' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 480,
              times: [{ stdLowerBound: 855, stdUpperBound: 975 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000268' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 915, aircraftRegisterId: '7092902880000000268' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155922',
        definition: { category: '', label: 'MHD', stcId: '10', flightNumber: 'W5 1036', departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 85,
          times: [{ stdLowerBound: 1020, stdUpperBound: 1140 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000280' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 85,
              times: [{ stdLowerBound: 1020, stdUpperBound: 1140 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000280' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 1080, aircraftRegisterId: '7092902880000000280' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155908',
        definition: { category: '', label: 'THR', stcId: '10', flightNumber: 'W5 1037', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000002340' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 850, stdUpperBound: 970 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000280' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 850, stdUpperBound: 970 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000280' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 910, aircraftRegisterId: '7092902880000000280' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155848',
        definition: { category: '', label: 'SYZ', stcId: '10', flightNumber: 'W5 4563', departureAirportId: '7092901520000000247', arrivalAirportId: '7092901520000008084' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 60,
          times: [{ stdLowerBound: 330, stdUpperBound: 450 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 60,
              times: [{ stdLowerBound: 330, stdUpperBound: 450 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 390, aircraftRegisterId: '7092902880000001208' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155814',
        definition: { category: '', label: 'IFN', stcId: '10', flightNumber: 'W5 4530', departureAirportId: '7092901520000001564', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 60,
          times: [{ stdLowerBound: 0, stdUpperBound: 120 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 60,
              times: [{ stdLowerBound: 0, stdUpperBound: 120 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 60, aircraftRegisterId: '7092902880000000910' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155890',
        definition: { category: '', label: 'KHD', stcId: '10', flightNumber: 'W5 1007', departureAirportId: '7092901520000001849', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 75,
          times: [{ stdLowerBound: 690, stdUpperBound: 810 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 75,
              times: [{ stdLowerBound: 690, stdUpperBound: 810 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 750, aircraftRegisterId: '7092902880000000910' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155852',
        definition: { category: '', label: 'SYZ', stcId: '3', flightNumber: 'W5 4557', departureAirportId: '7092901520000001855', arrivalAirportId: '7092901520000008084' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 50,
          times: [{ stdLowerBound: 355, stdUpperBound: 475 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 50,
              times: [{ stdLowerBound: 355, stdUpperBound: 475 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 415, aircraftRegisterId: '7092902880000000304' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155878',
        definition: { category: '', label: 'KHK', stcId: '3', flightNumber: 'W5 4551', departureAirportId: '7092901520000001855', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 545, stdUpperBound: 665 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 545, stdUpperBound: 665 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 605, aircraftRegisterId: '7092902880000000304' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155909',
        definition: { category: '', label: 'SYJ', stcId: '10', flightNumber: 'W5 1072', departureAirportId: '7092901520000003603', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 105,
          times: [{ stdLowerBound: 845, stdUpperBound: 965 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 105,
              times: [{ stdLowerBound: 845, stdUpperBound: 965 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 905, aircraftRegisterId: '7092902880000000310' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155856',
        definition: { category: '', label: 'BJB', stcId: '10', flightNumber: 'W5 4568', departureAirportId: '7092901520000004847', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 70,
          times: [{ stdLowerBound: 350, stdUpperBound: 470 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 70,
              times: [{ stdLowerBound: 350, stdUpperBound: 470 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 410, aircraftRegisterId: '7092902880000000306' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155885',
        definition: { category: '', label: 'KIH', stcId: '10', flightNumber: 'W5 4594', departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000006305' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 75,
          times: [{ stdLowerBound: 630, stdUpperBound: 750 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 75,
              times: [{ stdLowerBound: 630, stdUpperBound: 750 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 690, aircraftRegisterId: '7092902880000001208' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155821',
        definition: { category: '', label: 'SYZ', stcId: '10', flightNumber: 'W5 4562', departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000008084' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 65,
          times: [{ stdLowerBound: 90, stdUpperBound: 210 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 65,
              times: [{ stdLowerBound: 90, stdUpperBound: 210 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 150, aircraftRegisterId: '7092902880000001208' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155896',
        definition: { category: '', label: 'KIH', stcId: '10', flightNumber: 'W5 4595', departureAirportId: '7092901520000006305', arrivalAirportId: '7092901520000006282' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 75,
          times: [{ stdLowerBound: 765, stdUpperBound: 885 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 75,
              times: [{ stdLowerBound: 765, stdUpperBound: 885 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 825, aircraftRegisterId: '7092902880000001208' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155819',
        definition: { category: '', label: 'RJN', stcId: '10', flightNumber: 'W5 4570', departureAirportId: '7092901520000007677', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 105,
          times: [{ stdLowerBound: 30, stdUpperBound: 150 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 105,
              times: [{ stdLowerBound: 30, stdUpperBound: 150 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 90, aircraftRegisterId: '7092902880000000304' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155830',
        definition: { category: '', label: 'AWZ', stcId: '10', flightNumber: 'W5 4562', departureAirportId: '7092901520000008084', arrivalAirportId: '7092901520000000247' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 75,
          times: [{ stdLowerBound: 195, stdUpperBound: 315 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 75,
              times: [{ stdLowerBound: 195, stdUpperBound: 315 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 255, aircraftRegisterId: '7092902880000001208' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155863',
        definition: { category: '', label: 'KHK', stcId: '3', flightNumber: 'W5 4556', departureAirportId: '7092901520000008084', arrivalAirportId: '7092901520000001855' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 60,
          times: [{ stdLowerBound: 450, stdUpperBound: 570 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 60,
              times: [{ stdLowerBound: 450, stdUpperBound: 570 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 510, aircraftRegisterId: '7092902880000000304' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155861',
        definition: { category: '', label: 'SYZ', stcId: '10', flightNumber: 'W5 4563', departureAirportId: '7092901520000008084', arrivalAirportId: '7092901520000006282' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 60,
          times: [{ stdLowerBound: 435, stdUpperBound: 555 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 60,
              times: [{ stdLowerBound: 435, stdUpperBound: 555 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 495, aircraftRegisterId: '7092902880000001208' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155923',
        definition: { category: '', label: 'SYZ', stcId: '10', flightNumber: 'W5 1086', departureAirportId: '7092901520000008084', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 85,
          times: [{ stdLowerBound: 1020, stdUpperBound: 1140 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 85,
              times: [{ stdLowerBound: 1020, stdUpperBound: 1140 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 1080, aircraftRegisterId: '7092902880000000910' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155877',
        definition: { category: '', label: 'KHD', stcId: '10', flightNumber: 'W5 1008', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000001849' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 75,
          times: [{ stdLowerBound: 570, stdUpperBound: 690 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 75,
              times: [{ stdLowerBound: 570, stdUpperBound: 690 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 630, aircraftRegisterId: '7092902880000000910' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155840',
        definition: { category: '', label: 'KHK', stcId: '3', flightNumber: 'W5 4550', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000001855' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 220, stdUpperBound: 340 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 220, stdUpperBound: 340 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 280, aircraftRegisterId: '7092902880000000304' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155892',
        definition: { category: '', label: 'SYJ', stcId: '10', flightNumber: 'W5 1073', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000003603' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 95,
          times: [{ stdLowerBound: 705, stdUpperBound: 825 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 95,
              times: [{ stdLowerBound: 705, stdUpperBound: 825 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 765, aircraftRegisterId: '7092902880000000310' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155837',
        definition: { category: '', label: 'BJB', stcId: '10', flightNumber: 'W5 4569', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000004847' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 75,
          times: [{ stdLowerBound: 230, stdUpperBound: 350 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 75,
              times: [{ stdLowerBound: 230, stdUpperBound: 350 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 290, aircraftRegisterId: '7092902880000000306' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155910',
        definition: { category: '', label: 'SYZ', stcId: '10', flightNumber: 'W5 1087', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000008084' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 870, stdUpperBound: 990 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 870, stdUpperBound: 990 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 930, aircraftRegisterId: '7092902880000000910' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155893',
        definition: { category: '', label: 'XBJ', stcId: '10', flightNumber: 'W5 1049', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000008669' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 720, stdUpperBound: 840 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 720, stdUpperBound: 840 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 780, aircraftRegisterId: '7092902880000000306' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155867',
        definition: { category: '', label: 'IIL', stcId: '10', flightNumber: 'W5 4572', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000009181' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 80,
          times: [{ stdLowerBound: 460, stdUpperBound: 580 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 80,
              times: [{ stdLowerBound: 460, stdUpperBound: 580 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 520, aircraftRegisterId: '7092902880000000306' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155824',
        definition: { category: '', label: 'JYR', stcId: '10', flightNumber: 'W5 4575', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000009183' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 120,
          times: [{ stdLowerBound: 55, stdUpperBound: 175 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 120,
              times: [{ stdLowerBound: 55, stdUpperBound: 175 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 115, aircraftRegisterId: '7092902880000000310' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155829',
        definition: { category: '', label: 'GCH', stcId: '10', flightNumber: 'W5 4520', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000009227' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 170, stdUpperBound: 290 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 170, stdUpperBound: 290 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 230, aircraftRegisterId: '7092902880000000910' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155911',
        definition: { category: '', label: 'XBJ', stcId: '10', flightNumber: 'W5 1048', departureAirportId: '7092901520000008669', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 870, stdUpperBound: 990 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 870, stdUpperBound: 990 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 930, aircraftRegisterId: '7092902880000000306' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155849',
        definition: { category: '', label: 'JYR', stcId: '10', flightNumber: 'W5 4574', departureAirportId: '7092901520000009174', arrivalAirportId: '7092901520000009183' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 60,
          times: [{ stdLowerBound: 330, stdUpperBound: 450 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 60,
              times: [{ stdLowerBound: 330, stdUpperBound: 450 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 390, aircraftRegisterId: '7092902880000000310' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155880',
        definition: { category: '', label: 'IIL', stcId: '10', flightNumber: 'W5 4573', departureAirportId: '7092901520000009181', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 75,
          times: [{ stdLowerBound: 585, stdUpperBound: 705 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 75,
              times: [{ stdLowerBound: 585, stdUpperBound: 705 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 645, aircraftRegisterId: '7092902880000000306' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155870',
        definition: { category: '', label: 'JYR', stcId: '10', flightNumber: 'W5 4574', departureAirportId: '7092901520000009183', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 120,
          times: [{ stdLowerBound: 435, stdUpperBound: 555 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 120,
              times: [{ stdLowerBound: 435, stdUpperBound: 555 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 495, aircraftRegisterId: '7092902880000000310' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155834',
        definition: { category: '', label: 'IHR', stcId: '10', flightNumber: 'W5 4575', departureAirportId: '7092901520000009183', arrivalAirportId: '7092901520000009174' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 60,
          times: [{ stdLowerBound: 225, stdUpperBound: 345 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 60,
              times: [{ stdLowerBound: 225, stdUpperBound: 345 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 285, aircraftRegisterId: '7092902880000000310' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155850',
        definition: { category: '', label: 'GCH', stcId: '10', flightNumber: 'W5 4521', departureAirportId: '7092901520000009227', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 95,
          times: [{ stdLowerBound: 305, stdUpperBound: 425 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 95,
              times: [{ stdLowerBound: 305, stdUpperBound: 425 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 365, aircraftRegisterId: '7092902880000000910' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155854',
        definition: { category: '', label: 'IST', stcId: '10', flightNumber: 'W5 0116', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000001628' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 195,
          times: [{ stdLowerBound: 210, stdUpperBound: 330 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000998' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 195,
              times: [{ stdLowerBound: 210, stdUpperBound: 330 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000998' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 270, aircraftRegisterId: '7092902880000000998' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155931',
        definition: { category: '', label: 'PVG', stcId: '10', flightNumber: 'W5 0077', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000003099' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 490,
          times: [{ stdLowerBound: 910, stdUpperBound: 1030 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000998' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 490,
              times: [{ stdLowerBound: 910, stdUpperBound: 1030 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000998' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 970, aircraftRegisterId: '7092902880000000998' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155855',
        definition: { category: '', label: 'BCN', stcId: '10', flightNumber: 'W5 0136', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000004755' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 345,
          times: [{ stdLowerBound: 70, stdUpperBound: 190 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000970' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 345,
              times: [{ stdLowerBound: 70, stdUpperBound: 190 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000970' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 130, aircraftRegisterId: '7092902880000000970' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155828',
        definition: { category: '', label: 'BEY', stcId: '3', flightNumber: 'W5 1152', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000004781' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 140,
          times: [{ stdLowerBound: 120, stdUpperBound: 240 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001060' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 140,
              times: [{ stdLowerBound: 120, stdUpperBound: 240 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001060' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 180, aircraftRegisterId: '7092902880000001060' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155937',
        definition: { category: '', label: 'CAN', stcId: '10', flightNumber: 'W5 0081', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000005013' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 470,
          times: [{ stdLowerBound: 960, stdUpperBound: 1080 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000970' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 470,
              times: [{ stdLowerBound: 960, stdUpperBound: 1080 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000970' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 1020, aircraftRegisterId: '7092902880000000970' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155884',
        definition: { category: '', label: 'IST', stcId: '10', flightNumber: 'W5 0117', departureAirportId: '7092901520000001628', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 180,
          times: [{ stdLowerBound: 495, stdUpperBound: 615 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000998' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 180,
              times: [{ stdLowerBound: 495, stdUpperBound: 615 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000998' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 555, aircraftRegisterId: '7092902880000000998' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155894',
        definition: { category: '', label: 'BEY', stcId: '3', flightNumber: 'W5 1156', departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000004781' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 200,
          times: [{ stdLowerBound: 620, stdUpperBound: 740 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001060' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 200,
              times: [{ stdLowerBound: 620, stdUpperBound: 740 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001060' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 680, aircraftRegisterId: '7092902880000001060' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155934',
        definition: { category: '', label: 'PVG', stcId: '10', flightNumber: 'W5 0076', departureAirportId: '7092901520000003099', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 570,
          times: [{ stdLowerBound: 840, stdUpperBound: 960 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001088' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 570,
              times: [{ stdLowerBound: 840, stdUpperBound: 960 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001088' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 900, aircraftRegisterId: '7092902880000001088' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155898',
        definition: { category: '', label: 'BCN', stcId: '10', flightNumber: 'W5 0137', departureAirportId: '7092901520000004755', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 325,
          times: [{ stdLowerBound: 515, stdUpperBound: 635 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000970' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 325,
              times: [{ stdLowerBound: 515, stdUpperBound: 635 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000970' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 575, aircraftRegisterId: '7092902880000000970' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155914',
        definition: { category: '', label: 'BEY', stcId: '3', flightNumber: 'W5 1153', departureAirportId: '7092901520000004781', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 130,
          times: [{ stdLowerBound: 910, stdUpperBound: 1030 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001060' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 130,
              times: [{ stdLowerBound: 910, stdUpperBound: 1030 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001060' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 970, aircraftRegisterId: '7092902880000001060' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155864',
        definition: { category: '', label: 'BEY', stcId: '3', flightNumber: 'W5 1157', departureAirportId: '7092901520000004781', arrivalAirportId: '7092901520000002340' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 180,
          times: [{ stdLowerBound: 350, stdUpperBound: 470 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001060' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 180,
              times: [{ stdLowerBound: 350, stdUpperBound: 470 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001060' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 410, aircraftRegisterId: '7092902880000001060' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155935',
        definition: { category: '', label: 'SZX', stcId: '10', flightNumber: 'W5 0086', departureAirportId: '7092901520000010173', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 570,
          times: [{ stdLowerBound: 850, stdUpperBound: 970 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000270' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 570,
              times: [{ stdLowerBound: 850, stdUpperBound: 970 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000270' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 5,
            flight: { std: 910, aircraftRegisterId: '7092902880000000270' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155999',
        definition: {
          category: 'مهدالبراق',
          label: 'BGW',
          stcId: '3',
          flightNumber: 'W5 5045',
          departureAirportId: '7092901520000000350',
          arrivalAirportId: '7092901520000002340'
        },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 140,
          times: [{ stdLowerBound: 540, stdUpperBound: 660 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 140,
              times: [{ stdLowerBound: 540, stdUpperBound: 660 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 600, aircraftRegisterId: '7092902880000000560' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000164123',
        definition: { category: '', label: 'TBZ', stcId: '1', flightNumber: 'W5 9708', departureAirportId: '7092901520000001628', arrivalAirportId: '7092901520000008123' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 150,
          times: [{ stdLowerBound: 1150, stdUpperBound: 1270 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000290' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 150,
              times: [{ stdLowerBound: 1150, stdUpperBound: 1270 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000290' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 1210, aircraftRegisterId: '7092902880000000290' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155973',
        definition: {
          category: 'مهدالبراق',
          label: 'BGW',
          stcId: '3',
          flightNumber: 'W5 5046',
          departureAirportId: '7092901520000002340',
          arrivalAirportId: '7092901520000000350'
        },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 150,
          times: [{ stdLowerBound: 315, stdUpperBound: 435 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 150,
              times: [{ stdLowerBound: 315, stdUpperBound: 435 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 375, aircraftRegisterId: '7092902880000000560' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000156023',
        definition: { category: 'شمسا', label: 'NJF', stcId: '13', flightNumber: 'W5 5086', departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000002646' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 150,
          times: [{ stdLowerBound: 765, stdUpperBound: 885 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 150,
              times: [{ stdLowerBound: 765, stdUpperBound: 885 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 825, aircraftRegisterId: '7092902880000000560' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155939',
        definition: { category: '', label: 'KBL', stcId: '3', flightNumber: 'W5 1149', departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000006248' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 105,
          times: [{ stdLowerBound: 0, stdUpperBound: 60 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 105,
              times: [{ stdLowerBound: 0, stdUpperBound: 60 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 0, aircraftRegisterId: '7092902880000000560' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000156042',
        definition: { category: 'شمسا', label: 'NJF', stcId: '13', flightNumber: 'W5 5085', departureAirportId: '7092901520000002646', arrivalAirportId: '7092901520000002340' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 135,
          times: [{ stdLowerBound: 990, stdUpperBound: 1110 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 135,
              times: [{ stdLowerBound: 990, stdUpperBound: 1110 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 1050, aircraftRegisterId: '7092902880000000560' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155942',
        definition: { category: 'شمسا', label: 'NJF', stcId: '3', flightNumber: 'W5 5023', departureAirportId: '7092901520000002646', arrivalAirportId: '7092901520000006282' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 120,
          times: [{ stdLowerBound: 30, stdUpperBound: 150 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 120,
              times: [{ stdLowerBound: 30, stdUpperBound: 150 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 90, aircraftRegisterId: '7092902880000000283' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155947',
        definition: { category: '', label: 'KBL', stcId: '3', flightNumber: 'W5 1148', departureAirportId: '7092901520000006248', arrivalAirportId: '7092901520000002340' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 105,
          times: [{ stdLowerBound: 120, stdUpperBound: 240 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 105,
              times: [{ stdLowerBound: 120, stdUpperBound: 240 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000560' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 180, aircraftRegisterId: '7092902880000000560' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155959',
        definition: { category: '', label: 'KER', stcId: '10', flightNumber: 'W5 1050', departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 240, stdUpperBound: 360 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 240, stdUpperBound: 360 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 300, aircraftRegisterId: '7092902880000000283' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000156031',
        definition: { category: '', label: 'KER', stcId: '10', flightNumber: 'W5 1052', departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 930, stdUpperBound: 1050 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 930, stdUpperBound: 1050 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 990, aircraftRegisterId: '7092902880000000283' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000156004',
        definition: { category: '', label: 'KER', stcId: '10', flightNumber: 'W5 1054', departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 610, stdUpperBound: 730 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 610, stdUpperBound: 730 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 670, aircraftRegisterId: '7092902880000000573' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000156036',
        definition: { category: '', label: 'KIH', stcId: '3', flightNumber: 'W5 1012', departureAirportId: '7092901520000006305', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 105,
          times: [{ stdLowerBound: 990, stdUpperBound: 1110 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 105,
              times: [{ stdLowerBound: 990, stdUpperBound: 1110 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 1050, aircraftRegisterId: '7092902880000000573' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155975',
        definition: { category: '', label: 'THR', stcId: '10', flightNumber: 'W5 1051', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006282' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 420, stdUpperBound: 540 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 420, stdUpperBound: 540 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 480, aircraftRegisterId: '7092902880000000573' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000156046',
        definition: { category: '', label: 'THR', stcId: '10', flightNumber: 'W5 1053', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006282' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 1090, stdUpperBound: 1210 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 1090, stdUpperBound: 1210 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 1150, aircraftRegisterId: '7092902880000000283' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000156016',
        definition: { category: '', label: 'THR', stcId: '10', flightNumber: 'W5 1055', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006282' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 770, stdUpperBound: 890 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 770, stdUpperBound: 890 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000283' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 830, aircraftRegisterId: '7092902880000000283' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000156022',
        definition: { category: '', label: 'KIH', stcId: '3', flightNumber: 'W5 1013', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006305' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 95,
          times: [{ stdLowerBound: 820, stdUpperBound: 940 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 95,
              times: [{ stdLowerBound: 820, stdUpperBound: 940 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000573' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 880, aircraftRegisterId: '7092902880000000573' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155944',
        definition: { category: '', label: 'AWZ', stcId: '10', flightNumber: 'W5 4587', departureAirportId: '7092901520000000247', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 70,
          times: [{ stdLowerBound: 605, stdUpperBound: 725 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000299' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 70,
              times: [{ stdLowerBound: 605, stdUpperBound: 725 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000299' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 665, aircraftRegisterId: '7092902880000000299' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000164128',
        definition: {
          category: 'مهدالبراق',
          label: 'BGW',
          stcId: '13',
          flightNumber: 'W5 5099',
          departureAirportId: '7092901520000000350',
          arrivalAirportId: '7092901520000001588'
        },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 285, stdUpperBound: 405 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000298' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 285, stdUpperBound: 405 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000298' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 345, aircraftRegisterId: '7092902880000000298' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000156048',
        definition: { category: '', label: 'BKK', stcId: '10', flightNumber: 'W5 0050', departureAirportId: '7092901520000000397', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 445,
          times: [{ stdLowerBound: 875, stdUpperBound: 995 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000282' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 445,
              times: [{ stdLowerBound: 875, stdUpperBound: 995 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000282' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 935, aircraftRegisterId: '7092902880000000282' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000156041',
        definition: { category: '', label: 'BND', stcId: '10', flightNumber: 'W5 4592', departureAirportId: '7092901520000000426', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 105,
          times: [{ stdLowerBound: 1000, stdUpperBound: 1120 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000265' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 105,
              times: [{ stdLowerBound: 1000, stdUpperBound: 1120 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000265' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 1060, aircraftRegisterId: '7092902880000000265' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155943',
        definition: { category: '', label: 'DNZ', stcId: '3', flightNumber: 'W5 1139', departureAirportId: '7092901520000000937', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 165,
          times: [{ stdLowerBound: 0, stdUpperBound: 105 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000291' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 165,
              times: [{ stdLowerBound: 0, stdUpperBound: 105 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000291' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 45, aircraftRegisterId: '7092902880000000291' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155984',
        definition: { category: '', label: 'ESB', stcId: '10', flightNumber: 'W5 0119', departureAirportId: '7092901520000001070', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 140,
          times: [{ stdLowerBound: 420, stdUpperBound: 540 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000292' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 140,
              times: [{ stdLowerBound: 420, stdUpperBound: 540 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000292' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 480, aircraftRegisterId: '7092902880000000292' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000156006',
        definition: { category: '', label: 'GSM', stcId: '10', flightNumber: 'W5 4578', departureAirportId: '7092901520000001353', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 115,
          times: [{ stdLowerBound: 620, stdUpperBound: 740 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000265' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 115,
              times: [{ stdLowerBound: 620, stdUpperBound: 740 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000265' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 680, aircraftRegisterId: '7092902880000000265' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000164129',
        definition: {
          category: 'مهدالبراق',
          label: 'BGW',
          stcId: '13',
          flightNumber: 'W5 5092',
          departureAirportId: '7092901520000001588',
          arrivalAirportId: '7092901520000000350'
        },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 135, stdUpperBound: 255 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000298' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 135, stdUpperBound: 255 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000298' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 195, aircraftRegisterId: '7092902880000000298' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155954',
        definition: { category: '', label: 'ESB', stcId: '10', flightNumber: 'W5 0118', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000001070' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 165,
          times: [{ stdLowerBound: 150, stdUpperBound: 270 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000292' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 165,
              times: [{ stdLowerBound: 150, stdUpperBound: 270 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000292' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 210, aircraftRegisterId: '7092902880000000292' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000156047',
        definition: { category: '', label: 'PEK', stcId: '10', flightNumber: 'W5 0079', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000002937' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 390,
          times: [{ stdLowerBound: 915, stdUpperBound: 1035 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000292' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 390,
              times: [{ stdLowerBound: 915, stdUpperBound: 1035 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000292' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 975, aircraftRegisterId: '7092902880000000292' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155963',
        definition: { category: '', label: 'DXB3', stcId: '10', flightNumber: 'W5 0063', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000005420' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 120,
          times: [{ stdLowerBound: 255, stdUpperBound: 375 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000291' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 120,
              times: [{ stdLowerBound: 255, stdUpperBound: 375 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000291' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 315, aircraftRegisterId: '7092902880000000291' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000156018',
        definition: { category: '', label: 'DXB2', stcId: '10', flightNumber: 'W5 0065', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000005420' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 120,
          times: [{ stdLowerBound: 750, stdUpperBound: 870 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000291' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 120,
              times: [{ stdLowerBound: 750, stdUpperBound: 870 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000291' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 810, aircraftRegisterId: '7092902880000000291' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000156058',
        definition: { category: '', label: 'KBL', stcId: '3', flightNumber: 'W5 1101', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000006248' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 150,
          times: [{ stdLowerBound: 1350, stdUpperBound: 1440 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000291' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 150,
              times: [{ stdLowerBound: 1350, stdUpperBound: 1440 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000291' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 1410, aircraftRegisterId: '7092902880000000291' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155980',
        definition: { category: '', label: 'EBL', stcId: '10', flightNumber: 'W5 5060', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000009171' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 450, stdUpperBound: 570 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000298' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 450, stdUpperBound: 570 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000298' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 510, aircraftRegisterId: '7092902880000000298' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000161116',
        definition: { category: '', label: 'ISU', stcId: '10', flightNumber: 'W5 5058', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000009175' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 80,
          times: [{ stdLowerBound: 620, stdUpperBound: 740 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000292' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 80,
              times: [{ stdLowerBound: 620, stdUpperBound: 740 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000292' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 680, aircraftRegisterId: '7092902880000000292' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155965',
        definition: { category: '', label: 'MHD', stcId: '10', flightNumber: 'W5 1032', departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 315, stdUpperBound: 435 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 315, stdUpperBound: 435 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 375, aircraftRegisterId: '7092902880000000273' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155990',
        definition: { category: '', label: 'DXB3', stcId: '10', flightNumber: 'W5 0062', departureAirportId: '7092901520000005420', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 120,
          times: [{ stdLowerBound: 505, stdUpperBound: 625 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000291' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 120,
              times: [{ stdLowerBound: 505, stdUpperBound: 625 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000291' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 565, aircraftRegisterId: '7092902880000000291' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000156035',
        definition: { category: '', label: 'DXB2', stcId: '10', flightNumber: 'W5 0064', departureAirportId: '7092901520000005420', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 120,
          times: [{ stdLowerBound: 960, stdUpperBound: 1080 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000291' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 120,
              times: [{ stdLowerBound: 960, stdUpperBound: 1080 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000291' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 1020, aircraftRegisterId: '7092902880000000291' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000156012',
        definition: { category: '', label: 'KIH', stcId: '3', flightNumber: 'W5 1042', departureAirportId: '7092901520000006305', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 95,
          times: [{ stdLowerBound: 695, stdUpperBound: 815 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 95,
              times: [{ stdLowerBound: 695, stdUpperBound: 815 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 755, aircraftRegisterId: '7092902880000000273' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155938',
        definition: { category: '', label: 'AWZ', stcId: '10', flightNumber: 'W5 4586', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000000247' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 70,
          times: [{ stdLowerBound: 465, stdUpperBound: 585 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000299' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 70,
              times: [{ stdLowerBound: 465, stdUpperBound: 585 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000299' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 525, aircraftRegisterId: '7092902880000000299' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000156025',
        definition: { category: '', label: 'BND', stcId: '10', flightNumber: 'W5 4593', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000000426' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 830, stdUpperBound: 950 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000265' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 830, stdUpperBound: 950 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000265' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 890, aircraftRegisterId: '7092902880000000265' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155982',
        definition: { category: '', label: 'GSM', stcId: '10', flightNumber: 'W5 4579', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000001353' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 110,
          times: [{ stdLowerBound: 440, stdUpperBound: 560 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000265' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 110,
              times: [{ stdLowerBound: 440, stdUpperBound: 560 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000265' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 500, aircraftRegisterId: '7092902880000000265' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155949',
        definition: { category: '', label: 'THR', stcId: '10', flightNumber: 'W5 1033', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000002340' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 150, stdUpperBound: 270 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 150, stdUpperBound: 270 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 210, aircraftRegisterId: '7092902880000000273' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155989',
        definition: { category: '', label: 'KIH', stcId: '3', flightNumber: 'W5 1043', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000006305' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 105,
          times: [{ stdLowerBound: 520, stdUpperBound: 640 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 105,
              times: [{ stdLowerBound: 520, stdUpperBound: 640 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000273' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 580, aircraftRegisterId: '7092902880000000273' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000156002',
        definition: { category: '', label: 'EBL', stcId: '10', flightNumber: 'W5 5059', departureAirportId: '7092901520000009171', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 615, stdUpperBound: 735 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000298' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 615, stdUpperBound: 735 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000298' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 675, aircraftRegisterId: '7092902880000000298' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000161117',
        definition: { category: '', label: 'ISU', stcId: '10', flightNumber: 'W5 5057', departureAirportId: '7092901520000009175', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 70,
          times: [{ stdLowerBound: 770, stdUpperBound: 890 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000292' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 70,
              times: [{ stdLowerBound: 770, stdUpperBound: 890 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000292' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 830, aircraftRegisterId: '7092902880000000292' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000156051',
        definition: { category: '', label: 'BKK', stcId: '10', flightNumber: 'W5 0051', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000000397' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 405,
          times: [{ stdLowerBound: 1000, stdUpperBound: 1120 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000348' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 405,
              times: [{ stdLowerBound: 1000, stdUpperBound: 1120 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000348' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 1060, aircraftRegisterId: '7092902880000000348' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155952',
        definition: { category: '', label: 'IST', stcId: '10', flightNumber: 'W5 0112', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000001628' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 195,
          times: [{ stdLowerBound: 80, stdUpperBound: 200 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001025' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 195,
              times: [{ stdLowerBound: 80, stdUpperBound: 200 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001025' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 140, aircraftRegisterId: '7092902880000001025' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000156020',
        definition: { category: '', label: 'IST', stcId: '10', flightNumber: 'W5 0114', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000001628' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 195,
          times: [{ stdLowerBound: 705, stdUpperBound: 825 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001025' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 195,
              times: [{ stdLowerBound: 705, stdUpperBound: 825 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001025' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 765, aircraftRegisterId: '7092902880000001025' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155967',
        definition: { category: '', label: 'IST', stcId: '10', flightNumber: 'W5 0116', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000001628' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 195,
          times: [{ stdLowerBound: 210, stdUpperBound: 330 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000348' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 195,
              times: [{ stdLowerBound: 210, stdUpperBound: 330 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000348' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 270, aircraftRegisterId: '7092902880000000348' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155957',
        definition: { category: '', label: 'LED', stcId: '10', flightNumber: 'W5 1104', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000002059' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 270,
          times: [{ stdLowerBound: 60, stdUpperBound: 180 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000268' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 270,
              times: [{ stdLowerBound: 60, stdUpperBound: 180 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000268' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 120, aircraftRegisterId: '7092902880000000268' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000156060',
        definition: { category: '', label: 'KUL', stcId: '10', flightNumber: 'W5 0083', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000006443' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 480,
          times: [{ stdLowerBound: 1020, stdUpperBound: 1140 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000268' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 480,
              times: [{ stdLowerBound: 1020, stdUpperBound: 1140 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000268' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 1080, aircraftRegisterId: '7092902880000000268' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155987',
        definition: { category: '', label: 'IST', stcId: '10', flightNumber: 'W5 0113', departureAirportId: '7092901520000001628', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 180,
          times: [{ stdLowerBound: 435, stdUpperBound: 555 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001025' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 180,
              times: [{ stdLowerBound: 435, stdUpperBound: 555 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001025' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 495, aircraftRegisterId: '7092902880000001025' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000156044',
        definition: { category: '', label: 'IST', stcId: '10', flightNumber: 'W5 0115', departureAirportId: '7092901520000001628', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 180,
          times: [{ stdLowerBound: 990, stdUpperBound: 1110 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001025' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 180,
              times: [{ stdLowerBound: 990, stdUpperBound: 1110 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001025' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 1050, aircraftRegisterId: '7092902880000001025' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155998',
        definition: { category: '', label: 'IST', stcId: '10', flightNumber: 'W5 0117', departureAirportId: '7092901520000001628', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 180,
          times: [{ stdLowerBound: 495, stdUpperBound: 615 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000348' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 180,
              times: [{ stdLowerBound: 495, stdUpperBound: 615 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000348' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 555, aircraftRegisterId: '7092902880000000348' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155997',
        definition: { category: '', label: 'LED', stcId: '10', flightNumber: 'W5 1103', departureAirportId: '7092901520000002059', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 240,
          times: [{ stdLowerBound: 430, stdUpperBound: 550 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000268' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 240,
              times: [{ stdLowerBound: 430, stdUpperBound: 550 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000268' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 490, aircraftRegisterId: '7092902880000000268' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000156001',
        definition: { category: '', label: 'MHD', stcId: '10', flightNumber: 'W5 1034', departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 645, stdUpperBound: 765 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000280' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 645, stdUpperBound: 765 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000280' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 705, aircraftRegisterId: '7092902880000000280' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000156039',
        definition: { category: '', label: 'MHD', stcId: '10', flightNumber: 'W5 1036', departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 85,
          times: [{ stdLowerBound: 1020, stdUpperBound: 1140 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000280' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 85,
              times: [{ stdLowerBound: 1020, stdUpperBound: 1140 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000280' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 1080, aircraftRegisterId: '7092902880000000280' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155978',
        definition: { category: '', label: 'THR', stcId: '10', flightNumber: 'W5 1035', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000002340' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 450, stdUpperBound: 570 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000280' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 450, stdUpperBound: 570 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000280' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 510, aircraftRegisterId: '7092902880000000280' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000156027',
        definition: { category: '', label: 'THR', stcId: '10', flightNumber: 'W5 1037', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000002340' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 850, stdUpperBound: 970 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000280' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 850, stdUpperBound: 970 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000280' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 910, aircraftRegisterId: '7092902880000000280' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000156037',
        definition: { category: '', label: 'AWZ', stcId: '10', flightNumber: 'W5 1061', departureAirportId: '7092901520000000247', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 70,
          times: [{ stdLowerBound: 1030, stdUpperBound: 1150 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 70,
              times: [{ stdLowerBound: 1030, stdUpperBound: 1150 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 1090, aircraftRegisterId: '7092902880000000310' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155962',
        definition: { category: '', label: 'KHD', stcId: '10', flightNumber: 'W5 1005', departureAirportId: '7092901520000001849', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 75,
          times: [{ stdLowerBound: 285, stdUpperBound: 405 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 75,
              times: [{ stdLowerBound: 285, stdUpperBound: 405 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 345, aircraftRegisterId: '7092902880000000304' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000156010',
        definition: { category: '', label: 'KHD', stcId: '10', flightNumber: 'W5 1007', departureAirportId: '7092901520000001849', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 70,
          times: [{ stdLowerBound: 690, stdUpperBound: 810 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 70,
              times: [{ stdLowerBound: 690, stdUpperBound: 810 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 750, aircraftRegisterId: '7092902880000000310' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000156032',
        definition: { category: '', label: 'MHD', stcId: '10', flightNumber: 'W5 1058', departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000006282' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 960, stdUpperBound: 1080 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 960, stdUpperBound: 1080 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 1020, aircraftRegisterId: '7092902880000001208' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155964',
        definition: { category: '', label: 'MHD', stcId: '10', flightNumber: 'W5 1076', departureAirportId: '7092901520000002340', arrivalAirportId: '7092901520000006282' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 300, stdUpperBound: 420 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 300, stdUpperBound: 420 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 360, aircraftRegisterId: '7092902880000001208' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155968',
        definition: { category: '', label: 'BJB', stcId: '10', flightNumber: 'W5 4568', departureAirportId: '7092901520000004847', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 75,
          times: [{ stdLowerBound: 335, stdUpperBound: 455 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 75,
              times: [{ stdLowerBound: 335, stdUpperBound: 455 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 395, aircraftRegisterId: '7092902880000000910' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000156019',
        definition: { category: '', label: 'KER', stcId: '10', flightNumber: 'W5 1059', departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000002340' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 810, stdUpperBound: 930 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 810, stdUpperBound: 930 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 870, aircraftRegisterId: '7092902880000001208' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155950',
        definition: { category: '', label: 'KER', stcId: '10', flightNumber: 'W5 1077', departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000002340' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 150, stdUpperBound: 270 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 150, stdUpperBound: 270 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 210, aircraftRegisterId: '7092902880000001208' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155983',
        definition: { category: '', label: 'KIH', stcId: '10', flightNumber: 'W5 4594', departureAirportId: '7092901520000006282', arrivalAirportId: '7092901520000006305' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 75,
          times: [{ stdLowerBound: 480, stdUpperBound: 600 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 75,
              times: [{ stdLowerBound: 480, stdUpperBound: 600 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 540, aircraftRegisterId: '7092902880000001208' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000156000',
        definition: { category: '', label: 'KIH', stcId: '10', flightNumber: 'W5 4595', departureAirportId: '7092901520000006305', arrivalAirportId: '7092901520000006282' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 75,
          times: [{ stdLowerBound: 615, stdUpperBound: 735 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 75,
              times: [{ stdLowerBound: 615, stdUpperBound: 735 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001208' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 675, aircraftRegisterId: '7092902880000001208' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000156040',
        definition: { category: '', label: 'SYZ', stcId: '10', flightNumber: 'W5 1086', departureAirportId: '7092901520000008084', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 85,
          times: [{ stdLowerBound: 1020, stdUpperBound: 1140 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 85,
              times: [{ stdLowerBound: 1020, stdUpperBound: 1140 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 1080, aircraftRegisterId: '7092902880000000306' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155972',
        definition: { category: '', label: 'SYZ', stcId: '10', flightNumber: 'W5 1088', departureAirportId: '7092901520000008084', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 85,
          times: [{ stdLowerBound: 380, stdUpperBound: 500 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 85,
              times: [{ stdLowerBound: 380, stdUpperBound: 500 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 440, aircraftRegisterId: '7092902880000000310' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000156029',
        definition: { category: '', label: 'AWZ', stcId: '10', flightNumber: 'W5 1060', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000000247' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 65,
          times: [{ stdLowerBound: 905, stdUpperBound: 1025 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 65,
              times: [{ stdLowerBound: 905, stdUpperBound: 1025 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 965, aircraftRegisterId: '7092902880000000310' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000156033',
        definition: { category: '', label: 'IFN', stcId: '10', flightNumber: 'W5 4531', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000001564' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 70,
          times: [{ stdLowerBound: 1000, stdUpperBound: 1120 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 70,
              times: [{ stdLowerBound: 1000, stdUpperBound: 1120 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 1060, aircraftRegisterId: '7092902880000000304' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155948',
        definition: { category: '', label: 'KHD', stcId: '10', flightNumber: 'W5 1006', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000001849' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 75,
          times: [{ stdLowerBound: 165, stdUpperBound: 285 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 75,
              times: [{ stdLowerBound: 165, stdUpperBound: 285 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 225, aircraftRegisterId: '7092902880000000304' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155992',
        definition: { category: '', label: 'KHD', stcId: '10', flightNumber: 'W5 1008', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000001849' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 75,
          times: [{ stdLowerBound: 570, stdUpperBound: 690 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 75,
              times: [{ stdLowerBound: 570, stdUpperBound: 690 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 630, aircraftRegisterId: '7092902880000000310' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000156034',
        definition: { category: '', label: 'SYJ', stcId: '10', flightNumber: 'W5 1063', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000003603' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 100,
          times: [{ stdLowerBound: 975, stdUpperBound: 1095 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 100,
              times: [{ stdLowerBound: 975, stdUpperBound: 1095 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 1035, aircraftRegisterId: '7092902880000000910' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155953',
        definition: { category: '', label: 'BJB', stcId: '10', flightNumber: 'W5 4569', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000004847' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 75,
          times: [{ stdLowerBound: 210, stdUpperBound: 330 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 75,
              times: [{ stdLowerBound: 210, stdUpperBound: 330 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 270, aircraftRegisterId: '7092902880000000910' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000156028',
        definition: { category: '', label: 'SYZ', stcId: '10', flightNumber: 'W5 1087', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000008084' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 90,
          times: [{ stdLowerBound: 870, stdUpperBound: 990 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 90,
              times: [{ stdLowerBound: 870, stdUpperBound: 990 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 930, aircraftRegisterId: '7092902880000000306' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155955',
        definition: { category: '', label: 'SYZ', stcId: '10', flightNumber: 'W5 1089', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000008084' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 80,
          times: [{ stdLowerBound: 240, stdUpperBound: 360 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 80,
              times: [{ stdLowerBound: 240, stdUpperBound: 360 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000310' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 300, aircraftRegisterId: '7092902880000000310' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155976',
        definition: { category: '', label: 'XBJ', stcId: '10', flightNumber: 'W5 1049', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000008669' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 110,
          times: [{ stdLowerBound: 430, stdUpperBound: 550 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 110,
              times: [{ stdLowerBound: 430, stdUpperBound: 550 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 490, aircraftRegisterId: '7092902880000000306' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155945',
        definition: { category: '', label: 'YES', stcId: '10', flightNumber: 'W5 4522', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000009180' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 80,
          times: [{ stdLowerBound: 130, stdUpperBound: 250 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 80,
              times: [{ stdLowerBound: 130, stdUpperBound: 250 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 190, aircraftRegisterId: '7092902880000000306' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155981',
        definition: { category: '', label: 'IIL', stcId: '10', flightNumber: 'W5 4572', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000009181' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 80,
          times: [{ stdLowerBound: 460, stdUpperBound: 580 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 80,
              times: [{ stdLowerBound: 460, stdUpperBound: 580 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 520, aircraftRegisterId: '7092902880000000910' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000156013',
        definition: { category: '', label: 'AFZ', stcId: '10', flightNumber: 'W5 4537', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000009473' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 75,
          times: [{ stdLowerBound: 735, stdUpperBound: 855 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 75,
              times: [{ stdLowerBound: 735, stdUpperBound: 855 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 795, aircraftRegisterId: '7092902880000000304' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155974',
        definition: { category: '', label: 'LFM', stcId: '10', flightNumber: 'W5 1001', departureAirportId: '7092901520000008191', arrivalAirportId: '7092901520000010170' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 105,
          times: [{ stdLowerBound: 390, stdUpperBound: 510 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 105,
              times: [{ stdLowerBound: 390, stdUpperBound: 510 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 450, aircraftRegisterId: '7092902880000000304' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000156005',
        definition: { category: '', label: 'XBJ', stcId: '10', flightNumber: 'W5 1048', departureAirportId: '7092901520000008669', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 125,
          times: [{ stdLowerBound: 600, stdUpperBound: 720 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 125,
              times: [{ stdLowerBound: 600, stdUpperBound: 720 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 660, aircraftRegisterId: '7092902880000000306' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155956',
        definition: { category: '', label: 'YES', stcId: '10', flightNumber: 'W5 4523', departureAirportId: '7092901520000009180', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 80,
          times: [{ stdLowerBound: 250, stdUpperBound: 370 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 80,
              times: [{ stdLowerBound: 250, stdUpperBound: 370 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000306' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 310, aircraftRegisterId: '7092902880000000306' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155996',
        definition: { category: '', label: 'IIL', stcId: '10', flightNumber: 'W5 4573', departureAirportId: '7092901520000009181', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 75,
          times: [{ stdLowerBound: 585, stdUpperBound: 705 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 75,
              times: [{ stdLowerBound: 585, stdUpperBound: 705 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000910' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 645, aircraftRegisterId: '7092902880000000910' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000156026',
        definition: { category: '', label: 'AFZ', stcId: '10', flightNumber: 'W5 4536', departureAirportId: '7092901520000009473', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 75,
          times: [{ stdLowerBound: 855, stdUpperBound: 975 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 75,
              times: [{ stdLowerBound: 855, stdUpperBound: 975 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 915, aircraftRegisterId: '7092902880000000304' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155993',
        definition: { category: '', label: 'LFM', stcId: '10', flightNumber: 'W5 1002', departureAirportId: '7092901520000010170', arrivalAirportId: '7092901520000008191' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 105,
          times: [{ stdLowerBound: 540, stdUpperBound: 660 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 105,
              times: [{ stdLowerBound: 540, stdUpperBound: 660 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000304' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 600, aircraftRegisterId: '7092902880000000304' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000156057',
        definition: { category: '', label: 'PVG', stcId: '10', flightNumber: 'W5 0077', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000003099' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 495,
          times: [{ stdLowerBound: 990, stdUpperBound: 1110 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001088' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 495,
              times: [{ stdLowerBound: 990, stdUpperBound: 1110 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001088' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 1050, aircraftRegisterId: '7092902880000001088' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155961',
        definition: { category: '', label: 'VKO', stcId: '10', flightNumber: 'W5 0084', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000004007' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 225,
          times: [{ stdLowerBound: 120, stdUpperBound: 240 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001088' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 225,
              times: [{ stdLowerBound: 120, stdUpperBound: 240 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001088' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 180, aircraftRegisterId: '7092902880000001088' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000156054',
        definition: { category: '', label: 'CAN', stcId: '10', flightNumber: 'W5 0081', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000005013' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 470,
          times: [{ stdLowerBound: 960, stdUpperBound: 1080 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000270' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 470,
              times: [{ stdLowerBound: 960, stdUpperBound: 1080 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000270' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 1020, aircraftRegisterId: '7092902880000000270' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000156043',
        definition: { category: '', label: 'DEL', stcId: '10', flightNumber: 'W5 0071', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000005317' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 290,
          times: [{ stdLowerBound: 750, stdUpperBound: 870 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001060' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 290,
              times: [{ stdLowerBound: 750, stdUpperBound: 870 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001060' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 810, aircraftRegisterId: '7092902880000001060' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155951',
        definition: { category: '', label: 'DXB1', stcId: '10', flightNumber: 'W5 0061', departureAirportId: '7092901520000001588', arrivalAirportId: '7092901520000005420' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 120,
          times: [{ stdLowerBound: 150, stdUpperBound: 270 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001060' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 120,
              times: [{ stdLowerBound: 150, stdUpperBound: 270 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001060' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 210, aircraftRegisterId: '7092902880000001060' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000156052',
        definition: { category: '', label: 'PVG', stcId: '10', flightNumber: 'W5 0076', departureAirportId: '7092901520000003099', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 570,
          times: [{ stdLowerBound: 840, stdUpperBound: 960 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000998' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 570,
              times: [{ stdLowerBound: 840, stdUpperBound: 960 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000998' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 900, aircraftRegisterId: '7092902880000000998' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155991',
        definition: { category: '', label: 'VKO', stcId: '10', flightNumber: 'W5 0085', departureAirportId: '7092901520000004007', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 210,
          times: [{ stdLowerBound: 420, stdUpperBound: 540 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001088' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 210,
              times: [{ stdLowerBound: 420, stdUpperBound: 540 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001088' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 480, aircraftRegisterId: '7092902880000001088' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000156050',
        definition: { category: '', label: 'CAN', stcId: '10', flightNumber: 'W5 0080', departureAirportId: '7092901520000005013', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 530,
          times: [{ stdLowerBound: 870, stdUpperBound: 990 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000970' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 530,
              times: [{ stdLowerBound: 870, stdUpperBound: 990 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000000970' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 930, aircraftRegisterId: '7092902880000000970' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000156055',
        definition: { category: '', label: 'DEL', stcId: '10', flightNumber: 'W5 0070', departureAirportId: '7092901520000005317', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 320,
          times: [{ stdLowerBound: 1135, stdUpperBound: 1255 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001060' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 320,
              times: [{ stdLowerBound: 1135, stdUpperBound: 1255 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001060' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 1195, aircraftRegisterId: '7092902880000001060' }
          }
        ],
        ignored: false
      },
      {
        id: '7092902000000155979',
        definition: { category: '', label: 'DXB1', stcId: '10', flightNumber: 'W5 0060', departureAirportId: '7092901520000005420', arrivalAirportId: '7092901520000001588' },
        scope: {
          rsx: 'REAL',
          originPermission: true,
          destinationPermission: true,
          blockTime: 120,
          times: [{ stdLowerBound: 420, stdUpperBound: 540 }],
          aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001060' }], forbiddenIdentities: [] },
          required: true
        },
        days: [
          {
            freezed: false,
            scope: {
              rsx: 'REAL',
              originPermission: true,
              destinationPermission: true,
              blockTime: 120,
              times: [{ stdLowerBound: 420, stdUpperBound: 540 }],
              aircraftSelection: { allowedIdentities: [{ type: 'REGISTER' as AircraftIdentityType, entityId: '7092902880000001060' }], forbiddenIdentities: [] },
              required: true
            },
            notes: 'somenotes...',
            day: 6,
            flight: { std: 480, aircraftRegisterId: '7092902880000001060' }
          }
        ],
        ignored: false
      }
    ],
    dummyAircraftRegisters: [],
    aircraftRegisterOptionsDictionary: {}
  });
}
