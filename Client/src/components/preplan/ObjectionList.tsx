import React, { FC, Fragment } from 'react';
import { Theme, Card, CardContent, Typography, CardActions, Button, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import MahanIcon, { MahanIconType } from 'src/components/MahanIcon';
import Objection from 'src/business/constraints/Objection';
import PreplanAircraftRegister from 'src/business/preplan/PreplanAircraftRegister';
import FlightLeg from 'src/business/flight/FlightLeg';
import FlightRequirement from 'src/business/flight-requirement/FlightRequirement';
import DayFlightRequirement from 'src/business/flight-requirement/DayFlightRequirement';
import Objectionable from 'src/business/constraints/Objectionable';

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
  onClick(target: Objectionable): void;
}

const ObjectionList: FC<ObjectionListProps> = ({ objections, onClick }) => {
  const classes = useStyles();

  return (
    <Fragment>
      {objections.map(objection => (
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
            <Button color="primary" onClick={() => onClick(objection.target)}>
              {objection.target instanceof FlightLeg
                ? 'Flight'
                : objection.target instanceof DayFlightRequirement
                ? 'Flight Requirement'
                : objection.target instanceof FlightRequirement
                ? 'Flight Requirement'
                : objection.target instanceof PreplanAircraftRegister
                ? 'Aircraft Register'
                : '?'}
            </Button>
          </CardActions>
        </Card>
      ))}
    </Fragment>
  );
};

export default ObjectionList;
