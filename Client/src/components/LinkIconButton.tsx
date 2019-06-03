import React, { FC } from 'react';
import IconButton, { IconButtonProps } from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/styles';
import { Link } from 'react-router-dom';
import { History } from 'history';
import classNames from 'classnames';

const useStyles = makeStyles({
  root: {
    textDecoration: 'none'
  }
});

interface LinkProps {
  to: History.LocationDescriptor;
  replace?: boolean;
}

export interface LinkIconButtonProps extends IconButtonProps, LinkProps {}

const LinkIconButton: FC<LinkIconButtonProps> = props => {
  const classes = useStyles();

  let modifiedProps: LinkIconButtonProps = {
    ...props,
    classes: {
      ...(props.classes || {}),
      root: classNames((props.classes || {}).root, classes.root)
    }
  };

  return <IconButton {...modifiedProps} component={Link as any} />;
};

export default LinkIconButton;
