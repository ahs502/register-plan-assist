import React, { PureComponent, ChangeEvent, Fragment } from 'react';
import { Theme, createStyles, WithStyles, withStyles } from '@material-ui/core/styles';
import { TextField, InputAdornment } from '@material-ui/core';
import MahanIcon, { MahanIconType } from './MahanIcon';
import classNames from 'classnames';

const styles = (theme: Theme) =>
  createStyles({
    wrapper: {
      display: 'flex',
      alignItems: 'flex-end'
    },
    space: {
      width: theme.spacing.unit
    },
    root: {}
  });

interface Props extends WithStyles<typeof styles> {
  outlined?: boolean;
  initialSearch?: string;
  onQueryChange?: (query: ReadonlyArray<string>) => void;
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
    if (!onQueryChange) return;
    const query = this.state.value
      .toLowerCase()
      .split(' ')
      .filter(Boolean)
      .distinct();
    onQueryChange(query);
  };

  render() {
    const { classes, outlined } = this.props;
    const { value } = this.state;

    return (
      <Fragment>
        {outlined || (
          <div className={classNames(classes.wrapper, classes.root)}>
            <MahanIcon type={MahanIconType.Search} />
            <span className={classes.space} />
            <TextField label="Search" value={value} fullWidth onChange={this.onChangeHandler} />
          </div>
        )}
        {outlined && (
          <TextField
            className={classes.root}
            placeholder="Search"
            variant="outlined"
            margin="dense"
            fullWidth
            value={value}
            onChange={this.onChangeHandler}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MahanIcon type={MahanIconType.Search} />
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

export function filterOnProperties<K extends string, T extends { [key in K]?: string | undefined | null }>(
  items: ReadonlyArray<T>,
  query: ReadonlyArray<string>,
  properties: ReadonlyArray<K>
): ReadonlyArray<T> {
  if (query.length === 0) return items;
  return items.filter(item => {
    for (let i = 0; i < properties.length; ++i) {
      for (let j = 0; j < query.length; ++j) {
        if (((item[properties[i]] || '') as string).toLowerCase().includes(query[j])) return true;
      }
    }
    return false;
  });
}
