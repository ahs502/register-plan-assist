import React, { FC, Fragment, useState } from 'react';
import { Theme, DialogActions, DialogTitle, DialogContent, Button, TextField, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import MultiSelect from '../MultiSelect';
import DraggableDialog from '../DraggableDialog';
import MasterDataItemList from './MasterDataItemList';
import AircraftGroup from '../../business/master-data/AircraftGroup';
import MasterData from '../../business/master-data';
import AircraftRegister from '../../business/master-data/AircraftRegister';

const useStyles = makeStyles((theme: Theme) => ({
  overflowVisible: {
    overflow: 'visible'
  },
  aircraftGroupTitle: {
    margin: theme.spacing(2, 0)
  }
}));

const AircraftGroupsMasterData: FC = () => {
  const [selectedItem, setSelectedItem] = useState<AircraftGroup | undefined>(undefined);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const registers = MasterData.all.aircraftRegisters.items;
  const [groupRegisters, setGroupRegisters] = useState<ReadonlyArray<AircraftRegister>>(registers);
  const classes = useStyles();

  return (
    <Fragment>
      <MasterDataItemList<AircraftGroup>
        collection={MasterData.all.aircraftGroups}
        collectionTitle="Aircraft Groups"
        selectedItem={selectedItem}
        onItemSelect={setSelectedItem}
        onItemAdd={() => setIsAddModalOpen(true)}
        onItemRemove={item => alert('Not implemented.')}
      >
        {selectedItem ? (
          <div>
            <Typography classes={{ root: classes.aircraftGroupTitle }} variant="subtitle2">
              {selectedItem.name}
            </Typography>
            <MultiSelect
              label="Registers"
              placeholder="Select Registers"
              options={registers}
              value={groupRegisters}
              getOptionLabel={r => r.name}
              getOptionValue={r => r.id}
              onChange={(value, action) => {
                console.log(value);
                setGroupRegisters(value as ReadonlyArray<AircraftRegister>);
              }}
            />
          </div>
        ) : (
          <Typography classes={{ root: classes.aircraftGroupTitle }} variant="subtitle2">
            Please select an aircraft group
          </Typography>
        )}
      </MasterDataItemList>
      <DraggableDialog open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-add-aircraft-group">What is the new Aircraft Group?</DialogTitle>
        <DialogContent classes={{ root: classes.overflowVisible }}>
          {/* <DialogContentText>To subscribe to this website, please enter your email address here. We will send updates occasionally.</DialogContentText> */}
          <TextField id="groupname" label="Name" fullWidth />
          <MultiSelect label="Registers" placeholder="Select Registers" options={registers} getOptionLabel={r => r.name} getOptionValue={r => r.id} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddModalOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)} color="primary">
            Add
          </Button>
        </DialogActions>
      </DraggableDialog>
    </Fragment>
  );
};

export default AircraftGroupsMasterData;
