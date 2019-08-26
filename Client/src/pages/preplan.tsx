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
import MasterData, { Stc, Airport } from '@core/master-data';
import FlightRequirement from 'src/view-models/flights/FlightRequirement';
import FlightTime from 'src/view-models/flights/FlightTime';
import AircraftIdentityType from '@core/types/aircraft-identity/AircraftIdentityType';
import Rsx from '@core/types/flight-requirement/Rsx';
import PreplanService from 'src/services/PreplanService';
import FlightRequirementModel, { FlightRequirementValidation } from '@core/models/flights/FlightRequirementModel';
import { number } from 'prop-types';
import FlightTimeModel from '@core/models/flights/FlightTimeModel';
import { parseAirport, parseHHMM, parseMinute } from 'src/utils/model-parsers';
import WeekdayFlightRequirementModel from '@core/models/flights/WeekdayFlightRequirementModel';
import { FlightScopeModel } from '@core/models/flights/FlightScopeModel';

const useStyles = makeStyles((theme: Theme) => ({
  flightRequirementStyle: {
    height: 830
  }
}));

export const NavBarToolsContainerContext = createContext<HTMLDivElement | null>(null);

export interface FlightRequirementModalModel {
  open: boolean;
  loading: boolean;
  errorMessage?: string;
  flightRequirement?: FlightRequirement;
  weekly?: boolean;
  day?: number;
  days?: boolean[];
  unavailableDays?: boolean[];
  label?: string;
  flightNumber?: string;
  departureAirport?: string;
  arrivalAirport?: string;
  blockTime?: string;
  times?: { stdLowerBound: string; stdUpperBound: string }[];
  allowedAircraftIdentities?: Partial<PreplanAircraftIdentity>[];
  forbiddenAircraftIdentities?: Partial<PreplanAircraftIdentity>[];
  originPermission?: boolean;
  destinationPermission?: boolean;
  notes?: string;
  required?: boolean;
  rsx?: Rsx;
  stc?: Stc;
  category?: string;
}

const PreplanPage: FC = () => {
  const [preplan, setPreplan] = useState<Preplan | null>(null);
  const [showContents, setShowContents] = useState(false);
  const [flightRequirementModalModel, setFlightRequirementModalModel] = useState<FlightRequirementModalModel>({ open: false, loading: false });
  const [flightRequirements, setFlightRequirements] = useState<FlightRequirement[]>([]);
  const navBarToolsRef = useRef<HTMLDivElement>(null);

  const classes = useStyles();
  const { match, history } = useRouter<{ id: string }>();

  useEffect(() => {
    //TODO: Load preplan by match.params.id from server if not loaded yet.
    //TODO: Go back to preplan list when not succeeded:
    // history.push('/preplan-list');

    !preplan &&
      PreplanService.get(match.params.id).then(p => {
        if (p.message) {
        } else {
          setPreplan(new Preplan(p.value!));
        }
      });
  }, []);

  useEffect(() => setShowContents(true), []);

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
                  onEditFlightRequirement={f => setFlightRequirementModalModel({ ...flightRequirementModalModel, open: true, flightRequirement: f, weekly: true /*TODO*/ })}
                  onEditWeekdayFlightRequirement={f =>
                    setFlightRequirementModalModel({ ...flightRequirementModalModel, open: true, flightRequirement: f.requirement, weekly: false /*TODO*/ })
                  }
                />
              )}
            />
            <Route
              exact
              path={match.path + '/flight-requirement-list'}
              render={() => (
                <FlightRequirementListPage
                  flightRequirements={flightRequirements!}
                  onAddFlightRequirement={() => {
                    const modalModel = initializeFlightRequirementModalModel();
                    modalModel.open = true;
                    modalModel.weekly = true;
                    setFlightRequirementModalModel(modalModel);
                  }}
                  onRemoveFlightRequirement={f => alert('Not implemented.\nOpen Y/N modal.')}
                  onEditFlightRequirement={f => setFlightRequirementModalModel({ ...flightRequirementModalModel, open: true, flightRequirement: f, weekly: true /*TODO*/ })}
                  onAddReturnFlightRequirement={f => setFlightRequirementModalModel({ ...flightRequirementModalModel, open: true, weekly: true /*TODO*/ })}
                  onRemoveWeekdayFlightRequirement={f => alert('Not implemented.\nOpen Y/N modal.')}
                  onEditWeekdayFlightRequirement={f =>
                    setFlightRequirementModalModel({ ...flightRequirementModalModel, open: true, flightRequirement: f.requirement, weekly: false /*TODO*/ })
                  }
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
        open={flightRequirementModalModel.open}
        onClose={() => setFlightRequirementModalModel({ ...flightRequirementModalModel, open: false })}
        aria-labelledby="form-dialog-title"
      >
        <FlightRequirementEditor
          model={flightRequirementModalModel}
          mode="add"
          loading={flightRequirementModalModel.loading}
          onSave={async fr => {
            setFlightRequirementModalModel({ ...flightRequirementModalModel, loading: true, errorMessage: undefined });

            const scope: FlightScopeModel = {
              blockTime: parseHHMM(fr.blockTime),
              times: fr.times!.map(t => {
                return { stdLowerBound: parseHHMM(t.stdLowerBound), stdUpperBound: parseHHMM(t.stdUpperBound) } as FlightTimeModel;
              }),
              destinationPermission: !!flightRequirementModalModel.destinationPermission,
              originPermission: !!flightRequirementModalModel.originPermission,
              required: !!flightRequirementModalModel.required,
              rsx: flightRequirementModalModel.rsx!,
              aircraftSelection: {
                allowedIdentities: [],
                forbiddenIdentities: []
              }
            };

            const model: FlightRequirementModel = {
              definition: {
                label: fr.label || '',
                category: fr.category || '',
                stcId: fr.stc ? fr.stc.id : '',
                flightNumber: fr.flightNumber || '',
                departureAirportId: parseAirport(fr.departureAirport)!,
                arrivalAirportId: parseAirport(fr.arrivalAirport)!
              },
              scope: scope,
              days: fr.days!.map((d, index) => ({ day: index, notes: fr.notes, scope: scope, freezed: false } as WeekdayFlightRequirementModel)),
              ignored: false
            };

            const validation = new FlightRequirementValidation(model, preplan!.aircraftRegisters.items.map(a => a.id));
            if (!validation.ok) {
              //TODO: Show error messages of form fields.
              setFlightRequirementModalModel({ ...flightRequirementModalModel, loading: false });
              return;
            }

            const result = await PreplanService.addFlightRequirement(preplan!.id, model);

            if (result.message) {
              setFlightRequirementModalModel({ ...flightRequirementModalModel, loading: false, errorMessage: result.message });
            } else {
              setFlightRequirementModalModel({ ...flightRequirementModalModel, loading: false, open: false });
              //TODO: hesam update list
            }
          }}
          onCancel={() => setFlightRequirementModalModel({ ...flightRequirementModalModel, open: false })}
        />
      </DraggableDialog>
    </Fragment>
  );
};

export default PreplanPage;

function initializeFlightRequirementModalModel(flightRequirement?: FlightRequirement) {
  const modalModel: FlightRequirementModalModel = {
    open: false,
    loading: false
  };

  if (!flightRequirement) return modalModel;

  const days = Array.range(0, 6).map(() => false);
  flightRequirement.days.map(d => d.day).forEach(n => (days[n] = true));

  modalModel.flightRequirement = flightRequirement;
  modalModel.days = days;
  modalModel.allowedAircraftIdentities = [...flightRequirement.scope.aircraftSelection.allowedIdentities!];
  modalModel.forbiddenAircraftIdentities = [...flightRequirement.scope.aircraftSelection.forbiddenIdentities!];
  modalModel.arrivalAirport = flightRequirement.definition.arrivalAirport.name;
  modalModel.departureAirport = flightRequirement.definition.departureAirport.name;
  modalModel.blockTime = parseMinute(flightRequirement.scope.blockTime);
  modalModel.category = flightRequirement.definition.category;
  modalModel.destinationPermission = flightRequirement.scope.destinationPermission;
  modalModel.flightNumber = flightRequirement.definition.flightNumber;
  modalModel.label = flightRequirement.definition.label;
  //modalModel.notes =
  modalModel.originPermission = flightRequirement.scope.originPermission;
  modalModel.required = flightRequirement.scope.required;
  modalModel.rsx = flightRequirement.scope.rsx;
  modalModel.stc = flightRequirement.definition.stc;
  modalModel.times = flightRequirement.scope.times.map(t => ({ stdLowerBound: parseMinute(t.stdLowerBound.minutes), stdUpperBound: parseMinute(t.stdUpperBound.minutes) }));
  //modalModel.unavailableDays =

  return modalModel;
}
