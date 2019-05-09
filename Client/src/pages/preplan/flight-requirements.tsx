import React, { PureComponent } from 'react';
import { Theme, createStyles, WithStyles, withStyles } from '@material-ui/core/styles';
import { RouteComponentProps } from 'react-router-dom';
import NavBar from '../../components/NavBar';

const styles = (theme: Theme) => createStyles({});

interface Props extends WithStyles<typeof styles>, RouteComponentProps<{ id?: string }> {}

class FlightRequirements extends PureComponent<Props> {
  getId = (): number => Number(this.props.match.params.id);

  render() {
    return (
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
      </NavBar>
    );
  }
}

export default withStyles(styles)(FlightRequirements);
