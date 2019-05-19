import React, { FunctionComponent } from 'react';
import { makeStyles } from '@material-ui/styles';
import Typography, { TypographyProps } from '@material-ui/core/Typography';
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

export interface LinkTypographyProps extends TypographyProps, LinkProps {}

const LinkTypography: FunctionComponent<LinkTypographyProps> = (props: LinkTypographyProps) => {
  const classes = useStyles();
  let modifiedProps: LinkTypographyProps = {
    ...props,
    classes: {
      ...(props.classes || {}),
      root: classNames((props.classes || {}).root, classes.root)
    }
  };
  return <Typography {...modifiedProps} component={Link as any} />;
};

export default LinkTypography;
