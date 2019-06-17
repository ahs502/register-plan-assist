import React, { Fragment, FC, useState } from 'react';
import { Theme, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import MasterDataItemList from './MasterDataItemList';
import Constraint from '../../business/master-data/Constraint';
import MasterData from '../../business/master-data';
import ConstraintEditor from './ConstraintEditor';
import DraggableDialog from '../DraggableDialog';

const useStyles = makeStyles((theme: Theme) => ({
  contentStyle: {
    margin: theme.spacing(4),
    width: theme.spacing(73)
  },
  constraintTitle: {
    margin: theme.spacing(2, 0),
    padding: theme.spacing(2)
  }
}));

const ConstraintsMasterData: FC = () => {
  const [selectedItem, setSelectedItem] = useState<Constraint | undefined>(undefined);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const addConstraint = () => {
    setIsAddModalOpen(false);
    alert('TODO: the Data model requierd for mor implementation');
  };

  const classes = useStyles();

  return (
    <Fragment>
      <MasterDataItemList<Constraint>
        collection={MasterData.all.constraints}
        collectionTitle="Constraints"
        selectedItem={selectedItem}
        onItemSelect={setSelectedItem}
        // onItemUnselect={() => setSelectedItem(undefined)}
        onItemAdd={() => setIsAddModalOpen(true)}
        onItemRemove={item => alert('Not implemented.')}
      >
        {selectedItem ? (
          <div className={classes.contentStyle}>
            <ConstraintEditor mode="edit" />
          </div>
        ) : (
          <Typography className={classes.constraintTitle} variant="subtitle2">
            Please select a Constraint
          </Typography>
        )}
      </MasterDataItemList>

      <DraggableDialog open={isAddModalOpen} maxWidth="sm" fullWidth={true} onClose={() => setIsAddModalOpen(false)} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-add-aircraft-group">What is the new Constraint?</DialogTitle>
        <DialogContent>
          <ConstraintEditor mode="add" />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setIsAddModalOpen(false);
            }}
            color="primary"
          >
            Cancel
          </Button>
          <Button onClick={() => addConstraint()} color="primary">
            Add
          </Button>
        </DialogActions>
      </DraggableDialog>
    </Fragment>
  );
};

export default ConstraintsMasterData;
