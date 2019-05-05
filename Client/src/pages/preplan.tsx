import React, { PureComponent } from 'react';
import { WithStyles, createStyles, withStyles, Theme } from '@material-ui/core/styles';
import { RouteComponentProps } from 'react-router-dom';

const styles = (theme: Theme) => createStyles({});

interface Props extends WithStyles<typeof styles>, RouteComponentProps<{ id?: string }> {}

class Preplan extends PureComponent<Props> {
  getId = (): number => Number(this.props.match.params.id);

  render() {
    return <div>Pre Plan {this.getId()}</div>;
  }
}

export default withStyles(styles)(Preplan);
