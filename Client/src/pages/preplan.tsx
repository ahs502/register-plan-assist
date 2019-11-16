import React, { FC, Fragment, useState, useEffect, useRef, createContext } from 'react';
import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Switch, Redirect, Route, useRouteMatch } from 'react-router-dom';
import NavBar from 'src/components/NavBar';
import ResourceSchedulerPage from 'src/pages/preplan/resource-scheduler';
import FlightRequirementListPage from 'src/pages/preplan/flight-requirement-list';
import ReportsPage from 'src/pages/preplan/reports';
import PreplanService from 'src/services/PreplanService';
import Preplan from 'src/business/preplan/Preplan';
import ObjectionModal, { useObjectionModalState } from 'src/components/preplan/ObjectionModal';
import FlightRequirementModal, { useFlightRequirementModalState } from 'src/components/preplan/FlightRequirementModal';
import RemoveFlightRequirementModal, { useRemoveFlightRequirementModalState } from 'src/components/preplan/RemoveFlightRequirementModal';
import PreplanModel from '@core/models/preplan/PreplanModel';

const useStyles = makeStyles((theme: Theme) => ({}));

export const NavBarToolsContainerContext = createContext<HTMLDivElement | null>(null);
export const PreplanContext = createContext<Preplan>(null as any);
export const ReloadPreplanContext = createContext<(newPreplanModel?: PreplanModel) => Promise<void>>(null as any);

const PreplanPage: FC = () => {
  const [preplan, setPreplan] = useState<Preplan | null>(null);
  const [objectionModalState, openObjectionModal, closeObjectionModal] = useObjectionModalState();
  const [flightRequirementModalState, openFlightRequirementModal, closeFlightRequirementModal] = useFlightRequirementModalState();
  const [removeFlightRequirementModalState, openRemoveFlightRequirementModal, closeRemoveFlightRequirementModal] = useRemoveFlightRequirementModalState();

  const navBarToolsRef = useRef<HTMLDivElement>(null);

  const routeMatch = useRouteMatch<{ id: string }>()!;
  const classes = useStyles();

  useEffect(() => {
    PreplanService.get(routeMatch.params.id).then(
      preplanModel => setPreplan(new Preplan(preplanModel)),
      reason => {
        console.error(reason);
        // history.push('/preplan-list');
      }
    );
  }, [routeMatch.params.id]);

  const resourceSchedulerPageSelected = window.location.href.startsWith(`${window.location.origin}/#${routeMatch.url}/resource-scheduler`);
  const flightRequirementListPageSelected = window.location.href.startsWith(`${window.location.origin}/#${routeMatch.url}/flight-requirement-list`);
  const reportsPageSelected = window.location.href.startsWith(`${window.location.origin}/#${routeMatch.url}/reports`);
  const reportsProposalPageSelected = reportsPageSelected && window.location.hash.endsWith('/proposal');
  const reportsConnectionsPageSelected = reportsPageSelected && window.location.hash.endsWith('/connections');

  return (
    <Fragment>
      <NavBar
        backLink={resourceSchedulerPageSelected ? '/preplan-list' : reportsProposalPageSelected || reportsConnectionsPageSelected ? `${routeMatch.url}/reports` : routeMatch.url}
        backTitle={
          resourceSchedulerPageSelected
            ? 'Back to Preplan List'
            : reportsProposalPageSelected || reportsConnectionsPageSelected
            ? `Back to Preplan ${preplan && preplan.name} Reports`
            : `Back to Preplan ${preplan && preplan.name}`
        }
        navBarLinks={[
          {
            title: 'Preplans',
            link: '/preplan-list'
          },
          preplan && {
            title: preplan.name,
            link: routeMatch.url
          },
          flightRequirementListPageSelected && {
            title: 'Flight Requirements',
            link: `${routeMatch.url}/flight-requirement-list`
          },
          reportsPageSelected && {
            title: 'Reports',
            link: `${routeMatch.url}/reports`
          },
          reportsProposalPageSelected && {
            title: 'Proposal Report',
            link: `${routeMatch.url}/reports/proposal`
          },
          reportsConnectionsPageSelected && {
            title: 'Connections Report',
            link: `${routeMatch.url}/reports/connections`
          }
        ]}
      >
        <div ref={navBarToolsRef} />
      </NavBar>

      {preplan && (
        <NavBarToolsContainerContext.Provider value={navBarToolsRef.current}>
          <PreplanContext.Provider value={preplan}>
            <ReloadPreplanContext.Provider
              value={async newPreplanModel => {
                try {
                  const preplanModel = newPreplanModel || (await PreplanService.get(routeMatch.params.id));
                  const newPreplan = new Preplan(preplanModel, preplan);
                  setPreplan(newPreplan);
                } catch (reason) {
                  console.error(reason);
                  // history.push('/preplan-list');
                }
              }}
            >
              <Switch>
                <Redirect exact from={routeMatch.url} to={routeMatch.url + '/resource-scheduler'} />
                <Route
                  exact
                  path={routeMatch.path + '/resource-scheduler'}
                  render={() => (
                    <ResourceSchedulerPage
                      onObjectionTargetClick={target => openObjectionModal({ target })}
                      onEditFlightRequirement={flightRequirement => openFlightRequirementModal({ flightRequirement })}
                      onEditDayFlightRequirement={({ flightRequirement, day }) => openFlightRequirementModal({ flightRequirement, day })}
                    />
                  )}
                />
                <Route
                  exact
                  path={routeMatch.path + '/flight-requirement-list'}
                  render={() => (
                    <FlightRequirementListPage
                      onAddFlightRequirement={() => openFlightRequirementModal({})}
                      onRemoveFlightRequirement={flightRequirement => openRemoveFlightRequirementModal({ flightRequirement })}
                      onEditFlightRequirement={flightRequirement => openFlightRequirementModal({ flightRequirement })}
                    />
                  )}
                />
                <Route exact path={routeMatch.path + '/reports/:report?'} component={() => <ReportsPage />} />
                <Redirect to={routeMatch.url} />
              </Switch>

              <ObjectionModal state={objectionModalState} onClose={closeObjectionModal} />
              <FlightRequirementModal state={flightRequirementModalState} onClose={closeFlightRequirementModal} />
              <RemoveFlightRequirementModal state={removeFlightRequirementModalState} onClose={closeRemoveFlightRequirementModal} />
            </ReloadPreplanContext.Provider>
          </PreplanContext.Provider>
        </NavBarToolsContainerContext.Provider>
      )}
    </Fragment>
  );
};

export default PreplanPage;
