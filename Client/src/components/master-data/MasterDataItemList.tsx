import React, { Fragment, useState, PropsWithChildren, ReactElement } from 'react';
import { createStyles, Theme, WithTheme, withTheme } from '@material-ui/core/styles';
import { makeStyles } from '@material-ui/styles';
import { Typography, ListItem, List, ListItemText, ListItemSecondaryAction, IconButton, Grid } from '@material-ui/core';
import { Clear as ClearIcon, Add as AddIcon } from '@material-ui/icons';
import Search, { filterOnProperties } from '../Search';
import MasterDataItem, { MasterDataItems } from '../../business/master-data/MasterDataItem';
import classNames from 'classnames';

const useStyles = makeStyles((theme: Theme) =>
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
    },
    header: {
      padding: `0px  ${theme.spacing.unit * 2}px`
    },
    search: {
      margin: `0px  ${theme.spacing.unit * 2}px`
    }
  })
);

interface Props<T extends MasterDataItem> {
  collection: MasterDataItems<T>;
  collectionTitle: string;
  selectedItem?: T;
  onItemSelect?: (item: T) => void;
  onItemUnselect?: () => void;
  onItemAdd?: () => void;
  onItemRemove?: (item: T) => void;
}

const MasterDataItemList = <T extends MasterDataItem>(props: PropsWithChildren<Props<T>>): ReactElement | null => {
  const { children, collection, collectionTitle, selectedItem, onItemSelect, onItemAdd, onItemRemove } = props;

  let [filteredItems, setFilteredItems] = useState<ReadonlyArray<T>>(props.collection.items);

  const classes = useStyles();

  function itemSelectHandler(item: T) {
    onItemSelect && onItemSelect(item);
  }
  function itemAddHandler() {
    onItemAdd && onItemAdd();
  }
  function itemRemoveHandler(item: T) {
    onItemRemove && onItemRemove(item);
  }
  function queryChangeHandler(query: ReadonlyArray<string>) {
    const { collection, onItemUnselect } = props;
    const filteredItems = filterOnProperties(collection.items, query, ['name', 'description']);
    onItemUnselect && onItemUnselect();
    setFilteredItems(filteredItems);
  }

  return (
    <div className={classes.root}>
      <div className={classes.list}>
        <Grid className={classes.header} container direction="row" justify="space-between" alignItems="center">
          <Grid item>
            <Typography variant="caption">{collectionTitle}</Typography>
          </Grid>
          <Grid item>
            {onItemAdd && (
              <IconButton color="primary" title="Add Preplan" onClick={itemAddHandler}>
                <AddIcon fontSize="large" />
              </IconButton>
            )}
          </Grid>
        </Grid>
        <Search classes={{ root: classes.search }} onQueryChange={queryChangeHandler} />
        <br />
        <List>
          {filteredItems.map(item => (
            <ListItem key={item.name} role={undefined} button onClick={() => itemSelectHandler(item)}>
              <ListItemText
                primary={<Typography variant="subtitle2">{item.name}</Typography>}
                secondary={<Fragment>{item.description && <Typography component="span">{item.description}</Typography>}</Fragment>}
              />
              <ListItemSecondaryAction>
                <IconButton aria-label="Comments" onClick={() => itemRemoveHandler(item)}>
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
