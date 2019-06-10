import React, { Fragment, FC, useState } from 'react';
import { Theme, Typography, TextField, Grid, RadioGroup, Radio, FormControlLabel } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import MultiSelect from '../MultiSelect';
import MasterDataItemList from './MasterDataItemList';
import Constraint from '../../business/master-data/Constraint';
import MasterData from '../../business/master-data';

const useStyles = makeStyles((theme: Theme) => ({}));

const ConstraintsMasterData: FC = () => {
  const [selectedItem, setSelectedItem] = useState<Constraint | undefined>(undefined);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const classes = useStyles();

  return (
    <MasterDataItemList<Constraint>
      collection={MasterData.all.constraints}
      collectionTitle="Constraints"
      selectedItem={selectedItem}
      onItemSelect={setSelectedItem}
      onItemUnselect={() => setSelectedItem(undefined)}
      onItemAdd={() => setAddModalOpen(true)}
      onItemRemove={item => alert('Not implemented.')}
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
};

export default ConstraintsMasterData;
