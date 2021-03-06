import React, { FC, Fragment } from 'react';
import { Theme, Card, CardContent, Typography, CardActionArea, MenuList, MenuItem, List, ListItem, ListItemText, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import classNames from 'classnames';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    alignItems: 'stretch',
    margin: 0,
    padding: 0,
    height: 'calc(100vh - 105px)'
  },
  list: {
    width: theme.spacing(32),
    border: 'none',
    borderRight: '1px solid',
    borderColor: theme.palette.grey[300],
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
    padding: 0,
    width: 'calc(100vw - 305px)'
  },
  displayContents: {
    marginTop: theme.spacing(5),
    marginLeft: theme.spacing(3),
    width: 'calc(100vw - 305px)'
  },
  printContents: {
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(0)
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

export interface SectionListProps {
  sections: SectionItem[];
  selectedSection?: SectionItem;
  onSectionSelect?: (selectedSection: SectionItem) => void;
}

const SectionList: FC<SectionListProps> = ({ children, sections, selectedSection, onSectionSelect }) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Box display="block" displayPrint="none">
        <div className={classes.list}>
          <List>
            {sections.map(section => (
              <ListItem key={section.title} button selected={selectedSection === section} onClick={() => onSectionSelect && onSectionSelect(section)}>
                <ListItemText primary={<Typography variant="subtitle2">{section.title}</Typography>} />
              </ListItem>
            ))}
          </List>
        </div>
      </Box>

      <div>
        {selectedSection ? (
          <Fragment>
            <Box display="block" displayPrint="none">
              <div className={classes.displayContents}> {children}</div>
            </Box>
            <Box display="none" displayPrint="block">
              <div className={classes.printContents}> {children}</div>
            </Box>
          </Fragment>
        ) : (
          <div className={classNames(classes.contents, classes.cardHolder)}>
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
