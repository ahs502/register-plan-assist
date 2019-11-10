import React, { FC, Fragment, useState, useEffect, useRef, createContext } from 'react';
import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Switch, Redirect, Route } from 'react-router-dom';
import useRouter from 'src/utils/useRouter';
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

  const { match } = useRouter<{ id: string }>();
  const classes = useStyles();

  useEffect(() => {
    PreplanService.get(match.params.id).then(
      preplanModel => setPreplan(new Preplan(preplanModel)),
      reason => {
        console.error(reason);
        // history.push('/preplan-list');
      }
    );
  }, [match.params.id]);

  const resourceSchedulerPageSelected = window.location.href.startsWith(`${window.location.origin}/#${match.url}/resource-scheduler`);
  const flightRequirementListPageSelected = window.location.href.startsWith(`${window.location.origin}/#${match.url}/flight-requirement-list`);
  const reportsPageSelected = window.location.href.startsWith(`${window.location.origin}/#${match.url}/reports`);
  const reportsProposalPageSelected = reportsPageSelected && window.location.hash.endsWith('/proposal');
  const reportsConnectionsPageSelected = reportsPageSelected && window.location.hash.endsWith('/connections');

  return (
    <Fragment>
      <NavBar
        backLink={resourceSchedulerPageSelected ? '/preplan-list' : reportsProposalPageSelected || reportsConnectionsPageSelected ? `${match.url}/reports` : match.url}
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
          reportsProposalPageSelected && {
            title: 'Proposal Report',
            link: `${match.url}/reports/proposal`
          },
          reportsConnectionsPageSelected && {
            title: 'Connections Report',
            link: `${match.url}/reports/connections`
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
                  setPreplan(new Preplan(newPreplanModel || (await PreplanService.get(match.params.id)), preplan));
                } catch (reason) {
                  console.error(reason);
                  // history.push('/preplan-list');
                }
              }}
            >
              <Switch>
                <Redirect exact from={match.url} to={match.url + '/resource-scheduler'} />
                <Route
                  exact
                  path={match.path + '/resource-scheduler'}
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
                  path={match.path + '/flight-requirement-list'}
                  render={() => (
                    <FlightRequirementListPage
                      onAddFlightRequirement={() => openFlightRequirementModal({})}
                      onRemoveFlightRequirement={flightRequirement => openRemoveFlightRequirementModal({ flightRequirement })}
                      onEditFlightRequirement={flightRequirement => openFlightRequirementModal({ flightRequirement })}
                    />
                  )}
                />
                <Route exact path={match.path + '/reports/:report?'} component={() => <ReportsPage />} />
                <Redirect to={match.url} />
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
