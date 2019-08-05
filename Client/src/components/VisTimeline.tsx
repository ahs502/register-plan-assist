import React, { Component } from 'react';
import { DataSet, DataItem, DataGroup, TimelineOptions, Id, Timeline } from 'vis-timeline';
import 'vis-timeline/dist/vis-timeline-graph2d.min.css';

export interface TimelineProps {
  items: DataItem[];
  groups: DataGroup[];
  options: TimelineOptions;
  selection: Id | Id[];
  retrieveTimeline?(timeline: Timeline): void;
}

export default class VisTimeline extends Component<TimelineProps> {
  private timeline!: Timeline;

  componentWillUnmount() {
    this.timeline.destroy();
  }

  componentDidMount() {
    const { container } = this.refs;

    this.timeline = new Timeline(container as any, [], this.props.options);

    const { retrieveTimeline } = this.props;
    retrieveTimeline && retrieveTimeline(this.timeline);

    this.init();
  }

  componentDidUpdate() {
    this.init();
  }

  shouldComponentUpdate(nextProps: TimelineProps) {
    const { items, groups, options, selection } = this.props;

    const itemsChange = items !== nextProps.items;
    const groupsChange = groups !== nextProps.groups;
    const optionsChange = options !== nextProps.options;
    const selectionChange = selection !== nextProps.selection;

    return itemsChange || groupsChange || optionsChange || selectionChange;
  }

  init() {
    const { items, groups, options, selection } = this.props;

    this.timeline.setOptions(options);
    this.timeline.setData({ groups: new DataSet(groups), items: new DataSet(items) });
    this.timeline.setSelection(selection);
  }

  render() {
    return <div ref="container" />;
  }
}
