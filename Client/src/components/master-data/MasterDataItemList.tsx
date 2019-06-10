import React, { Fragment, useState, PropsWithChildren, ReactElement } from 'react';
import { Theme, Typography, ListItem, List, ListItemText, ListItemSecondaryAction, IconButton, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Clear as ClearIcon, Add as AddIcon } from '@material-ui/icons';
import classNames from 'classnames';
import Search, { filterOnProperties } from '../Search';
import MasterDataItem, { MasterDataItems } from '../../business/master-data/MasterDataItem';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    alignItems: 'stretch',
    border: '1px solid brown',
    margin: 0,
    padding: 0,
    height: 'calc(100vh - 104px)'
  },
  list: {
    width: theme.spacing(64),
    border: 'none',
    borderRight: '1px solid grey',
    margin: 0,
    padding: 0,
    paddingTop: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch'
  },
  item: {
    minHeight: theme.spacing(6),
    backgroundColor: theme.palette.common.white
  },
  selectedItem: {
    backgroundColor: theme.palette.grey[400]
  },
  contents: {
    flexGrow: 1,
    margin: 0,
    padding: theme.spacing(2)
  },
  header: {
    padding: theme.spacing(0, 2)
  },
  search: {
    margin: theme.spacing(0, 2)
  }
}));

interface MasterDataItemListProps<T extends MasterDataItem> {
  collection: MasterDataItems<T>;
  collectionTitle: string;
  selectedItem?: T;
  onItemSelect?: (item: T) => void;
  onItemUnselect?: () => void;
  onItemAdd?: () => void;
  onItemRemove?: (item: T) => void;
}

const MasterDataItemList = <T extends MasterDataItem>({
  children,
  collection,
  collectionTitle,
  selectedItem,
  onItemSelect,
  onItemUnselect,
  onItemAdd,
  onItemRemove
}: PropsWithChildren<MasterDataItemListProps<T>>): ReactElement | null => {
  let [filteredItems, setFilteredItems] = useState(collection.items);

  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.list}>
        <Grid className={classes.header} container direction="row" justify="space-between" alignItems="center">
          <Grid item>
            <Typography variant="caption">{collectionTitle}</Typography>
          </Grid>
          <Grid item>
            {onItemAdd && (
              <IconButton color="primary" title="Add Preplan" onClick={() => onItemAdd && onItemAdd()}>
                <AddIcon fontSize="large" />
              </IconButton>
            )}
          </Grid>
        </Grid>
        <div className={classes.search}>
          <Search
            onQueryChange={query => {
              const filteredItems = filterOnProperties(collection.items, query, ['name', 'description']);
              onItemUnselect && onItemUnselect();
              setFilteredItems(filteredItems);
            }}
          />
        </div>
        <br />
        <List>
          {filteredItems.map(item => (
            <ListItem key={item.name} role={undefined} button onClick={() => onItemSelect && onItemSelect(item)}>
              <ListItemText
                primary={<Typography variant="subtitle2">{item.name}</Typography>}
                secondary={<Fragment>{item.description && <Typography component="span">{item.description}</Typography>}</Fragment>}
              />
              <ListItemSecondaryAction>
                <IconButton aria-label="Comments" onClick={() => onItemRemove && onItemRemove(item)}>
                  <ClearIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </div>
      <div className={classes.contents}>{children}</div>
    </div>
  );
};

export default MasterDataItemList;
