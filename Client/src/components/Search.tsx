import React, { PureComponent, ChangeEvent } from 'react';
import { Theme, createStyles, WithStyles, withStyles } from '@material-ui/core/styles';
import { Grid, TextField, InputAdornment } from '@material-ui/core';
import { Search as SearchIcon } from '@material-ui/icons';

const styles = (theme: Theme) => createStyles({});

interface Props extends WithStyles<typeof styles> {
  outlined?: boolean;
  initialSearch?: string;
  onQueryChange?: (query: string[]) => void;
}
interface State {
  value: string;
}

class Search extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      value: props.initialSearch || ''
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
    const { outlined } = this.props;
    const { value } = this.state;

    return (
      <React.Fragment>
        <span>
          {outlined || (
            <Grid spacing={8} alignItems="flex-end" container>
              <Grid item>
                {/* <i className="icon-search" /> */}
                <SearchIcon />
              </Grid>
              <Grid item>
                <TextField label="Search" value={value} onChange={this.onChangeHandler} />
              </Grid>
            </Grid>
          )}
        </span>
        <span>
          {outlined && (
            <TextField
              placeholder="Search"
              variant="outlined"
              margin="dense"
              value={value}
              onChange={this.onChangeHandler}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
          )}
        </span>
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(Search);

export function filterOnProperties<T>(items: T[], query: string[], properties: string[]): T[] {
  return items.filter(item => {
    for (let i = 0; i < properties.length; ++i) {
      for (let j = 0; j < query.length; ++j) {
        if (query[j].includes(((item as any)[properties[i]] as string).toLowerCase())) return true;
      }
    }
    return false;
  });
}
