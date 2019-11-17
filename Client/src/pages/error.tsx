import React, { FC, Fragment } from 'react';
import { Button, Typography } from '@material-ui/core';
import { useHistory } from 'react-router-dom';

export interface ErrorPageState {
  title?: string;
  error?: Error | string;
}

const ErrorPageComponent: FC = () => {
  const history = useHistory<ErrorPageState>();

  const { title, error } = ErrorPage.state;
  if (!error) {
    history.push('/');
    return <Typography variant="body1">Redirecting to preplan list...</Typography>;
  }

  return (
    <Fragment>
      <br />
      {!!title && <Typography variant="h4">&nbsp;&nbsp;{title}</Typography>}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <Button
        variant="outlined"
        color="secondary"
        onClick={() => {
          window.location.reload();
          history.push('/');
        }}
      >
        Restart Application
      </Button>
      <br />
      <br />
      <Typography variant="h5">&nbsp;&nbsp;&nbsp;{String(error)}</Typography>
    </Fragment>
  );
};

const ErrorPage = ErrorPageComponent as FC & { state: ErrorPageState };

ErrorPage.state = {};

export default ErrorPage;

export function useThrowApplicationError(): {
  (error: Error | string): void;
  withTitle: (title: string) => (error: Error | string) => void;
} {
  const history = useHistory<ErrorPageState>();

  const throwApplicationError = (error: Error | string): void => {
    ErrorPage.state = { error };
    goToErrorPage();
  };

  throwApplicationError.withTitle = (title: string) => (error: Error | string): void => {
    ErrorPage.state = { title, error };
    goToErrorPage();
  };

  return throwApplicationError;

  function goToErrorPage() {
    const { title, error } = ErrorPage.state;
    title ? console.error(title, '\n', error) : console.error(error);
    history.push('/error');
  }
}
