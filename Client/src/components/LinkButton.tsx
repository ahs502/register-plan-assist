import React, { FunctionComponent } from 'react';
import { makeStyles } from '@material-ui/styles';
import Button, { ButtonProps } from '@material-ui/core/Button';
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

export interface LinkButtonProps extends ButtonProps, LinkProps {}

const LinkButton: FunctionComponent<LinkButtonProps> = (props: LinkButtonProps) => {
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
