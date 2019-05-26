import React, { PureComponent } from 'react';
import { WithStyles, createStyles, withStyles, Theme } from '@material-ui/core/styles';
import MasterDataList, { MasterDataItem } from './MasterDataList';

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

  render() {
    const { items, selectedItem } = this.state;

    return (
      <MasterDataList items={items} masterDataTitle="Constraints" selectedItem={selectedItem} onItemSelect={this.itemSelectHandler} onItemUnselect={this.itemUnselectHandler}>
        {selectedItem ? (
          <div>
            <strong>{(selectedItem as MasterDataItem).title}</strong>
            <br />
            <em>{(selectedItem as MasterDataItem).description}</em>
          </div>
        ) : (
          <em>[Select an item]</em>
        )}
      </MasterDataList>
    );
  }
}

export default withStyles(styles)(ConstraintsMasterData);
