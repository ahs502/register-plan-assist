import React from 'react';
import { Theme, IconButton } from '@material-ui/core';

import { TablePaginationActionsProps } from '@material-ui/core/TablePagination/TablePaginationActions';
import { FirstPage as FirstPageIcon, KeyboardArrowLeft, KeyboardArrowRight, LastPage as LastPageIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles((theme: Theme) => ({
  divContent: {
    justifyContent: 'center',
    display: 'flex'
  },
  pagination: {
    flexShrink: 0,
    color: theme.palette.text.secondary,
    marginLeft: theme.spacing(2.5)
  }
}));

function TablePaginationActions(props: TablePaginationActionsProps) {
  const classes = useStyles();
  const { count, page, rowsPerPage, onChangePage } = props;

  function handleFirstPageButtonClick(event: React.MouseEvent<HTMLButtonElement> | null) {
    onChangePage(event, 0);
  }

  function handleBackButtonClick(event: React.MouseEvent<HTMLButtonElement> | null) {
    onChangePage(event, page - 1);
  }

  function handleNextButtonClick(event: React.MouseEvent<HTMLButtonElement> | null) {
    onChangePage(event, page + 1);
  }

  function handleLastPageButtonClick(event: React.MouseEvent<HTMLButtonElement> | null) {
    onChangePage(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  }

  return (
    <div className={classes.pagination}>
      <IconButton onClick={handleFirstPageButtonClick} disabled={page === 0} aria-label="First Page">
        <FirstPageIcon />
      </IconButton>
      <IconButton onClick={handleBackButtonClick} disabled={page === 0} aria-label="Previous Page">
        <KeyboardArrowLeft />
      </IconButton>
      <IconButton onClick={handleNextButtonClick} disabled={page >= Math.ceil(count / rowsPerPage) - 1} aria-label="Next Page">
        <KeyboardArrowRight />
      </IconButton>
      <IconButton onClick={handleLastPageButtonClick} disabled={page >= Math.ceil(count / rowsPerPage) - 1} aria-label="Last Page">
        <LastPageIcon />
      </IconButton>
    </div>
  );
}

export default TablePaginationActions;
