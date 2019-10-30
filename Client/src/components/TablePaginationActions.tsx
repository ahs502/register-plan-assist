import React, { FC } from 'react';
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

const TablePaginationActions: FC<TablePaginationActionsProps> = ({ count, page, rowsPerPage, onChangePage }) => {
  const classes = useStyles();

  return (
    <div className={classes.pagination}>
      <IconButton onClick={event => onChangePage(event, 0)} disabled={page === 0} aria-label="First Page">
        <FirstPageIcon />
      </IconButton>
      <IconButton onClick={event => onChangePage(event, page - 1)} disabled={page === 0} aria-label="Previous Page">
        <KeyboardArrowLeft />
      </IconButton>
      <IconButton onClick={event => onChangePage(event, page + 1)} disabled={page >= Math.ceil(count / rowsPerPage) - 1} aria-label="Next Page">
        <KeyboardArrowRight />
      </IconButton>
      <IconButton
        onClick={event => onChangePage(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1))}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="Last Page"
      >
        <LastPageIcon />
      </IconButton>
    </div>
  );
};

export default TablePaginationActions;
