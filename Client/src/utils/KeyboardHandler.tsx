import React, { FC, useEffect, Fragment } from 'react';

export interface KeyboardStatus {
  readonly alt: boolean;
  readonly ctrl: boolean;
  readonly shift: boolean;
}

const handlers: { status: Partial<KeyboardStatus>; whichKeyCode: number | string; event: 'keydown' | 'keyup'; callback: (e: KeyboardEvent) => void }[] = [];

const KeyboardHandler: FC & {
  status: KeyboardStatus;
  register(status: Partial<KeyboardStatus>, whichKeyCode: number | string, event: 'keydown' | 'keyup', handler: (e: KeyboardEvent) => void): number;
  unregister(reference: number): void;
} = ({}) => {
  useEffect(() => {
    const onKeyDown = onKeyEventMaker('keydown');
    const onKeyUp = onKeyEventMaker('keyup');

    document.body.addEventListener('keydown', onKeyDown);
    document.body.addEventListener('keyup', onKeyUp);
    return () => {
      document.body.removeEventListener('keydown', onKeyDown);
      document.body.removeEventListener('keyup', onKeyUp);
    };

    function onKeyEventMaker(event: typeof handlers[number]['event']) {
      return (e: KeyboardEvent) => {
        const newKeyboardStatus: KeyboardStatus = {
          alt: e.altKey,
          ctrl: e.ctrlKey,
          shift: e.shiftKey
        };
        if (
          newKeyboardStatus.alt !== KeyboardHandler.status.alt ||
          newKeyboardStatus.ctrl !== KeyboardHandler.status.ctrl ||
          newKeyboardStatus.shift !== KeyboardHandler.status.shift
        ) {
          KeyboardHandler.status = newKeyboardStatus;
        }
        handlers.forEach(
          handler =>
            handler.event === event &&
            (handler.status.alt === undefined || handler.status.alt === KeyboardHandler.status.alt) &&
            (handler.status.ctrl === undefined || handler.status.ctrl === KeyboardHandler.status.ctrl) &&
            (handler.status.shift === undefined || handler.status.shift === KeyboardHandler.status.shift) &&
            (typeof handler.whichKeyCode === 'number'
              ? e.which === handler.whichKeyCode || e.keyCode === handler.whichKeyCode
              : e.key.toUpperCase() === handler.whichKeyCode.toUpperCase() || e.code.toUpperCase() === handler.whichKeyCode.toUpperCase()) &&
            handler.callback(e)
        );
      };
    }
  }, []);

  return <Fragment />;
};

KeyboardHandler.status = {
  alt: false,
  ctrl: false,
  shift: false
};

KeyboardHandler.register = (status, whichKeyCode, event, callback) => {
  let i = 0;
  while (handlers[i]) i++;
  handlers[i] = { status, whichKeyCode, event, callback };
  return i;
};

KeyboardHandler.unregister = reference => delete handlers[reference];

export default KeyboardHandler;
