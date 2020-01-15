import React, { useState, useContext, Fragment } from 'react';
import { Theme, Typography, TableBody, Table, TableRow, TableCell, IconButton } from '@material-ui/core';
import { Check as CheckIcon, Clear as ClearIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';
import BaseModal, { BaseModalProps, useModalState, createModal } from 'src/components/BaseModal';
import Preplan from 'src/business/preplan/Preplan';
import RefiningTextField from 'src/components/RefiningTextField';
import { dataTypes } from 'src/utils/DataType';
import PreplanService from 'src/services/PreplanService';
import { ReloadPreplanContext } from 'src/pages/preplan';
import Validation from '@core/node_modules/@ahs502/validation/dist/Validation';
import { useHistory } from 'react-router-dom';

const useStyles = makeStyles((theme: Theme) => ({
  // The modal specific styles go here...
  linkTableCell: {
    cursor: 'pointer'
  }
}));

interface ViewState {
  description: string;
  versions: Preplan['versions'][number][];
  bypassValidation: boolean;
  isLastVersionEqualCurrent: boolean;
}

class ViewStateValidation extends Validation<'DESCRIPTION_EXISTS' | 'DESCRIPTION_FORMAT_IS_VALID' | 'DESCRIPTION_LESS_THAN_100_CHARACTER'> {
  /**
   *
   */
  constructor({ description }: ViewState) {
    super(validator => {
      validator
        .check('DESCRIPTION_EXISTS', !!description)
        .check('DESCRIPTION_FORMAT_IS_VALID', () => dataTypes.label.checkView(description), 'Invalid label.')
        .check('DESCRIPTION_LESS_THAN_100_CHARACTER', description.length <= 100, 'Less than 100 character');
    });
  }
}

export interface PerplanVersionsModalState {
  preplan: Preplan;
}

export interface PerplanVersionsModalProps extends BaseModalProps<PerplanVersionsModalState> {}

const PerplanVersionsModal = createModal<PerplanVersionsModalState, PerplanVersionsModalProps>(({ state, ...others }) => {
  const reloadPreplan = useContext(ReloadPreplanContext);

  const preplan = state.preplan;

  const [viewState, setViewState] = useState<ViewState>(() => {
    const sortedVersions = preplan.versions.orderByDescending('lastEditDateTime');
    const isLastVersionEqualCurrent = sortedVersions.length >= 2 ? sortedVersions[0].lastEditDateTime.getTime() === sortedVersions[1].lastEditDateTime.getTime() : false;
    //if (isLastVersionEqualCurrent) sortedVersions.shift();
    return {
      description: '',
      versions: sortedVersions,
      bypassValidation: true,
      isLastVersionEqualCurrent: isLastVersionEqualCurrent
    };
  });

  const validation = new ViewStateValidation(viewState);
  const errors = {
    description: viewState.bypassValidation ? undefined : validation.message('DESCRIPTION_*')
  };

  const history = useHistory();
  const classes = useStyles();

  return (
    <BaseModal
      {...others}
      title="Version of this preplan:"
      actions={[
        {
          title: 'Close',
          canceler: true
        },
        {
          title: 'Commit',
          action: async () => {
            viewState.bypassValidation && setViewState({ ...viewState, bypassValidation: false });

            if (!validation.ok) throw 'Invalid form fields.';

            const newPreplanModel = await PreplanService.commit(preplan.versions.find(v => v.current)!.id, viewState.description);
            await reloadPreplan(newPreplanModel);
          },
          submitter: true,
          disabled: (!viewState.bypassValidation && !validation.ok) || viewState.isLastVersionEqualCurrent
        }
      ]}
      body={({ handleKeyboardEvent, loading, errorMessage }) => (
        <div>
          <Typography>Version of this preplan:</Typography>
          <Table size="small">
            <TableBody>
              {viewState.versions.map(v => (
                <TableRow hover key={v.id} selected={v.id === preplan.id}>
                  <TableCell
                    className={classes.linkTableCell}
                    onClick={async () => {
                      history.push('/preplan/' + v.id);
                      await others.onClose();
                    }}
                  >
                    {v.current ? 'Current' : `${v.lastEditDateTime.format('d')} ${v.lastEditDateTime.format('t')}`}
                  </TableCell>
                  <TableCell>
                    {v.current ? (
                      <Fragment>
                        <RefiningTextField
                          autoFocus
                          dataType={dataTypes.label}
                          onChange={({ target: { value: description } }) => setViewState({ ...viewState, description })}
                          error={errors.description !== undefined}
                          helperText={errors.description}
                          onKeyDown={handleKeyboardEvent}
                          disabled={viewState.isLastVersionEqualCurrent}
                        />
                      </Fragment>
                    ) : (
                      v.description
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="inherit"
                      title="Delete"
                      onClick={async e => {
                        loading(true);
                        e.stopPropagation();
                        try {
                          const preplanModel = await PreplanService.remove(v.id, preplan.id);
                          await reloadPreplan(preplanModel);
                        } catch (error) {
                          errorMessage(error);
                        }

                        loading(false);
                        await others.onClose();
                      }}
                      disabled={!preplan.current && (v.id === preplan.id || v.current)}
                    >
                      <ClearIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    />
  );
});

export default PerplanVersionsModal;

export function usePerplanVersionsModalState() {
  return useModalState<PerplanVersionsModalState>();
}
