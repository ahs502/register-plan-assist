import React, { FC, useState, Fragment, useContext } from 'react';
import Preplan from 'src/business/preplan/Preplan';
import { makeStyles } from '@material-ui/styles';
import { Theme, Slider } from '@material-ui/core';
import classNames from 'classnames';
import chroma from 'chroma-js';
import { PreplanContext } from 'src/pages/preplan';
import useProperty from 'src/utils/useProperty';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '100%',
    height: theme.spacing(10.5),
    padding: theme.spacing(1, 4)
  },
  weeks: {
    width: '100%',
    display: 'flex'
  },
  week: {
    width: 20,
    position: 'relative',
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 4,
    margin: '2px 1px 0 1px',
    padding: '2px 0 1px 3px',
    flexGrow: 1,
    color: theme.palette.common.black,
    overflow: 'hidden',
    fontSize: '12px',
    userSelect: 'none',
    cursor: 'pointer',
    '&:hover $weekHover': {
      display: 'block'
    }
  },
  weekHover: {
    display: 'none',
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#0002',
    userSelect: 'none',
    pointerEvents: 'none'
  },
  chuckStart: {
    borderLeftWidth: '5px'
  },
  chuckEnd: {
    borderRightWidth: '5px'
  },
  weekFree: {
    opacity: 0.5
  },
  weekSide: {},
  weekSelection: {
    fontWeight: 'bold'
  },
  chunkFree: {
    backgroundColor: theme.palette.common.white,
    borderColor: theme.palette.grey[500]
  },
  chunkSide: {
    backgroundColor: chroma(theme.palette.secondary.main)
      .alpha(0.4)
      .hex(),
    borderColor: theme.palette.secondary.dark
  },
  chunkMixed: {
    backgroundColor: chroma
      .mix(theme.palette.secondary.main, theme.palette.primary.main, 0.5)
      .alpha(0.4)
      .hex(),
    borderColor: theme.palette.primary.dark
  },
  chunkSelection: {
    backgroundColor: chroma(theme.palette.primary.main)
      .alpha(0.4)
      .hex(),
    borderColor: theme.palette.primary.dark
  },
  slider: {
    width: '100%'
  },
  sliderRoot: {
    height: 6
  },
  sliderThumb: {
    height: 20,
    width: 20,
    marginTop: -7,
    marginLeft: -10,
    backgroundColor: theme.palette.common.white,
    border: '2px solid currentColor',
    '&:hover, &$active': {
      boxShadow: `0 0 12px 4px ${chroma(theme.palette.primary.main).alpha(0.7)}`
    }
  },
  sliderValueLabel: {
    left: 'calc(-50% + 0px)',
    top: 23,
    '& *': {
      background: 'transparent',
      color: theme.palette.common.black
    },
    fontSize: '14px'
  },
  sliderTrack: {
    height: 6,
    borderRadius: 3
  },
  sliderRail: {
    height: 6,
    borderRadius: 3
  }
}));

export interface WeekSelection {
  readonly previousStartIndex: number;
  readonly startIndex: number;
  readonly endIndex: number;
  readonly nextEndIndex: number;
}

export interface SelectWeeksProps {
  preplan?: Preplan;
  includeSides?: boolean;
  weekSelection: WeekSelection;
  onSelectWeeks(weekSelection: WeekSelection): void;
}

const SelectWeeks: FC<SelectWeeksProps> = ({ preplan: externalPreplan, includeSides, weekSelection: externalWeekSelection, onSelectWeeks }) => {
  const contextPreplan = useContext(PreplanContext);
  const preplan = externalPreplan ?? contextPreplan;

  const [weekSelection, setWeekSelection] = useState<WeekSelection>(externalWeekSelection);
  const startingSelectionIndex = useProperty<number | undefined>(undefined);

  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.weeks}>
        {preplan.weeks.chunks.flatMap((chunk, chunkIndex) =>
          chunk.all.map((week, chunkWeekIndex) => {
            const weekIndex = preplan.weeks.all.indexOf(week);
            const weekType = includeSides
              ? weekIndex < weekSelection.previousStartIndex || weekIndex >= weekSelection.nextEndIndex
                ? 'FREE'
                : weekIndex >= weekSelection.startIndex && weekIndex < weekSelection.endIndex
                ? 'SELECTION'
                : 'SIDE'
              : weekIndex < weekSelection.startIndex || weekIndex >= weekSelection.endIndex
              ? 'FREE'
              : 'SELECTION';
            const chunkType = includeSides
              ? chunk.endIndex <= weekSelection.previousStartIndex || chunk.startIndex >= weekSelection.nextEndIndex
                ? 'FREE'
                : chunk.endIndex <= weekSelection.endIndex && chunk.startIndex >= weekSelection.startIndex
                ? 'SELECTION'
                : chunk.endIndex <= weekSelection.startIndex || chunk.startIndex >= weekSelection.endIndex
                ? 'SIDE'
                : 'MIXED'
              : chunk.endIndex <= weekSelection.startIndex || chunk.startIndex >= weekSelection.endIndex
              ? 'FREE'
              : 'SELECTION';
            return (
              <div
                key={`${chunkIndex}-${chunkWeekIndex}`}
                title={`Week from ${week.startDate.format('d')} to ${week.endDate.format('d')}\nChunk from ${chunk.startDate.format('d')} to ${chunk.endDate.format('d')}`}
                className={classNames(
                  classes.week,
                  {
                    [classes.chuckStart]: chunkWeekIndex === 0,
                    [classes.chuckEnd]: chunkWeekIndex === chunk.all.length - 1
                  },
                  {
                    [classes.weekFree]: weekType === 'FREE',
                    [classes.weekSide]: weekType === 'SIDE',
                    [classes.weekSelection]: weekType === 'SELECTION'
                  },
                  {
                    [classes.chunkFree]: chunkType === 'FREE',
                    [classes.chunkSide]: chunkType === 'SIDE',
                    [classes.chunkMixed]: chunkType === 'MIXED',
                    [classes.chunkSelection]: chunkType === 'SELECTION'
                  }
                )}
                onDoubleClick={() => {
                  const weekSelection: WeekSelection = {
                    previousStartIndex: chunk.startIndex === 0 ? chunk.startIndex : chunk.startIndex - 1,
                    startIndex: chunk.startIndex,
                    endIndex: chunk.endIndex,
                    nextEndIndex: chunk.endIndex === preplan.weeks.all.length ? chunk.endIndex : chunk.endIndex + 1
                  };
                  setWeekSelection(weekSelection);
                  onSelectWeeks(weekSelection);
                }}
                onMouseDown={e => {
                  if (e.buttons !== 1 || e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) {
                    startingSelectionIndex(undefined);
                    return;
                  }
                  startingSelectionIndex(weekIndex);
                  setWeekSelection({
                    previousStartIndex: Math.max(weekIndex - 1, 0),
                    startIndex: weekIndex,
                    endIndex: weekIndex + 1,
                    nextEndIndex: Math.min(weekIndex + 2, preplan.weeks.all.length)
                  });
                }}
                onMouseMove={e => {
                  if (startingSelectionIndex() === undefined) return;
                  if (e.buttons !== 1 || e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) {
                    startingSelectionIndex(undefined);
                    return;
                  }
                  const firstIndex = Math.min(startingSelectionIndex()!, weekIndex);
                  const lastIndex = Math.max(startingSelectionIndex()!, weekIndex);
                  setWeekSelection({
                    previousStartIndex: Math.max(firstIndex - 1, 0),
                    startIndex: firstIndex,
                    endIndex: lastIndex + 1,
                    nextEndIndex: Math.min(lastIndex + 2, preplan.weeks.all.length)
                  });
                }}
                onMouseUp={e => {
                  if (startingSelectionIndex() === undefined) return;
                  startingSelectionIndex(undefined);
                  if (e.buttons !== 0 || e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) return;
                  onSelectWeeks(weekSelection);
                }}
              >
                {formatDate(week.startDate)}
                <div className={classes.weekHover} />
              </div>
            );
          })
        )}
      </div>
      <div className={classes.slider}>
        <Slider
          color="primary"
          classes={{
            root: classes.sliderRoot,
            thumb: classes.sliderThumb,
            valueLabel: classes.sliderValueLabel,
            track: classes.sliderTrack,
            rail: classes.sliderRail
          }}
          step={1}
          min={0}
          max={preplan.weeks.all.length}
          valueLabelDisplay="on"
          valueLabelFormat={index =>
            formatDate(
              index === weekSelection.previousStartIndex || index === weekSelection.startIndex
                ? preplan.weeks.all[index].startDate
                : index < preplan.weeks.all.length
                ? preplan.weeks.all[index - 1].endDate
                : preplan.weeks.all.last()!.endDate
            )
          }
          value={
            includeSides
              ? [weekSelection.previousStartIndex, weekSelection.startIndex, weekSelection.endIndex, weekSelection.nextEndIndex]
              : [weekSelection.startIndex, weekSelection.endIndex]
          }
          onChange={(event, value) => {
            const valueArray = value as number[];
            let previousStartIndex = includeSides ? valueArray[0] : Math.max(valueArray[0] - 1, 0);
            let startIndex = includeSides ? valueArray[1] : valueArray[0];
            let endIndex = includeSides ? valueArray[2] : valueArray[1];
            let nextEndIndex = includeSides ? valueArray[3] : Math.min(valueArray[1], preplan.weeks.all.length);
            endIndex = endIndex > startIndex || endIndex === preplan.weeks.all.length ? endIndex : endIndex + 1;
            startIndex = startIndex < endIndex || startIndex === 0 ? startIndex : startIndex - 1;
            previousStartIndex = previousStartIndex < startIndex || startIndex === 0 ? previousStartIndex : startIndex - 1;
            nextEndIndex = nextEndIndex > endIndex || endIndex === preplan.weeks.all.length ? nextEndIndex : endIndex + 1;
            setWeekSelection({ previousStartIndex, startIndex, endIndex, nextEndIndex });
          }}
          onChangeCommitted={(event, value) => onSelectWeeks(weekSelection)}
        />
      </div>
    </div>
  );

  function formatDate(date: Date): JSX.Element {
    const dateString = date.format('d');
    const day = dateString[0] === '0' ? dateString.slice(1, 2) : dateString.slice(0, 2);
    const month = dateString.slice(2, 5);
    return (
      <Fragment>
        {day}&nbsp;{month}
      </Fragment>
    );
  }
};

export default SelectWeeks;
