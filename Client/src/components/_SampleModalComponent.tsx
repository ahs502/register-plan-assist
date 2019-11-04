import React, { FC } from 'react';
import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import BaseModal, { BaseModalProps, useModalState, useModalViewState } from 'src/components/BaseModal';

const useStyles = makeStyles((theme: Theme) => ({
  // The modal specific styles go here...
}));

export interface SampleModalState {
  modalStateProperty: number;
}

export interface SampleModalProps extends BaseModalProps<SampleModalState> {
  onSomeAction(someData: number): void;
  onSomeAsyncAction(someData: number): Promise<void>;
}

const SampleModal: FC<SampleModalProps> = ({ state: [open, { modalStateProperty }], onSomeAction, onSomeAsyncAction, ...others }) => {
  const [viewState, setViewState] = useModalViewState<{ someViewStateProperty: number }>(
    open,
    {
      someViewStateProperty: 10 // The default view model.
    },
    () => ({
      someViewStateProperty: modalStateProperty // The initial view model based on props and model.
    })
  );

  const classes = useStyles();

  return (
    <BaseModal
      {...others}
      open={open}
      title="This is the modal title!"
      actions={[
        {
          title: 'Cancel'
        },
        {
          title: 'Action',
          action: () => {
            const someData = viewState.someViewStateProperty;
            onSomeAction(someData);
          }
        },
        {
          title: 'Async Action',
          action: async () => {
            const someData = viewState.someViewStateProperty;
            await onSomeAsyncAction(someData);
          }
        }
      ]}
    >
      The modal body contents go here...
      <input value={viewState.someViewStateProperty.toString()} onChange={e => setViewState({ someViewStateProperty: Number(e.target.value) })} />
      {open && (
        <div>
          Render state dependent content {modalStateProperty} conditionally by <code>open</code> trueness.
        </div>
      )}
      ...
    </BaseModal>
  );
};

export default SampleModal;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Usage in another component:

const SomeComponent: FC = () => {
  const [sampleModalState, openSimpleModal, closeSimpleModal] = useModalState<SampleModalState>();

  return (
    <div>
      <button onClick={e => openSimpleModal({ modalStateProperty: 10 })}>Open</button>

      <SampleModal
        state={sampleModalState}
        onClose={() => closeSimpleModal()}
        onSomeAction={someData => {
          /* ... */
        }}
        onSomeAsyncAction={async someData => {
          /* ... */
        }}
      />
    </div>
  );
};
