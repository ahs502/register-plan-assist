import React, { FunctionComponent, HTMLAttributes, ElementType } from 'react';
import { createStyles, Theme, withStyles } from '@material-ui/core/styles';
import { StandardProps } from '@material-ui/core';
import { IconClassKey } from '@material-ui/core/Icon';
import classNames from 'classnames';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      userSelect: 'none',
      fontSize: 24,
      width: '1em',
      height: '1em',
      overflow: 'hidden',
      flexShrink: 0,
      '&:before': {
        margin: 0
      }
    },
    colorPrimary: {
      color: theme.palette.primary.main
    },
    colorSecondary: {
      color: theme.palette.secondary.main
    },
    colorAction: {
      color: theme.palette.action.active
    },
    colorError: {
      color: theme.palette.error.main
    },
    colorDisabled: {
      color: theme.palette.action.disabled
    },
    fontSizeInherit: {
      fontSize: 'inherit'
    },
    fontSizeSmall: {
      fontSize: 20
    },
    fontSizeLarge: {
      fontSize: 36
    }
  });

export enum MahanIconType {
  Add,
  Alert,
  ArrowBack,
  Cancel,
  CancelButton,
  Change,
  Chart,
  CheckBoxEmpty,
  CopyContent,
  DesktopMonitor,
  DoubleTick,
  DownArrow,
  Edit,
  FlightIcon,
  Flights,
  FullScreenExit,
  LeftArrow,
  Locked,
  MahanAirLogo,
  Printer,
  RefreshButton,
  RightArrow,
  Search,
  Settings,
  SwitchToFullScreen,
  TextFile,
  Unlocked,
  UpArrow,
  UsingChlorine,
  Spin2,
  Spin3,
  Spin4
}

export interface MahanIconProps extends StandardProps<HTMLAttributes<HTMLElement>, IconClassKey> {
  color?: 'inherit' | 'primary' | 'secondary' | 'action' | 'error' | 'disabled';
  component?: ElementType<MahanIconProps>;
  fontSize?: 'inherit' | 'default' | 'small' | 'large';
  type: MahanIconType;
  spinner?: boolean;
}

const MahanIcon: FunctionComponent<MahanIconProps> = (props: MahanIconProps) => {
  const { children, classes: _classes, className, component, color, fontSize, type: iconType, spinner, ...other } = props;
  const classes = _classes as { [key: string]: string };
  const Component = component || ((MahanIcon.defaultProps as Partial<MahanIconProps>).component as string);

  return (
    <Component
      className={classNames(
        `icon-${toKebabCase(MahanIconType[iconType])}`,
        {
          'animate-spin': spinner
        },
        'material-icons',
        classes.root,
        {
          [classes[`color${capitalize(color as string)}`]]: color !== (MahanIcon.defaultProps as Partial<MahanIconProps>).color,
          [classes[`fontSize${capitalize(fontSize as string)}`]]: fontSize !== (MahanIcon.defaultProps as Partial<MahanIconProps>).fontSize
        },
        className
      )}
      aria-hidden="true"
      type={iconType}
      {...other}
    >
      {children}
    </Component>
  );
};

MahanIcon.defaultProps = {
  color: 'inherit',
  component: 'i',
  fontSize: 'default'
};

export default withStyles(styles, { name: 'MuiMahanIcon' })(MahanIcon);

function capitalize(value: string): string {
  return value[0].toUpperCase() + value.slice(1).toLowerCase();
}
function toKebabCase(value: string): string {
  return value
    .split('')
    .map(c => (isCapitalLetter(c) ? '-' + c.toLowerCase() : c))
    .join('')
    .slice(1);

  function isCapitalLetter(letter: string): boolean {
    return 'A' <= letter && letter <= 'Z';
  }
}
