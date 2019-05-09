import React, { FunctionComponent } from 'react';
import { WithStyles, withStyles, createStyles, Theme } from '@material-ui/core/styles';
import classNames from 'classnames';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      alignItems: 'stretch',
      border: '1px solid brown',
      margin: 0,
      padding: 0,
      height: 'calc(100vh - 104px)'
    },
    list: {
      width: 256,
      border: 'none',
      borderRight: '1px solid grey',
      margin: 0,
      padding: 0,
      paddingTop: theme.spacing.unit * 3,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'stretch'
    },
    item: {
      height: theme.spacing.unit * 6,
      backgroundColor: theme.palette.common.white
    },
    selectedItem: {
      backgroundColor: theme.palette.grey[400]
    },
    contents: {
      flexGrow: 1,
      margin: 0,
      padding: theme.spacing.unit * 2
    },
    card: {
      display: 'inline-block',
      border: '1px solid black',
      margin: theme.spacing.unit * 4,
      padding: theme.spacing.unit * 3,
      width: theme.spacing.unit * 40,
      cursor: 'pointer'
    },
    cardTitle: {
      fontSize: '120%'
    },
    cardDescription: {
      color: theme.palette.grey[600]
    }
  });

export interface SectionItem {
  title: string;
  description: string;
}

interface Props extends WithStyles<typeof styles> {
  sections: SectionItem[];
  selectedSection?: SectionItem;
  onSectionSelect?: (selectedSection: SectionItem) => void;
}

const SectionList: FunctionComponent<Props> = props => {
  const { classes, children, sections, selectedSection, onSectionSelect } = props;

  function sectionSelectHandler(selectedSection: SectionItem) {
    if (onSectionSelect) {
      onSectionSelect(selectedSection);
    }
  }

  return (
    <div className={classes.root}>
      <div className={classes.list}>
        {sections.map(section => (
          <div key={section.title} className={classNames(classes.item, { [classes.selectedItem]: section === selectedSection })}>
            <button onClick={() => sectionSelectHandler(section)}>{section.title}</button>
          </div>
        ))}
      </div>
      <div className={classes.contents}>
        {selectedSection ? (
          children
        ) : (
          <div>
            {sections.map(section => (
              <div key={section.title} className={classes.card} onClick={() => sectionSelectHandler(section)}>
                <div className={classes.cardTitle}>{section.title}</div>
                <div className={classes.cardDescription}>{section.description}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default withStyles(styles)(SectionList);
