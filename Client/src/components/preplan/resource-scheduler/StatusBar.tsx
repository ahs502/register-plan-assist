import React, { FC, Fragment } from 'react';
import { Theme, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import FlightPack from 'src/business/flights/FlightPack';
import PreplanAircraftRegister from 'src/business/PreplanAircraftRegister';
import Weekday from '@core/types/Weekday';
import Daytime from '@core/types/Daytime';

const useStyles = makeStyles((theme: Theme) => ({
  typograghyOverline: {
    lineHeight: 0
  }
}));

export interface StatusBarProps {
  mode?: 'FLIGHT_PACK' | 'FREE_SPACE';
  flightPack?: FlightPack;
  aircraftRegister?: PreplanAircraftRegister;
  previousFlightPack?: FlightPack;
  nextFlightPack?: FlightPack;
}

const StatusBar: FC<StatusBarProps> = ({ mode, flightPack, aircraftRegister, previousFlightPack, nextFlightPack }) => {
  const classes = useStyles();

  if (mode == 'FLIGHT_PACK' && flightPack)
    return (
      <Fragment>
        <Typography display="inline" variant="button">
          {flightPack.label}
        </Typography>
        &nbsp;
        <Typography display="inline" variant="caption">
          {Weekday[flightPack.day]}s
        </Typography>
        &nbsp; &#9608; &nbsp;
        <Typography display="inline" variant="button">
          {flightPack.flights[0].departureAirport.name}
        </Typography>
        {flightPack.flights.map(f => (
          <Fragment>
            &nbsp;
            <Typography display="inline" variant="overline" classes={{ overline: classes.typograghyOverline }}>
              ({f.std.toString(true)})
            </Typography>
            &nbsp; &#8599; &nbsp;
            <Typography display="inline" variant="caption">
              {f.flightNumber}
            </Typography>
            &nbsp;
            <Typography display="inline" variant="overline" classes={{ overline: classes.typograghyOverline }}>
              ({new Daytime(f.blockTime).toString()})
            </Typography>
            &nbsp; &#8600; &nbsp;
            <Typography display="inline" variant="overline" classes={{ overline: classes.typograghyOverline }}>
              ({new Daytime(f.std.minutes + f.blockTime).toString(true)})
            </Typography>
            &nbsp;
            <Typography display="inline" variant="button">
              {f.arrivalAirport.name}
            </Typography>
          </Fragment>
        ))}
        {flightPack.notes && (
          <Fragment>
            &nbsp; &#9608; &nbsp;
            <Typography display="inline" variant="body2">
              {flightPack.notes}
            </Typography>
          </Fragment>
        )}
      </Fragment>
    );

  if (mode === 'FREE_SPACE' && aircraftRegister)
    return (
      <Fragment>
        <Typography display="inline" variant="button">
          {aircraftRegister.name}
        </Typography>
        &nbsp;
        {aircraftRegister.options.status === 'BACKUP' && (
          <Fragment>
            <Typography display="inline" variant="caption">
              Backup
            </Typography>
            &nbsp;
          </Fragment>
        )}
        &#9608; &nbsp;
        {previousFlightPack && nextFlightPack ? (
          <Fragment>
            <Typography display="inline" variant="caption">
              {previousFlightPack.flights[previousFlightPack.flights.length - 1].flightNumber}
            </Typography>
            &nbsp;
            <Typography display="inline" variant="button">
              {previousFlightPack.flights[previousFlightPack.flights.length - 1].arrivalAirport.name}
            </Typography>
            &nbsp;
            {previousFlightPack.day !== nextFlightPack.day && (
              <Fragment>
                <Typography display="inline" variant="caption">
                  {Weekday[previousFlightPack.flights[previousFlightPack.flights.length - 1].day]}s
                </Typography>
                &nbsp;
              </Fragment>
            )}
            <Typography display="inline" variant="overline" classes={{ overline: classes.typograghyOverline }}>
              (
              {new Daytime(
                previousFlightPack.flights[previousFlightPack.flights.length - 1].std.minutes + previousFlightPack.flights[previousFlightPack.flights.length - 1].blockTime
              ).toString(true)}
              )
            </Typography>
            &nbsp; &#8600; &nbsp;
            <Typography display="inline" variant="overline" classes={{ overline: classes.typograghyOverline }}>
              (
              {new Daytime(
                (nextFlightPack.day * 24 * 60 + nextFlightPack.start.minutes - previousFlightPack.day * 24 * 60 - previousFlightPack.end.minutes + 7 * 24 * 60) % (7 * 24 * 60)
              ).toString()}
              )
            </Typography>
            &nbsp; &#8599; &nbsp;
            <Typography display="inline" variant="overline" classes={{ overline: classes.typograghyOverline }}>
              ({nextFlightPack.flights[0].std.toString(true)})
            </Typography>
            &nbsp;
            {previousFlightPack.day !== nextFlightPack.day && (
              <Fragment>
                <Typography display="inline" variant="caption">
                  {Weekday[nextFlightPack.flights[0].day]}s
                </Typography>
                &nbsp;
              </Fragment>
            )}
            <Typography display="inline" variant="button">
              {nextFlightPack.flights[0].departureAirport.name}
            </Typography>
            &nbsp;
            <Typography display="inline" variant="caption">
              {nextFlightPack.flights[0].flightNumber}
            </Typography>
          </Fragment>
        ) : (
          <Fragment>
            <Typography display="inline" variant="caption">
              Base
            </Typography>
            &nbsp;
            <Typography display="inline" variant="button">
              {aircraftRegister.options.startingAirport!.name}
            </Typography>
            &nbsp;
            <Typography display="inline" variant="caption">
              Free!
            </Typography>
          </Fragment>
        )}
      </Fragment>
    );

  return <Fragment />;
};

export default StatusBar;
