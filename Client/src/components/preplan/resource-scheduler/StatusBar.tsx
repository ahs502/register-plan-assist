import React, { FC, Fragment } from 'react';
import { Theme, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import Weekday from '@core/types/Weekday';
import Daytime from '@core/types/Daytime';
import Flight from 'src/business/flight/Flight';
import PreplanAircraftRegister from 'src/business/preplan/PreplanAircraftRegister';

const useStyles = makeStyles((theme: Theme) => ({
  typograghyOverline: {
    lineHeight: 0
  }
}));

export interface StatusBarProps {
  mode?: 'FLIGHT' | 'FREE_SPACE';
  flight?: Flight;
  aircraftRegister?: PreplanAircraftRegister;
  previousFlight?: Flight;
  nextFlight?: Flight;
}

const StatusBar: FC<StatusBarProps> = ({ mode, flight, aircraftRegister, previousFlight, nextFlight }) => {
  const classes = useStyles();

  if (mode == 'FLIGHT' && flight)
    return (
      <Fragment>
        <Typography display="inline" variant="button">
          {flight.label}
        </Typography>
        &nbsp;
        <Typography display="inline" variant="caption">
          {Weekday[flight.day]}s
        </Typography>
        &nbsp; &#9608; &nbsp;
        <Typography display="inline" variant="button">
          {flight.legs[0].departureAirport.name}
        </Typography>
        {flight.legs.map(l => (
          <Fragment key={l.derivedId}>
            &nbsp;
            <Typography display="inline" variant="overline" classes={{ overline: classes.typograghyOverline }}>
              {l.std.toString('H:mm', true)}
            </Typography>
            &nbsp; &#8599; &nbsp;
            <Typography display="inline" variant="caption">
              {l.flightNumber.standardFormat}
            </Typography>
            &nbsp;
            <Typography display="inline" variant="overline" classes={{ overline: classes.typograghyOverline }}>
              {new Daytime(l.blockTime).toString('H:mm')}
            </Typography>
            &nbsp; &#8600; &nbsp;
            <Typography display="inline" variant="overline" classes={{ overline: classes.typograghyOverline }}>
              {l.sta.toString('H:mm', true)}
            </Typography>
            &nbsp;
            <Typography display="inline" variant="button">
              {l.arrivalAirport.name}
            </Typography>
          </Fragment>
        ))}
        {flight.notes && (
          <Fragment>
            &nbsp; &#9608; &nbsp;
            <Typography display="inline" variant="body2">
              {flight.notes}
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
        {previousFlight && nextFlight ? (
          <Fragment>
            <Typography display="inline" variant="caption">
              {previousFlight.legs[previousFlight.legs.length - 1].flightNumber.standardFormat}
            </Typography>
            &nbsp;
            <Typography display="inline" variant="button">
              {previousFlight.legs[previousFlight.legs.length - 1].arrivalAirport.name}
            </Typography>
            &nbsp;
            {previousFlight.day !== nextFlight.day && (
              <Fragment>
                <Typography display="inline" variant="caption">
                  {Weekday[previousFlight.legs[previousFlight.legs.length - 1].day]}s
                </Typography>
                &nbsp;
              </Fragment>
            )}
            <Typography display="inline" variant="overline" classes={{ overline: classes.typograghyOverline }}>
              {previousFlight.legs[previousFlight.legs.length - 1].sta.toString('H:mm', true)}
            </Typography>
            &nbsp; &#8600; &nbsp;
            <Typography display="inline" variant="overline" classes={{ overline: classes.typograghyOverline }}>
              {new Daytime(
                (nextFlight.day * 24 * 60 + nextFlight.start.minutes - previousFlight.day * 24 * 60 - previousFlight.end.minutes + 7 * 24 * 60) % (7 * 24 * 60)
              ).toString('H:mm')}
            </Typography>
            &nbsp; &#8599; &nbsp;
            <Typography display="inline" variant="overline" classes={{ overline: classes.typograghyOverline }}>
              {nextFlight.legs[0].std.toString('H:mm', true)}
            </Typography>
            &nbsp;
            {previousFlight.day !== nextFlight.day && (
              <Fragment>
                <Typography display="inline" variant="caption">
                  {Weekday[nextFlight.legs[0].day]}s
                </Typography>
                &nbsp;
              </Fragment>
            )}
            <Typography display="inline" variant="button">
              {nextFlight.legs[0].departureAirport.name}
            </Typography>
            &nbsp;
            <Typography display="inline" variant="caption">
              {nextFlight.legs[0].flightNumber.standardFormat}
            </Typography>
          </Fragment>
        ) : (
          <Fragment>
            <Typography display="inline" variant="caption">
              Base
            </Typography>
            &nbsp;
            <Typography display="inline" variant="button">
              {aircraftRegister.options.baseAirport!.name}
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
