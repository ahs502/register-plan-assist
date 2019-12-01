import React, { FC, Fragment } from 'react';
import { Button, Typography, Theme, Divider } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import { makeStyles } from '@material-ui/styles';
import { red } from '@material-ui/core/colors';

const useStyles = makeStyles((theme: Theme) => ({
  error: {
    color: red[400]
  }
}));

export interface ErrorPageState {
  title?: string;
  error?: Error | string;
}

const ErrorPageComponent: FC = () => {
  const history = useHistory<ErrorPageState>();

  const classes = useStyles();

  const { title, error } = ErrorPage.state;
  if (!error) {
    history.push('/');
    return <Typography variant="body1">Redirecting to preplan list...</Typography>;
  }

  return (
    <Fragment>
      <br />
      {!!title && (
        <Typography variant="h5" classes={{ root: classes.error }}>
          &nbsp;&nbsp;{title}
        </Typography>
      )}
      <br />
      <Typography variant="body1" classes={{ root: classes.error }}>
        &nbsp;&nbsp;&nbsp;{String(error)}
      </Typography>
      <br />
      <Divider />
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <Button variant="contained" color="primary" onClick={() => window.location.reload(true)}>
        Restart Application
      </Button>
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
