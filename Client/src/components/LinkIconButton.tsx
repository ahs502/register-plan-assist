import React, { FunctionComponent } from 'react';
import { makeStyles } from '@material-ui/styles';
import IconButton, { IconButtonProps } from '@material-ui/core/IconButton';
import { Link } from 'react-router-dom';
import { History } from 'history';
import classNames from 'classnames';

interface LinkProps {
  to: History.LocationDescriptor;
  replace?: boolean;
}

const useStyles = makeStyles({
  root: {
    textDecoration: 'none'
  }
});

export interface LinkIconButtonProps extends IconButtonProps, LinkProps {}

const LinkIconButton: FunctionComponent<LinkIconButtonProps> = (props: LinkIconButtonProps) => {
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
