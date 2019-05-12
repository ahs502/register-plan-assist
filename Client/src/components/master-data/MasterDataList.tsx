import React, { PureComponent } from 'react';
import { WithStyles, withStyles, createStyles, Theme } from '@material-ui/core/styles';
import classNames from 'classnames';
import Search, { filterOnProperties } from '../Search';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      alignItems: 'stretch',
      border: '1px solid brown',
      margin: 0,
      padding: 0,
      height: 'calc(100vh - 104px)'
    },
    list: {
      width: theme.spacing.unit * 64,
      border: 'none',
      borderRight: '1px solid grey',
      margin: 0,
      padding: 0,
      paddingTop: theme.spacing.unit * 2,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'stretch'
    },
    item: {
      minHeight: theme.spacing.unit * 6,
      backgroundColor: theme.palette.common.white
    },
    selectedItem: {
      backgroundColor: theme.palette.grey[400]
    },
    contents: {
      flexGrow: 1,
      margin: 0,
      padding: theme.spacing.unit * 2
    }
  });

export interface MasterDataItem {
  title: string;
  description?: string;
}

interface Props extends WithStyles<typeof styles> {
  items: MasterDataItem[];
  selectedItem?: MasterDataItem;
  onItemSelect?: (selectedItem: MasterDataItem) => void;
  onItemUnselect?: () => void;
}
interface State {
  filteredItems: MasterDataItem[];
}

class MasterDataList extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { filteredItems: props.items };
  }

  private queryChangeHandler = (query: string[]) => {
    const { items, onItemUnselect } = this.props;
    const filteredItems = filterOnProperties(items, query, ['title', 'description']);
    this.setState(() => ({ ...this.state, filteredItems }));
    if (onItemUnselect) {
      onItemUnselect();
    }
  };

  render() {
    const { classes, children, selectedItem, onItemSelect } = this.props;
    const { filteredItems } = this.state;

    function itemSelectHandler(item: MasterDataItem) {
      if (onItemSelect) {
        onItemSelect(item);
      }
    }

    return (
      <div className={classes.root}>
        <div className={classes.list}>
          <Search onQueryChange={this.queryChangeHandler} />
          <br />
          {filteredItems.map(item => (
            <div key={item.title} className={classNames(classes.item, { [classes.selectedItem]: item === selectedItem })}>
              <button onClick={() => itemSelectHandler(item)}>{item.title}</button>
              {item.description && <p>{item.description}</p>}
            </div>
          ))}
        </div>
        <div className={classes.contents}>{children}</div>
      </div>
    );
  }
}

export default withStyles(styles)(MasterDataList);
