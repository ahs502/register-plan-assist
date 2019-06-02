import React, { PureComponent, Fragment } from 'react';
import { WithStyles, createStyles, withStyles, Theme } from '@material-ui/core/styles';
import { Typography, TextField, Grid, RadioGroup, Radio, FormControlLabel } from '@material-ui/core';
import MultiSelect from '../MultiSelect';
import MasterDataItemList from './MasterDataItemList';
import Constraint from '../../business/master-data/Constraint';
import MasterData from '../../business/master-data';

const styles = (theme: Theme) => createStyles({});

interface Props extends WithStyles<typeof styles> {}
interface State {
  selectedItem?: Constraint;
  isAddModalOpen: boolean;
}

class ConstraintsMasterData extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      selectedItem: undefined,
      isAddModalOpen: false
    };
  }

  private itemSelectHandler = (item: Constraint) => {
    this.setState({ selectedItem: item });
  };
  private itemUnselectHandler = () => {
    this.setState({ selectedItem: undefined });
  };
  private itemAddHandler = () => {
    this.setState({ isAddModalOpen: true });
  };
  private itemRemoveHandler = (item: Constraint) => {
    alert('Not implemented.');
  };
  private addModalCloseHandler = () => {
    this.setState({ isAddModalOpen: false });
  };
  private addAircraftGroup = () => {
    this.setState({ isAddModalOpen: true });
  };

  render() {
    const { classes } = this.props;
    const { selectedItem } = this.state;

    return (
      <MasterDataItemList<Constraint>
        collection={MasterData.all.constraints}
        collectionTitle="Constraints"
        selectedItem={selectedItem}
        onItemSelect={this.itemSelectHandler}
        onItemUnselect={this.itemUnselectHandler}
        onItemAdd={this.itemAddHandler}
        onItemRemove={this.itemRemoveHandler}
      >
        {selectedItem ? (
          <Fragment>
            <Typography variant="caption">Caption</Typography>
            <TextField fullWidth margin="dense" label="Title" />
            <TextField fullWidth multiline rowsMax="4" margin="dense" label="Details" />
            <Typography variant="caption">Constraint Template</Typography>
            <Typography variant="body1">Aircrafts Restriction on Airports</Typography>
            <Typography variant="body2">When planning the flight of the</Typography>

            <Grid container direction="row" alignItems="flex-end" spacing={8}>
              <Grid item xs={1}>
                <Typography variant="body2">Airports(s)</Typography>
              </Grid>
              <Grid item xs={11}>
                {/* <MultiSelect label="Registers" placeholder="Select Registers" suggestions={registers} /> */}
              </Grid>
            </Grid>

            <Grid container direction="row" alignItems="center" spacing={8}>
              <Grid item xs={1}>
                <RadioGroup>
                  <FormControlLabel value="Only" control={<Radio />} label="Only" />
                  <FormControlLabel value="Never" control={<Radio />} label="Never" />
                </RadioGroup>
              </Grid>
              <Grid item xs={2}>
                <Typography variant="body2">Use the aircraft(s)</Typography>
              </Grid>
              <Grid item xs={9}>
                {/* <MultiSelect label="Registers" placeholder="Select Registers" suggestions={registers} /> */}
              </Grid>
            </Grid>

            <Typography variant="caption">Date Filter</Typography>
          </Fragment>
        ) : (
          <em>[Select an item]</em>
        )}
      </MasterDataItemList>
    );
  }
}

export default withStyles(styles)(ConstraintsMasterData);
