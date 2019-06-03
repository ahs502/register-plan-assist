import React, { FC } from 'react';
import Button, { ButtonProps } from '@material-ui/core/Button';
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

export interface LinkButtonProps extends ButtonProps, LinkProps {}

const LinkButton: FC<LinkButtonProps> = props => {
  const classes = useStyles();

  let modifiedProps: LinkButtonProps = {
    ...props,
    classes: {
      ...(props.classes || {}),
      root: classNames((props.classes || {}).root, classes.root)
    }
  };

  return <Button {...modifiedProps} component={Link as any} />;
};

export default LinkButton;
