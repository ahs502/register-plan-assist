import React, { FC } from 'react';
import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import BaseModal, { BaseModalProps, useModalState, useModalViewState, createModalExtraViewState } from 'src/components/BaseModal';

const useStyles = makeStyles((theme: Theme) => ({
  // The modal specific styles go here...
}));

interface State {
  stateProperty: number;
}

interface ViewState {
  viewStateProperty: number;
}

export interface SampleModalProps extends BaseModalProps<State> {
  onSomeAction(someData: number): void;
  onSomeAsyncAction(someData: number): Promise<void>;
}

const SampleModal: FC<SampleModalProps> = ({ state, onSomeAction, onSomeAsyncAction, ...others }) => {
  const [viewState, setViewState] = useModalViewState<State, ViewState>(state, ({ stateProperty: modalStateProperty }) => ({
    viewStateProperty: modalStateProperty
  }));

  const classes = useStyles();

  return (
    <BaseModal
      {...others}
      state={state}
      viewState={viewState}
      supplementExtention={createModalExtraViewState(state, viewState, ({ state, viewState }) => ({ data: 100 }))}
      title={({ state, viewState, data }) => 'This is the modal title!'}
      actions={({ state, viewState, data }) => [
        {
          title: 'Cancel'
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
          action: async () => {
            const someData = viewState.viewStateProperty;
            await onSomeAsyncAction(someData);
          }
        }
      ]}
      body={({ state, viewState, data, tryToSubmit }) => (
        <div>
          The modal body contents go here...
          <input
            title="Press Enter here to submit."
            value={viewState.viewStateProperty.toString()}
            onChange={e => setViewState({ viewStateProperty: Number(e.target.value) })}
            onKeyDown={tryToSubmit}
          />
          ...
          <button onClick={() => tryToSubmit()}>Submit Alternative</button>
        </div>
      )}
    />
  );
};

export default SampleModal;

export function useSampleModalState() {
  return useModalState<State>();
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Usage in another component:

const SomeComponent: FC = () => {
  const [sampleModalState, openSimpleModal, closeSimpleModal] = useSampleModalState();

  return (
    <div>
      <button onClick={e => openSimpleModal({ stateProperty: 10 })}>Open</button>

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
