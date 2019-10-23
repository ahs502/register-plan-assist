import React, { FC } from 'react';
import Dialog, { DialogProps } from '@material-ui/core/Dialog';
import Paper, { PaperProps } from '@material-ui/core/Paper';
import { createStyles, withStyles } from '@material-ui/styles';
import Draggable from 'react-draggable';

const styles = createStyles({
  root: {
    overflow: 'visible'
  }
});

const DraggablePaper = withStyles(styles)((props: PaperProps) => (
  <Draggable cancel={'[class*="MuiDialogContent-root"]'}>
    <Paper {...props} />
  </Draggable>
));

export interface DraggableDialogProps extends DialogProps {}

const DraggableDialog: FC<DraggableDialogProps> = props => <Dialog {...props} PaperComponent={DraggablePaper} />;

export default DraggableDialog;
