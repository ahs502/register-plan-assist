import React, { PureComponent } from 'react';
import { WithStyles, createStyles, withStyles, Theme } from '@material-ui/core/styles';
import MasterDataList, { MasterDataItem } from './MasterDataList';

const styles = (theme: Theme) => createStyles({});

interface Props extends WithStyles<typeof styles> {}
interface State {
  items: MasterDataItem[];
  selectedItem?: MasterDataItem;
}

class AircraftGroupsMasterData extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      items: [{ title: 'item 1' }, { title: 'item 2' }, { title: 'item 3' }, { title: 'item 4' }],
      selectedItem: undefined
    };
  }

  private itemSelectHandler = (selectedItem: MasterDataItem) => {
    this.setState({ ...this.state, selectedItem });
  };
  private itemUnselectHandler = () => {
    this.setState({ ...this.state, selectedItem: undefined });
  };

  render() {
    const { items, selectedItem } = this.state;

    return (
      <MasterDataList items={items} selectedItem={selectedItem} onItemSelect={this.itemSelectHandler} onItemUnselect={this.itemUnselectHandler}>
        {selectedItem ? (
          <div>
            <strong>{(selectedItem as MasterDataItem).title}</strong>
          </div>
        ) : (
          <em>[Select an item]</em>
        )}
      </MasterDataList>
    );
  }
}

export default withStyles(styles)(AircraftGroupsMasterData);
