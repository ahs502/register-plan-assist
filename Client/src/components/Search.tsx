import React, { PureComponent, ChangeEvent } from 'react';
import { Theme, createStyles, WithStyles, withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';

const styles = (theme: Theme) => createStyles({});

interface Props extends WithStyles<typeof styles> {
  initialValue?: string;
  onQueryChange?: (query: string[]) => void;
}
interface State {
  value: string;
}

class Search extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      value: props.initialValue || ''
    };
    this.changeQuery();
  }

  private onChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    this.setState(() => ({ value }), this.changeQuery);
  };

  private changeQuery = () => {
    const { onQueryChange } = this.props;
    if (Boolean(onQueryChange)) {
      const query = this.state.value
        .toLowerCase()
        .split(' ')
        .filter(Boolean);
      (onQueryChange as Function)(query);
    }
  };

  render() {
    const { value } = this.state;

    return (
      <Grid spacing={8} alignItems="flex-end">
        <Grid item>
          <i className="icon-search" />
        </Grid>
        <Grid item>
          <TextField label="Search" value={value} onChange={this.onChangeHandler} />
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(Search);
