import React, { Component, FunctionComponent } from 'react';
import Dialog, { DialogProps } from '@material-ui/core/Dialog';
import Paper, { PaperProps } from '@material-ui/core/Paper';
import Draggable from 'react-draggable';

const DraggablePaper: FunctionComponent<PaperProps> = (props: PaperProps) => (
  <Draggable>
    <Paper {...props} />
  </Draggable>
);

class DraggableDialog extends Component<DialogProps> {
  render() {
    return <Dialog {...this.props} PaperComponent={DraggablePaper} />;
  }
}

export default DraggableDialog;
