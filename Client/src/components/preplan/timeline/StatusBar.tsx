import React, { FC, Fragment } from 'react';
import { Theme, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import Weekday from '@core/types/Weekday';
import Daytime from '@core/types/Daytime';
import PreplanAircraftRegister from 'src/business/preplan/PreplanAircraftRegister';
import FlightView from 'src/business/flight/FlightView';
import { blue, grey, green } from '@material-ui/core/colors';
import classNames from 'classnames';

const useStyles = makeStyles((theme: Theme) => ({
  typograghyOverline: {
    lineHeight: 0
  },
  departure: {
    color: blue[400]
  },
  arrival: {
    color: green[400]
  },
  blockTime: {
    color: grey[400]
  }
}));

export interface StatusBarProps {
  mode?: 'FLIGHT_VIEW' | 'FREE_SPACE';
  flightView?: FlightView;
  aircraftRegister?: PreplanAircraftRegister;
  previousFlightView?: FlightView;
  nextFlightView?: FlightView;
}

const StatusBar: FC<StatusBarProps> = ({ mode, flightView, aircraftRegister, previousFlightView, nextFlightView }) => {
  const classes = useStyles();

  if (mode == 'FLIGHT_VIEW' && flightView)
    return (
      <Fragment>
        <Typography display="inline" variant="button">
          {flightView.label}
        </Typography>
        &nbsp;
        <Typography display="inline" variant="caption">
          {Weekday[flightView.day]}s
        </Typography>
        &nbsp; &#9608; &nbsp;
        <Typography display="inline" variant="button">
          {flightView.legs[0].departureAirport.name}
        </Typography>
        {flightView.legs.map(l => (
          <Fragment key={l.derivedId}>
            &nbsp;
            <Typography display="inline" variant="overline" className={classNames({ overline: classes.typograghyOverline }, classes.departure)}>
              {l.actualStd.toString('H:mm', true)}
            </Typography>
            &nbsp; &#8599; &nbsp;
            <Typography display="inline" variant="caption">
              {l.flightNumber.standardFormat}
            </Typography>
            &nbsp;
            <Typography display="inline" variant="overline" className={classNames({ overline: classes.typograghyOverline }, classes.blockTime)}>
              {new Daytime(l.blockTime).toString('H:mm')}
            </Typography>
            &nbsp; &#8600; &nbsp;
            <Typography display="inline" variant="overline" className={classNames({ overline: classes.typograghyOverline }, classes.arrival)}>
              {l.actualSta.toString('H:mm', true)}
            </Typography>
            &nbsp;
            <Typography display="inline" variant="button">
              {l.arrivalAirport.name}
            </Typography>
          </Fragment>
        ))}
        {flightView.notes && (
          <Fragment>
            &nbsp; &#9608; &nbsp;
            <Typography display="inline" variant="body2">
              {flightView.notes}
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
        {previousFlightView && nextFlightView ? (
          <Fragment>
            <Typography display="inline" variant="caption">
              {previousFlightView.legs[previousFlightView.legs.length - 1].flightNumber.standardFormat}
            </Typography>
            &nbsp;
            <Typography display="inline" variant="button">
              {previousFlightView.legs[previousFlightView.legs.length - 1].arrivalAirport.name}
            </Typography>
            &nbsp;
            {previousFlightView.day !== nextFlightView.day && (
              <Fragment>
                <Typography display="inline" variant="caption">
                  {Weekday[previousFlightView.legs[previousFlightView.legs.length - 1].actualArrivalDay]}s
                </Typography>
                &nbsp;
              </Fragment>
            )}
            <Typography display="inline" variant="overline" classes={{ overline: classes.typograghyOverline }}>
              {previousFlightView.legs[previousFlightView.legs.length - 1].actualSta.toString('H:mm', true)}
            </Typography>
            &nbsp; &#8600; &nbsp;
            <Typography display="inline" variant="overline" classes={{ overline: classes.typograghyOverline }}>
              {new Daytime(
                (nextFlightView.day * 24 * 60 +
                  nextFlightView.start.minutes -
                  previousFlightView.legs[previousFlightView.legs.length - 1].day * 24 * 60 -
                  previousFlightView.end.minutes +
                  7 * 24 * 60) %
                  (7 * 24 * 60)
              ).toString('H:mm')}
            </Typography>
            &nbsp; &#8599; &nbsp;
            <Typography display="inline" variant="overline" classes={{ overline: classes.typograghyOverline }}>
              {nextFlightView.legs[0].actualStd.toString('H:mm', true)}
            </Typography>
            &nbsp;
            {previousFlightView.day !== nextFlightView.day && (
              <Fragment>
                <Typography display="inline" variant="caption">
                  {Weekday[nextFlightView.legs[0].actualDepartureDay]}s
                </Typography>
                &nbsp;
              </Fragment>
            )}
            <Typography display="inline" variant="button">
              {nextFlightView.legs[0].departureAirport.name}
            </Typography>
            &nbsp;
            <Typography display="inline" variant="caption">
              {nextFlightView.legs[0].flightNumber.standardFormat}
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
