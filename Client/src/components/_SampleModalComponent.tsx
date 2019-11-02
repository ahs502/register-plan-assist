import React, { FC, useState } from 'react';
import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import ModalBase, { ModalBaseProps, ModalBaseModel, useModalViewModel } from 'src/components/ModalBase';

const useStyles = makeStyles((theme: Theme) => ({
  // The modal specific styles go here...
}));

interface ViewModel {
  someViewVariable: number;
}

export interface SampleModalModel extends ModalBaseModel {
  extraModelProperty?: number; // They should be optional unless it has to be otherwise.
}

export interface SampleModalProps extends ModalBaseProps<SampleModalModel> {
  onSomeAction(someData: number): void;
}

const SampleModal: FC<SampleModalProps> = ({ onSomeAction, ...others }) => {
  const { open, extraModelProperty } = others.model;

  const [viewModel, setViewModel] = useModalViewModel<ViewModel>(
    open,
    {
      someViewVariable: 10 // The default view model.
    },
    () =>
      extraModelProperty !== undefined && {
        someViewVariable: extraModelProperty // The initial view model based on props and model.
      }
  );

  const classes = useStyles();

  return (
    <ModalBase
      {...others}
      title="This is the modal title!"
      actions={[
        {
          title: 'Cancel'
        },
        {
          title: 'Action',
          action: () => {
            const someData: number = viewModel.someViewVariable;
            onSomeAction(someData);
          }
        }
      ]}
    >
      The modal body contents go here...
    </ModalBase>
  );
};

export default SampleModal;

// Usage in another component:
const SomeComponent: FC = () => {
  const [sampleModalModel, setSampleModalModel] = useState<SampleModalModel>({});

  return (
    <div>
      <button onClick={e => setSampleModalModel({ ...sampleModalModel, open: true, loading: false, errorMessage: undefined })}></button>

      <SampleModal
        model={sampleModalModel}
        onClose={() => setSampleModalModel({ ...sampleModalModel, open: false })}
        onSomeAction={someData => {
          /* ... */
        }}
      />
    </div>
  );
};
