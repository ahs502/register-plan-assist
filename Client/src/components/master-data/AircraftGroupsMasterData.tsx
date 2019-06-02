import React, { PureComponent, Fragment } from 'react';
import { WithStyles, createStyles, withStyles, Theme } from '@material-ui/core/styles';
import { DialogActions, DialogTitle, DialogContent, Button, TextField, Typography } from '@material-ui/core';
import DraggableDialog from '../DraggableDialog';
import MultiSelect from '../MultiSelect';
import MasterDataItemList from './MasterDataItemList';
import AircraftGroup from '../../business/master-data/AircraftGroup';
import MasterData from '../../business/master-data';

const styles = (theme: Theme) =>
  createStyles({
    overflowVisible: {
      overflow: 'visible'
    },
    aircraftGroupTitle: {
      margin: `${theme.spacing.unit * 2}px 0px`
    }
  });

interface Props extends WithStyles<typeof styles> {}
interface State {
  selectedItem?: AircraftGroup;
  isAddModalOpen: boolean;
}

class AircraftGroupsMasterData extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      selectedItem: undefined,
      isAddModalOpen: false
    };
  }

  private itemSelectHandler = (item: AircraftGroup) => {
    this.setState({ selectedItem: item });
  };
  private itemUnselectHandler = () => {
    this.setState({ selectedItem: undefined });
  };
  private itemAddHandler = () => {
    this.setState({ isAddModalOpen: true });
  };
  private itemRemoveHandler = (item: AircraftGroup) => {
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
    const { selectedItem, isAddModalOpen } = this.state;

    return (
      <Fragment>
        <MasterDataItemList<AircraftGroup>
          collection={MasterData.all.aircraftGroups}
          collectionTitle="Aircraft Groups"
          selectedItem={selectedItem}
          onItemSelect={this.itemSelectHandler}
          onItemUnselect={this.itemUnselectHandler}
          onItemAdd={this.itemAddHandler}
          onItemRemove={this.itemRemoveHandler}
        >
          {selectedItem ? (
            <div>
              <Typography classes={{ root: classes.aircraftGroupTitle }} variant="subtitle2">
                {selectedItem.name}
              </Typography>
              {/* <MultiSelect label="Registers" placeholder="Select Registers" suggestions={registers} /> */}
            </div>
          ) : (
            <Typography classes={{ root: classes.aircraftGroupTitle }} variant="subtitle2">
              Please select an aircraft group
            </Typography>
          )}
        </MasterDataItemList>
        <DraggableDialog open={isAddModalOpen} onClose={this.addModalCloseHandler} aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-add-aircraft-group">What is the new Aircraft Group?</DialogTitle>
          <DialogContent classes={{ root: classes.overflowVisible }}>
            {/* <DialogContentText>To subscribe to this website, please enter your email address here. We will send updates occasionally.</DialogContentText> */}
            <TextField id="groupname" label="Name" fullWidth />
            {/* <MultiSelect label="Registers" placeholder="Select Registers" suggestions={registers} /> */}
          </DialogContent>
          <DialogActions>
            <Button onClick={this.addModalCloseHandler} color="primary">
              Cancel
            </Button>
            <Button onClick={this.addAircraftGroup} color="primary">
              Add
            </Button>
          </DialogActions>
        </DraggableDialog>
      </Fragment>
    );
  }
}

export default withStyles(styles)(AircraftGroupsMasterData);
