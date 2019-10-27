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
import ObjectionModal, { ObjectionModalModel } from 'src/components/preplan/ObjectionModal';
import FlightRequirementModal, { FlightRequirementModalModel } from 'src/components/preplan/FlightRequirementModal';
import FlightRequirementService from 'src/services/FlightRequirementService';

const useStyles = makeStyles((theme: Theme) => ({}));

export const NavBarToolsContainerContext = createContext<HTMLDivElement | null>(null);
export const PreplanContext = createContext<Preplan>(null as any);

const PreplanPage: FC = () => {
  const [preplan, setPreplan] = useState<Preplan | null>(null);
  const [objectionModalModel, setObjectionModalModel] = useState<ObjectionModalModel>({});
  const [flightRequirementModalModel, setFlightRequirementModalModel] = useState<FlightRequirementModalModel>({});

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
            ? 'Back to Pre Plan List'
            : reportsProposalPageSelected || reportsConnectionsPageSelected
            ? `Back to Pre Plan ${preplan && preplan.name} Reports`
            : `Back to Pre Plan ${preplan && preplan.name}`
        }
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
            <Switch>
              <Redirect exact from={match.url} to={match.url + '/resource-scheduler'} />
              <Route
                exact
                path={match.path + '/resource-scheduler'}
                render={() => (
                  <ResourceSchedulerPage
                    reloadPreplan={newPreplanModel => {
                      if (newPreplanModel) return setPreplan(new Preplan(newPreplanModel, preplan));
                      PreplanService.get(match.params.id).then(
                        preplanModel => setPreplan(new Preplan(preplanModel, preplan)),
                        reason => {
                          console.error(reason);
                          // history.push('/preplan-list');
                        }
                      );
                    }}
                    onObjectionTargetClick={target => setObjectionModalModel({ open: true, target })}
                    onEditFlightRequirement={flightRequirement => setFlightRequirementModalModel({ open: true, sourceFlightRequirement: flightRequirement })}
                    onEditDayFlightRequirement={({ flightRequirement, day }) => setFlightRequirementModalModel({ open: true, sourceFlightRequirement: flightRequirement, day })}
                  />
                )}
              />
              <Route
                exact
                path={match.path + '/flight-requirement-list'}
                render={() => (
                  <FlightRequirementListPage
                    onAddFlightRequirement={() => setFlightRequirementModalModel({ open: true })}
                    onRemoveFlightRequirement={flightRequirement => alert('Not implemented.')}
                    onEditFlightRequirement={flightRequirement => setFlightRequirementModalModel({ open: true, sourceFlightRequirement: flightRequirement })}
                  />
                )}
              />
              <Route exact path={match.path + '/reports/:report?'} component={() => <ReportsPage />} />
              <Redirect to={match.url} />
            </Switch>
          </PreplanContext.Provider>
        </NavBarToolsContainerContext.Provider>
      )}

      <ObjectionModal model={objectionModalModel} onClose={() => setObjectionModalModel({ ...objectionModalModel, open: false })} />

      <FlightRequirementModal
        model={flightRequirementModalModel}
        onClose={() => setFlightRequirementModalModel({ ...flightRequirementModalModel, open: false })}
        onApply={async newFlightRequirementModel => {
          if (!preplan) return;
          setFlightRequirementModalModel({ ...flightRequirementModalModel, loading: true, errorMessage: undefined });
          try {
            const newPreplanModel = flightRequirementModalModel.sourceFlightRequirement
              ? await FlightRequirementService.edit(preplan.id, { id: flightRequirementModalModel.sourceFlightRequirement.id, ...newFlightRequirementModel }, [], []) //TODO: How about flights?
              : await FlightRequirementService.add(preplan.id, newFlightRequirementModel, []); //TODO: How about flights?
            setFlightRequirementModalModel(flightRequirementModalModel => ({ ...flightRequirementModalModel, loading: false, open: false }));
            setPreplan(new Preplan(newPreplanModel, preplan));
          } catch (reason) {
            setFlightRequirementModalModel(flightRequirementModalModel => ({ ...flightRequirementModalModel, loading: false, errorMessage: String(reason) }));
          }
        }}
      />
    </Fragment>
  );
};

export default PreplanPage;
