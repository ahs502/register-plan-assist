import React, { FC } from 'react';
import { Theme, Card, CardContent, Typography, CardActionArea, MenuList, MenuItem } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles((theme: Theme) => ({
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
    paddingTop: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch'
  },
  item: {
    height: theme.spacing(6),
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
    margin: theme.spacing(4),
    cursor: 'pointer'
  },
  cardContent: {
    width: theme.spacing(40),
    height: theme.spacing(20),
    padding: theme.spacing(3)
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
}));

export interface SectionItem {
  title: string;
  description: string;
}

interface SectionListProps {
  sections: SectionItem[];
  selectedSection?: SectionItem;
  onSectionSelect?: (selectedSection: SectionItem) => void;
}

const SectionList: FC<SectionListProps> = ({ children, sections, selectedSection, onSectionSelect }) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.list}>
        <MenuList>
          {sections.map(section => (
            <MenuItem key={section.title} onClick={() => onSectionSelect && onSectionSelect(section)}>
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
              <Card key={section.title} className={classes.card} onClick={() => onSectionSelect && onSectionSelect(section)}>
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

export default SectionList;
