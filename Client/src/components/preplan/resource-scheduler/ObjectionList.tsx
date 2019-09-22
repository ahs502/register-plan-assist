import React, { FC, Fragment } from 'react';
import { Theme, Card, CardContent, Typography, CardActions, Button, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import MahanIcon, { MahanIconType } from 'src/components/MahanIcon';
import classNames from 'classnames';
import Objection from 'src/business/constraints/Objection';
import Flight from 'src/business/flights/Flight';
import WeekdayFlightRequirement from 'src/business/flights/WeekdayFlightRequirement';
import FlightRequirement from 'src/business/flights/FlightRequirement';
import PreplanAircraftRegister from 'src/business/PreplanAircraftRegister';

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    marginTop: theme.spacing(2)
  },
  errorIcon: {
    color: theme.palette.extraColors.erroredFlight
  },
  warningIcon: {
    color: theme.palette.extraColors.warnedFlight
  }
}));

export interface ObjectionListProps {
  objections: readonly Objection[];
}

const ObjectionList: FC<ObjectionListProps> = ({ objections }) => {
  const classes = useStyles();

  return (
    <Fragment>
      {objections.orderBy('priority').map(objection => (
        <Card key={objection.derivedId} classes={{ root: classes.card }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs>
                <Typography variant="body1">{objection.message}</Typography>
              </Grid>
              <Grid item>
                {objection.type === 'ERROR' ? (
                  <MahanIcon type={MahanIconType.CancelButton} className={classes.errorIcon}></MahanIcon>
                ) : (
                  <MahanIcon type={MahanIconType.Alert} className={classes.warningIcon}></MahanIcon>
                )}
              </Grid>
            </Grid>
          </CardContent>
          <CardActions disableSpacing={true}>
            {objection.target instanceof Flight ? (
              <Button color="primary" onClick={() => alert('Not implemented.')}>
                Flight
              </Button>
            ) : objection.target instanceof WeekdayFlightRequirement ? (
              <Button color="primary" onClick={() => alert('Not implemented.')}>
                Weekday Flight Requirement
              </Button>
            ) : objection.target instanceof FlightRequirement ? (
              <Button color="primary" onClick={() => alert('Not implemented.')}>
                Flight Requirement
              </Button>
            ) : objection.target instanceof PreplanAircraftRegister ? (
              <Button color="primary" onClick={() => alert('Not implemented.')}>
                Aircraft Register
              </Button>
            ) : null}
          </CardActions>
        </Card>
      ))}
    </Fragment>
  );
};

export default ObjectionList;
