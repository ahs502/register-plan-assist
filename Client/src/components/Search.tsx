import React, { PureComponent, ChangeEvent, Fragment } from 'react';
import { Theme, createStyles, WithStyles, withStyles } from '@material-ui/core/styles';
import { TextField, InputAdornment } from '@material-ui/core';
import { Search as SearchIcon } from '@material-ui/icons';

const styles = (theme: Theme) =>
  createStyles({
    wrapper: {
      display: 'flex',
      alignItems: 'flex-end'
    },
    space: {
      width: theme.spacing.unit
    }
  });

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
    const { classes, outlined } = this.props;
    const { value } = this.state;

    return (
      <Fragment>
        {outlined || (
          <div className={classes.wrapper}>
            {/* <i className="icon-search" /> */}
            <SearchIcon />
            <span className={classes.space} />
            <TextField label="Search" value={value} fullWidth onChange={this.onChangeHandler} />
          </div>
        )}
        {outlined && (
          <TextField
            placeholder="Search"
            variant="outlined"
            margin="dense"
            fullWidth
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
      </Fragment>
    );
  }
}

export default withStyles(styles)(Search);

export function filterOnProperties<T>(items: T[], query: string[], properties: string[]): T[] {
  if (query.length === 0) return items;
  return items.filter(item => {
    for (let i = 0; i < properties.length; ++i) {
      for (let j = 0; j < query.length; ++j) {
        if ((((item as any)[properties[i]] as string) || '').toLowerCase().includes(query[j])) return true;
      }
    }
    return false;
  });
}
