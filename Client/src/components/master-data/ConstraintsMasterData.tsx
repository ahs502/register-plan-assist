import React, { PureComponent, Fragment } from 'react';
import { WithStyles, createStyles, withStyles, Theme } from '@material-ui/core/styles';
import MasterDataList, { MasterDataItem } from './MasterDataList';
import { Typography, TextField, Grid, RadioGroup, Radio, FormControlLabel } from '@material-ui/core';
import MultiSelect from '../MultiSelect';

const styles = (theme: Theme) => createStyles({});

interface Props extends WithStyles<typeof styles> {}
interface State {
  items: MasterDataItem[];
  selectedItem?: MasterDataItem;
}

class ConstraintsMasterData extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      items: [
        { title: 'item 1', description: 'description for first item' },
        { title: 'item 2', description: 'description for second item' },
        { title: 'item 3', description: 'description for thirth item' },
        { title: 'item 4', description: 'description for forth item' }
      ],
      selectedItem: undefined
    };
  }

  private itemSelectHandler = (selectedItem: MasterDataItem) => {
    this.setState({ ...this.state, selectedItem });
  };
  private itemUnselectHandler = () => {
    this.setState({ ...this.state, selectedItem: undefined });
  };
  private itemAddHandler = () => {};
  private itemRemoveHandler = () => {};

  render() {
    const { items, selectedItem } = this.state;

    return (
      <MasterDataList
        items={items}
        masterDataTitle="Constraints"
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
                <MultiSelect label="Registers" placeholder="Select Registers" suggestions={registers} />
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
                <MultiSelect label="Registers" placeholder="Select Registers" suggestions={registers} />
              </Grid>
            </Grid>

            <Typography variant="caption">Date Filter</Typography>
          </Fragment>
        ) : (
          <em>[Select an item]</em>
        )}
      </MasterDataList>
    );
  }
}

const registers = [
  { label: 'MHA' },
  { label: 'MHE' },
  { label: 'MHF' },
  { label: 'MHG' },
  { label: 'MHI' },
  { label: 'MHJ' },
  { label: 'MHK' },
  { label: 'MHL' },
  { label: 'MHM' },
  { label: 'MHN' },
  { label: 'MHO' },
  { label: 'MHP' },
  { label: 'MHQ' },
  { label: 'MHR' },
  { label: 'MHS' },
  { label: 'MHZ' },
  { label: 'MMA' },
  { label: 'MMB' },
  { label: 'MMC' },
  { label: 'MMD' },
  { label: 'MME' },
  { label: 'MMF' },
  { label: 'MMH' },
  { label: 'MMI' },
  { label: 'MMJ' },
  { label: 'MMK' },
  { label: 'MML' },
  { label: 'MMN' },
  { label: 'MMO' },
  { label: 'MMP' },
  { label: 'MMQ' },
  { label: 'MMR' },
  { label: 'MMT' },
  { label: 'MMV' },
  { label: 'MMX' },
  { label: 'MNA' },
  { label: 'MNB' },
  { label: 'MNC' },
  { label: 'MND' },
  { label: 'MNE' },
  { label: 'MNF' },
  { label: 'MNG' },
  { label: 'MNH' },
  { label: 'MNI' },
  { label: 'MNJ' },
  { label: 'MNK' },
  { label: 'MNL' },
  { label: 'MNM' },
  { label: 'MNN' },
  { label: 'MNO' },
  { label: 'MNP' },
  { label: 'MNQ' },
  { label: 'MNR' },
  { label: 'MNS' },
  { label: 'MNT' },
  { label: 'MNU' },
  { label: 'MNV' },
  { label: 'MNW' },
  { label: 'MNX' },
  { label: 'MOB' },
  { label: 'MOC' },
  { label: 'MOD' },
  { label: 'MOE' },
  { label: 'MOF' },
  { label: 'MOG' },
  { label: 'MOH' },
  { label: 'MOI' },
  { label: 'MOK' },
  { label: 'MOL' },
  { label: 'MOM' },
  { label: 'MON' },
  { label: 'MOP' },
  { label: 'MOQ' },
  { label: 'MOR' },
  { label: 'MOS' }
].map(suggestion => ({
  value: suggestion.label,
  label: suggestion.label
}));

export default withStyles(styles)(ConstraintsMasterData);
