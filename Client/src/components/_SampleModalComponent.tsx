import React, { useState } from 'react';
import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import BaseModal, { BaseModalProps, useModalState, createModal } from 'src/components/BaseModal';

const useStyles = makeStyles((theme: Theme) => ({
  // The modal specific styles go here...
}));

interface ViewState {
  viewStateProperty: number;
}

export interface SampleModalState {
  stateProperty: number;
}

export interface SampleModalProps extends BaseModalProps<SampleModalState> {
  onSomeAction(someData: number): void;
  onSomeAsyncAction(someData: number): Promise<void>;
}

const SampleModal = createModal<SampleModalState, SampleModalProps>(({ state, onSomeAction, onSomeAsyncAction, ...others }) => {
  const [viewState, setViewState] = useState<ViewState>(() => ({
    viewStateProperty: state.stateProperty
  }));

  const classes = useStyles();

  return (
    <BaseModal
      {...others}
      title="This is the modal title!"
      actions={[
        {
          title: 'Cancel',
          canceler: true
        },
        {
          title: 'Action',
          action: () => {
            const someData = viewState.viewStateProperty;
            onSomeAction(someData);
          }
        },
        {
          title: 'Async Action',
          submitter: true,
          action: async () => {
            const someData = viewState.viewStateProperty;
            await onSomeAsyncAction(someData);
          }
        }
      ]}
      body={({ handleKeyboardEvent }) => (
        <div>
          The modal body contents go here...
          <input
            title="Press Enter here to submit."
            value={viewState.viewStateProperty.toString()}
            onChange={e => setViewState({ viewStateProperty: Number(e.target.value) })}
            onKeyDown={handleKeyboardEvent}
          />
          ...
          <button onClick={() => handleKeyboardEvent()}>Submit Alternative</button>
        </div>
      )}
    />
  );
});

export default SampleModal;

export function useSampleModalState() {
  return useModalState<SampleModalState>();
}
