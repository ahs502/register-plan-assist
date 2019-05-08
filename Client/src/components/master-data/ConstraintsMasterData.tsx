import React, { FunctionComponent } from 'react';
import { WithStyles, createStyles, withStyles, Theme } from '@material-ui/core/styles';

const styles = (theme: Theme) => createStyles({});

interface Props extends WithStyles<typeof styles> {}

const ConstraintsMasterData: FunctionComponent<Props> = (props: Props) => {
  return <div>Constraints Master Data Content</div>;
};

export default withStyles(styles)(ConstraintsMasterData);
