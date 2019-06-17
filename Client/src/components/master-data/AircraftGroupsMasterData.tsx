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
    margin: theme.spacing(2, 0),
    padding: theme.spacing(2)
  },
  newAircraftGroupModalRegsiterStyle: {
    marginTop: theme.spacing(3)
  },
  newAircraftGroupModalButtonStyle: {
    marginTop: theme.spacing(2)
  },
  newAircraftGroupModalHeaderStyle: {
    marginTop: theme.spacing(1)
  },
  editRegisterStyle: {
    padding: theme.spacing(2)
  }
}));

const AircraftGroupsMasterData: FC = () => {
  const [selectedItem, setSelectedItem] = useState<AircraftGroup | undefined>(undefined);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const registers = MasterData.all.aircraftRegisters.items;
  const [groupRegisters, setGroupRegisters] = useState<ReadonlyArray<AircraftRegister>>();
  const [newAircraftGroupName, setNewAircraftGroupName] = useState('');
  const [newAircraftGroupRegisters, setNewAircraftGroupRegisters] = useState<ReadonlyArray<AircraftRegister>>();
  const classes = useStyles();

  const addAircraftGroup = () => {
    const newAircraftGroup = {
      name: newAircraftGroupName,
      aircraftRegisterIds: newAircraftGroupRegisters && newAircraftGroupRegisters.map(r => r.id)
    };
    setNewAircraftGroupName('');
    setNewAircraftGroupRegisters([]);
    setIsAddModalOpen(false);

    console.log(newAircraftGroup);
  };

  return (
    <Fragment>
      <MasterDataItemList<AircraftGroup>
        collection={MasterData.all.aircraftGroups}
        collectionTitle="Aircraft Groups"
        selectedItem={selectedItem}
        onItemSelect={item => {
          setSelectedItem(item);
          setGroupRegisters(registers.filter(r => item.aircraftRegisterIds.some(ar => ar === r.id)));
        }}
        onItemAdd={() => setIsAddModalOpen(true)}
        onItemRemove={item => alert('Not implemented.')}
      >
        {selectedItem ? (
          <div className={classes.editRegisterStyle}>
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
      <DraggableDialog open={isAddModalOpen} maxWidth="sm" fullWidth={true} onClose={() => setIsAddModalOpen(false)} aria-labelledby="form-dialog-title">
        <DialogTitle className={classes.newAircraftGroupModalHeaderStyle} id="form-dialog-add-aircraft-group">
          What is the new Aircraft Group?
        </DialogTitle>
        <DialogContent classes={{ root: classes.overflowVisible }}>
          {/* <DialogContentText>To subscribe to this website, please enter your email address here. We will send updates occasionally.</DialogContentText> */}
          <TextField
            value={newAircraftGroupName}
            id="groupname"
            label="Group Name"
            fullWidth
            onChange={e => {
              setNewAircraftGroupName(e.target.value);
            }}
          />
          <MultiSelect
            className={classes.newAircraftGroupModalRegsiterStyle}
            label="Registers"
            placeholder="Select Registers"
            options={registers}
            getOptionLabel={r => r.name}
            getOptionValue={r => r.id}
            onChange={(value, action) => {
              setNewAircraftGroupRegisters(value as ReadonlyArray<AircraftRegister>);
            }}
          />
        </DialogContent>
        <DialogActions className={classes.newAircraftGroupModalButtonStyle}>
          <Button
            onClick={() => {
              setNewAircraftGroupName('');
              setNewAircraftGroupRegisters([]);
              setIsAddModalOpen(false);
            }}
            color="primary"
          >
            Cancel
          </Button>
          <Button onClick={() => addAircraftGroup()} color="primary">
            Add
          </Button>
        </DialogActions>
      </DraggableDialog>
    </Fragment>
  );
};

export default AircraftGroupsMasterData;
