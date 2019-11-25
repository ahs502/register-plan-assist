import React, { FC, useEffect, Fragment } from 'react';

export interface KeyboardStatus {
  readonly alt: boolean;
  readonly ctrl: boolean;
  readonly shift: boolean;
}

const KeyboardHandlerComponent: FC = () => {
  useEffect(() => {
    document.body.addEventListener('keydown', onKeyDown);
    document.body.addEventListener('keyup', onKeyUp);
    return () => {
      document.body.removeEventListener('keydown', onKeyDown);
      document.body.removeEventListener('keyup', onKeyUp);
    };

    function onKeyDown(e: KeyboardEvent) {
      const newKeyboardStatus: KeyboardStatus = {
        alt: e.altKey,
        ctrl: e.ctrlKey,
        shift: e.shiftKey
      };
      if (
        newKeyboardStatus.alt === KeyboardHandler.status.alt &&
        newKeyboardStatus.ctrl === KeyboardHandler.status.ctrl &&
        newKeyboardStatus.shift === KeyboardHandler.status.shift
      )
        return;
      KeyboardHandler.status = newKeyboardStatus;
    }
    function onKeyUp(e: KeyboardEvent) {
      const newKeyboardStatus: KeyboardStatus = {
        alt: e.altKey,
        ctrl: e.ctrlKey,
        shift: e.shiftKey
      };
      if (
        newKeyboardStatus.alt === KeyboardHandler.status.alt &&
        newKeyboardStatus.ctrl === KeyboardHandler.status.ctrl &&
        newKeyboardStatus.shift === KeyboardHandler.status.shift
      )
        return;
      KeyboardHandler.status = newKeyboardStatus;
    }
  }, []);

  return <Fragment />;
};

const KeyboardHandler: FC & { status: KeyboardStatus } = KeyboardHandlerComponent as any;

KeyboardHandler.status = {
  alt: false,
  ctrl: false,
  shift: false
};

export default KeyboardHandler;
