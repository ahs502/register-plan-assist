import React, { FunctionComponent } from 'react';
import { WithStyles, withStyles, createStyles, Theme } from '@material-ui/core/styles';
import classNames from 'classnames';
import { Card, CardContent, Typography, CardActionArea, MenuList, MenuItem } from '@material-ui/core';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      alignItems: 'stretch',
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
      padding: 0
    },
    card: {
      display: 'inline-block',
      margin: theme.spacing.unit * 4,
      // padding: theme.spacing.unit * 3,

      cursor: 'pointer'
    },
    cardContent: {
      width: theme.spacing.unit * 40,
      height: theme.spacing.unit * 20,
      padding: theme.spacing.unit * 3
    },
    cardTitle: {
      fontSize: '120%'
    },
    cardDescription: {
      color: theme.palette.grey[600]
    },
    cardHolder: {
      display: 'flex'
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
        <MenuList>
          {sections.map(section => (
            <MenuItem key={section.title} onClick={() => sectionSelectHandler(section)}>
              {section.title}
            </MenuItem>
          ))}
        </MenuList>
      </div>

      <div className={classes.contents}>
        {selectedSection ? (
          children
        ) : (
          <div className={classes.cardHolder}>
            {sections.map(section => (
              <Card key={section.title} className={classes.card} onClick={() => sectionSelectHandler(section)}>
                <CardActionArea>
                  <CardContent className={classes.cardContent}>
                    <Typography variant="h6">{section.title}</Typography>
                    <Typography>{section.description}</Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default withStyles(styles)(SectionList);
