import React, { FC, Fragment, useState, useContext } from 'react';
import { Theme, Portal } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { NavBarToolsContainerContext } from '../preplan';
import FlightRequirement, { WeekdayFlightRequirement } from '../../business/FlightRequirement';

const useStyles = makeStyles((theme: Theme) => ({}));

export interface FlightRequirementListPageProps {
  flightRequirements: ReadonlyArray<FlightRequirement>;
  onAddFlightRequirement: () => void;
  onRemoveFlightRequirement: (flightRequirement: FlightRequirement) => void;
  onEditFlightRequirement: (flightRequirement: FlightRequirement) => void;
  onAddReturnFlightRequirement: (flightRequirement: FlightRequirement) => void;
  onRemoveWeekdayFlightRequirement: (weekdayFlightRequirement: WeekdayFlightRequirement) => void;
  onEditWeekdayFlightRequirement: (weekdayFlightRequirement: WeekdayFlightRequirement) => void;
}

const FlightRequirementListPage: FC<FlightRequirementListPageProps> = ({
  flightRequirements,
  onAddFlightRequirement,
  onRemoveFlightRequirement,
  onEditFlightRequirement,
  onAddReturnFlightRequirement,
  onRemoveWeekdayFlightRequirement,
  onEditWeekdayFlightRequirement
}) => {
  const navBarToolsContainer = useContext(NavBarToolsContainerContext);

  const classes = useStyles();

  return (
    <Fragment>
      <Portal container={navBarToolsContainer}>
        <Fragment>
          Pre Plan FlightRequirements
          <button onClick={() => alert('Not implemented.')}>FR Modal</button>
        </Fragment>
      </Portal>
      Flight Requirement List...
    </Fragment>
  );
};

export default FlightRequirementListPage;
