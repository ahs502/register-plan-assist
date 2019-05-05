import React, { PureComponent } from 'react';
import { Theme, createStyles, WithStyles, withStyles } from '@material-ui/core/styles';
import { RouteComponentProps } from 'react-router-dom';

const styles = (theme: Theme) => createStyles({});

interface Props extends WithStyles<typeof styles>, RouteComponentProps<{ id?: string }> {}

class Proposal extends PureComponent<Props> {
  getId = (): number => Number(this.props.match.params.id);

  render() {
    return <div>Pre Plan {this.getId()} Reports Proposal</div>;
  }
}

export default withStyles(styles)(Proposal);
