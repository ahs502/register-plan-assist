import React, { PureComponent, Fragment } from 'react';
import { Theme, createStyles, WithStyles, withStyles } from '@material-ui/core/styles';
import { RouteComponentProps } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import FlightRequirementDialog from '../../components/preplan/FlightRequirementDialog';
import FlightRequirement from '../../business/FlightRequirement';

const styles = (theme: Theme) => createStyles({});

interface Props extends WithStyles<typeof styles>, RouteComponentProps<{ id?: string }> {}
interface State {
  isFlightRequirementDialogOpen: boolean;
}

class FlightRequirementsPage extends PureComponent<Props, State> {
  state = {
    isFlightRequirementDialogOpen: false
  };

  getId = (): number => Number(this.props.match.params.id);

  openFlightRequirementDialog = () => {
    this.setState({ ...this.state, isFlightRequirementDialogOpen: true });
  };

  flightRequirementDialogSubmitHandler = (flightRequirement: FlightRequirement) => {
    this.setState({ ...this.state, isFlightRequirementDialogOpen: false });
  };
  flightRequirementDialogDismissHandler = () => {
    this.setState({ ...this.state, isFlightRequirementDialogOpen: false });
  };

  render() {
    const { isFlightRequirementDialogOpen } = this.state;

    return (
      <Fragment>
        <NavBar
          backLink={'/preplan/' + this.getId()}
          navBarLinks={[
            {
              title: 'Pre Plan ' + this.getId(),
              link: `/preplan/${this.getId()}`
            },
            {
              title: 'Flight Requirements'
            }
          ]}
        >
          Pre Plan {this.getId()} FlightRequirements
          <button onClick={this.openFlightRequirementDialog}>FRD</button>
        </NavBar>
        <FlightRequirementDialog
          flightRequirement={undefined}
          open={isFlightRequirementDialogOpen}
          onSubmit={this.flightRequirementDialogSubmitHandler}
          onDismiss={this.flightRequirementDialogDismissHandler}
        />
      </Fragment>
    );
  }
}

export default withStyles(styles)(FlightRequirementsPage);
