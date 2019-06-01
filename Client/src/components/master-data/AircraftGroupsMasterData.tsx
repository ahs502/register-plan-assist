import React, { PureComponent, Fragment } from 'react';
import { WithStyles, createStyles, withStyles, Theme } from '@material-ui/core/styles';
import MasterDataList, { MasterDataItem } from './MasterDataList';
import { DialogActions, DialogTitle, DialogContentText, DialogContent, Button, TextField, Typography } from '@material-ui/core';
import DraggableDialog from '../DraggableDialog';
import MultiSelect from '../MultiSelect';

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
  items: MasterDataItem[];
  selectedItem?: MasterDataItem;
  isAddDialogOpen: boolean;
  regs: string[];
}

class AircraftGroupsMasterData extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      items: [{ title: 'item 1' }, { title: 'item 2' }, { title: 'item 3' }, { title: 'item 4' }],
      selectedItem: undefined,
      isAddDialogOpen: false,
      regs: []
    };
  }

  private itemSelectHandler = (selectedItem: MasterDataItem) => {
    this.setState({ ...this.state, selectedItem });
  };
  private itemUnselectHandler = () => {
    this.setState({ ...this.state, selectedItem: undefined });
  };

  private itemAddHandler = () => {
    this.setState({ ...this.state, isAddDialogOpen: true });
  };

  private itemRemoveHandler = (selectedItem: MasterDataItem) => {};

  private addDialogDismissHandler = () => {
    this.setState({ ...this.state, isAddDialogOpen: false });
  };

  private addAircraftGroup = () => {
    this.setState({ ...this.state, isAddDialogOpen: false });
  };

  private handleChangeMulti = (value: any) => {
    this.setState({ ...this.state, regs: value });
  };

  render() {
    const { items, selectedItem, isAddDialogOpen, regs } = this.state;
    const { classes } = this.props;

    return (
      <Fragment>
        <MasterDataList
          items={items}
          masterDataTitle="Aircraft Groups"
          selectedItem={selectedItem}
          onItemSelect={this.itemSelectHandler}
          onItemUnselect={this.itemUnselectHandler}
          onItemAdd={this.itemAddHandler}
          onItemRemove={this.itemRemoveHandler}
        >
          {selectedItem ? (
            <div>
              <Typography classes={{ root: classes.aircraftGroupTitle }} variant="subtitle2">
                {selectedItem.title}
              </Typography>
              <MultiSelect label="Registers" placeholder="Select Registers" suggestions={registers} />
            </div>
          ) : (
            <Typography classes={{ root: classes.aircraftGroupTitle }} variant="subtitle2">
              Please select an aircraft group
            </Typography>
          )}
        </MasterDataList>
        <DraggableDialog open={isAddDialogOpen} onClose={this.addDialogDismissHandler} aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-add-aircraft-group">What is the new Aircraft Group?</DialogTitle>
          <DialogContent classes={{ root: classes.overflowVisible }}>
            {/* <DialogContentText>To subscribe to this website, please enter your email address here. We will send updates occasionally.</DialogContentText> */}
            <TextField id="groupname" label="Name" fullWidth />
            <MultiSelect label="Registers" placeholder="Select Registers" suggestions={registers} />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.addDialogDismissHandler} color="primary">
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

export default withStyles(styles)(AircraftGroupsMasterData);
