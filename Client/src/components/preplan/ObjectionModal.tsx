import React, { Fragment } from 'react';
import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import BaseModal, { BaseModalProps, useModalState, createModal } from 'src/components/BaseModal';
import Objectionable from 'src/business/constraints/Objectionable';

const useStyles = makeStyles((theme: Theme) => ({}));

export interface ObjectionModalState {
  target: Objectionable;
}

export interface ObjectionModalProps extends BaseModalProps<ObjectionModalState> {}

const ObjectionModal = createModal<ObjectionModalState, ObjectionModalProps>(({ state, ...others }) => {
  const classes = useStyles();

  return (
    <BaseModal
      {...others}
      title={state.target ? `The list of objections on ${state.target.marker}:` : ''}
      actions={[
        {
          title: 'Close',
          submitter: true,
          canceler: true
        }
      ]}
      body={() => <Fragment>TODO: The list of objections...</Fragment>}
    />
  );
});

export default ObjectionModal;

export function useObjectionModalState() {
  return useModalState<ObjectionModalState>();
}
