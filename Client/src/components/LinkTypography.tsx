import React, { FC } from 'react';
import Typography, { TypographyProps } from '@material-ui/core/Typography';
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

export interface LinkTypographyProps extends TypographyProps, LinkProps {}

const LinkTypography: FC<LinkTypographyProps> = props => {
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
