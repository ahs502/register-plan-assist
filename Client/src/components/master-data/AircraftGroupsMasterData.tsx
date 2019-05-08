import React, { FunctionComponent } from 'react';
import { WithStyles, createStyles, withStyles, Theme } from '@material-ui/core/styles';

const styles = (theme: Theme) => createStyles({});

interface Props extends WithStyles<typeof styles> {}

const AircraftGroupsMasterData: FunctionComponent<Props> = (props: Props) => {
  return <div>Aircraft Groups Master Data Content</div>;
};

export default withStyles(styles)(AircraftGroupsMasterData);
