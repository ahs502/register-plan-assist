import React, { PureComponent } from 'react';
import { WithStyles, Theme, createStyles, withStyles } from '@material-ui/core/styles';
import Objection, { ObjectionType } from '../../../business/Objection';
import SideBarContainer from './SideBarContainer';
import Search, { filterOnProperties } from '../../../components/Search';
import ErrorsAndWarningsList from './ErrorsAndWarningsList';

const styles = (theme: Theme) =>
  createStyles({
    error: {
      color: theme.palette.extraColors.erroredFlight
    },
    warning: {
      color: theme.palette.extraColors.warnedFlight
    }
  });

interface Props extends WithStyles<typeof styles> {
  objections: Objection[];
  initialSearch?: string;
}
interface State {
  filteredObjections: Objection[];
}

class ErrorsAndWarningsSideBar extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      filteredObjections: props.objections
    };
  }

  private queryChangeHandler = (query: string[]) => {
    const filteredObjections = filterOnProperties(this.props.objections, query, ['message']);
    this.setState(() => ({ ...this.state, filteredObjections }));
  };

  render() {
    const { classes, initialSearch, objections } = this.props;
    const { filteredObjections } = this.state;

    let totalErrorCount = 0,
      totalWarningCount = 0,
      filteredErrorCount = 0,
      filteredWarningCount = 0;

    objections.forEach(objection => {
      objection.type === ObjectionType.Error && totalErrorCount++;
      objection.type === ObjectionType.Warning && totalWarningCount++;
    });
    filteredObjections.forEach(objection => {
      objection.type === ObjectionType.Error && filteredErrorCount++;
      objection.type === ObjectionType.Warning && filteredWarningCount++;
    });

    return (
      <SideBarContainer label="Errors and Warnings">
        <Search initialSearch={initialSearch} onQueryChange={this.queryChangeHandler} />
        <div>
          <span>
            <span className={classes.error}>ErrorIcon</span>
            {filteredErrorCount !== totalErrorCount && <span>{filteredErrorCount} of </span>}
            {totalErrorCount} Errors
          </span>
          <span>
            <span className={classes.warning}>WarningIcon</span>
            {filteredWarningCount !== totalWarningCount && <span>{filteredWarningCount} of </span>}
            {totalErrorCount} Warnings
          </span>
        </div>
        <ErrorsAndWarningsList objections={filteredObjections} />
      </SideBarContainer>
    );
  }
}

export default withStyles(styles)(ErrorsAndWarningsSideBar);
