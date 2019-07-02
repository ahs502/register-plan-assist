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
import FlightRequirement, { FlightTime } from 'src/view-models/FlightRequirement';
import AircraftIdentity from '@core/types/AircraftIdentity';
import FlightRequirementEditor from 'src/components/preplan/flight-requirement/FlightRequirementEditor';

const useStyles = makeStyles((theme: Theme) => ({
  flightRequirementStyle: {
    height: '780px',
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
  allowedAircraftIdentities?: Partial<AircraftIdentity>[];
  forbiddenAircraftIdentities?: Partial<AircraftIdentity>[];
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

/////////////////////////////////////////////////////////////

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
    startDate: new Date().addDays(10).toJSON(),
    endDate: new Date().addDays(20).toJSON(),
    autoArrangerOptions: { minimumGroundTimeMode: 'AVERAGE', minimumGroundTimeOffset: 50 },
    flightRequirements: [],
    dummyAircraftRegisters: [],
    aircraftRegisterOptionsDictionary: {}
  });
}
