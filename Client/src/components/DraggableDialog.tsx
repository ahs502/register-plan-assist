import React, { Component, FunctionComponent } from 'react';
import { WithStyles, createStyles, withStyles, Theme } from '@material-ui/core/styles';
import Dialog, { DialogProps } from '@material-ui/core/Dialog';
import Paper, { PaperProps } from '@material-ui/core/Paper';
import Draggable from 'react-draggable';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      overflow: 'visible'
    }
  });

const DraggablePaper: FunctionComponent<PaperProps> = (props: PaperProps) => (
  <Draggable cancel={'[class*="MuiDialogContent-root"]'}>
    <Paper {...props} />
  </Draggable>
);

const StyledDraggablePaper = withStyles(styles)(DraggablePaper);

class DraggableDialog extends Component<DialogProps> {
  render() {
    return <Dialog {...this.props} PaperComponent={StyledDraggablePaper} />;
  }
}

export default DraggableDialog;
