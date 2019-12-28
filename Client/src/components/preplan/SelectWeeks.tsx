import React, { FC, useState, Fragment, useContext } from 'react';
import Preplan from 'src/business/preplan/Preplan';
import { makeStyles } from '@material-ui/styles';
import { Theme, Slider } from '@material-ui/core';
import classNames from 'classnames';
import chroma from 'chroma-js';
import { PreplanContext } from 'src/pages/preplan';

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
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 4,
    margin: '2px 1px 0 1px',
    padding: '2px 0 1px 3px',
    flexGrow: 1,
    color: theme.palette.common.black,
    fontSize: '12px',
    userSelect: 'none',
    cursor: 'pointer'
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
  weekSelection: WeekSelection;
  onSelectWeeks(weekSelection: WeekSelection): void;
}

const SelectWeeks: FC<SelectWeeksProps> = ({ preplan: externalPreplan, weekSelection: externalWeekSelection, onSelectWeeks }) => {
  const contextPreplan = useContext(PreplanContext);
  const preplan = externalPreplan ?? contextPreplan;

  const [weekSelection, setWeekSelection] = useState<WeekSelection>(externalWeekSelection);

  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.weeks}>
        {preplan.weeks.chunks.flatMap((chunk, chunkIndex) =>
          chunk.all.map((week, chunkWeekIndex) => {
            const weekIndex = preplan.weeks.all.indexOf(week);
            const weekType =
              weekIndex < weekSelection.previousStartIndex || weekIndex >= weekSelection.nextEndIndex
                ? 'FREE'
                : weekIndex >= weekSelection.startIndex && weekIndex < weekSelection.endIndex
                ? 'SELECTION'
                : 'SIDE';
            const chunkType =
              chunk.endIndex <= weekSelection.previousStartIndex || chunk.startIndex >= weekSelection.nextEndIndex
                ? 'FREE'
                : chunk.endIndex <= weekSelection.endIndex && chunk.startIndex >= weekSelection.startIndex
                ? 'SELECTION'
                : chunk.endIndex <= weekSelection.startIndex || chunk.startIndex >= weekSelection.endIndex
                ? 'SIDE'
                : 'MIXED';
            return (
              <div
                key={`${chunkIndex}-${chunkWeekIndex}`}
                title={`Week from ${week.startDate.format('d')} to ${week.endDate.format('d')}\nChunk from ${chunk.startDate.format('d')} to ${chunk.endDate.format('d')}`}
                className={classNames(
                  classes.week,
                  chunkWeekIndex === 0 && classes.chuckStart,
                  chunkWeekIndex === chunk.all.length - 1 && classes.chuckEnd,
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
                onClick={() => {
                  const weekSelection: WeekSelection = {
                    previousStartIndex: chunk.startIndex === 0 ? chunk.startIndex : chunk.startIndex - 1,
                    startIndex: chunk.startIndex,
                    endIndex: chunk.endIndex,
                    nextEndIndex: chunk.endIndex === preplan.weeks.all.length ? chunk.endIndex : chunk.endIndex + 1
                  };
                  setWeekSelection(weekSelection);
                  onSelectWeeks(weekSelection);
                }}
              >
                {formatDate(week.startDate)}
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
          value={[weekSelection.previousStartIndex, weekSelection.startIndex, weekSelection.endIndex, weekSelection.nextEndIndex]}
          onChange={(event, value) => {
            let previousStartIndex = (value as number[])[0];
            let startIndex = (value as number[])[1];
            let endIndex = (value as number[])[2];
            let nextEndIndex = (value as number[])[3];
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
    return (
      <Fragment>
        {dateString.slice(0, 2)}&nbsp;{dateString.slice(2, 5)}
      </Fragment>
    );
  }
};

export default SelectWeeks;
