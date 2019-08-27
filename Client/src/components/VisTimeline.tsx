import React, { Component } from 'react';
import { DataSet, DataItem, DataGroup, TimelineOptions, Id, Timeline, TimelineEventProperties, TimelineEvents } from 'vis-timeline';
import 'vis-timeline/dist/vis-timeline-graph2d.min.css';

interface TimelineEventProps {
  onCurrentTimeTick?(): void;
  onClick?(properties: TimelineEventProperties): void;
  onContextMenu?(properties: TimelineEventProperties): void;
  onDoubleClick?(properties: TimelineEventProperties): void;
  onDrop?(properties: TimelineEventProperties): void;
  onMouseOver?(properties: TimelineEventProperties): void;
  onMouseDown?(properties: TimelineEventProperties): void;
  onMouseUp?(properties: TimelineEventProperties): void;
  onMouseMove?(properties: TimelineEventProperties): void;
  onGroupDragged?(group: Id): void;
  onChanged?(): void;
  onRangeChange?(properties: { start: number; end: number; byUser: boolean; event: Event }): void;
  onRangeChanged?(properties: { start: number; end: number; byUser: boolean; event: Event }): void;
  onSelect?(properties: { items: Array<Id>; event: Event }): void;
  onItemOver?(properties: { item: Id; event: Event }): void;
  onItemOut?(properties: { item: Id; event: Event }): void;
  onTimeChange?(properties: { id: Id; time: Date; event: Event }): void;
  onTimeChanged?(properties: { id: Id; time: Date; event: Event }): void;
}

export interface TimelineProps extends TimelineEventProps {
  items: DataItem[];
  groups: DataGroup[];
  options: TimelineOptions;
  selection?: Id | Id[];

  retrieveTimeline?(timeline: Timeline): void;
}

export default class VisTimeline extends Component<TimelineProps> {
  private timeline!: Timeline;

  private static eventHandlers: { event: TimelineEvents; handler: keyof TimelineEventProps }[] = [
    { event: 'currentTimeTick', handler: 'onCurrentTimeTick' },
    { event: 'click', handler: 'onClick' },
    { event: 'contextmenu', handler: 'onContextMenu' },
    { event: 'doubleClick', handler: 'onDoubleClick' },
    { event: 'drop', handler: 'onDrop' },
    { event: 'mouseOver', handler: 'onMouseOver' },
    { event: 'mouseDown', handler: 'onMouseDown' },
    { event: 'mouseUp', handler: 'onMouseUp' },
    { event: 'mouseMove', handler: 'onMouseMove' },
    { event: 'groupDragged', handler: 'onGroupDragged' },
    { event: 'changed', handler: 'onChanged' },
    { event: 'rangechange', handler: 'onRangeChange' },
    { event: 'rangechanged', handler: 'onRangeChanged' },
    { event: 'select', handler: 'onSelect' },
    { event: 'itemover', handler: 'onItemOver' },
    { event: 'itemout', handler: 'onItemOut' },
    { event: 'timechange', handler: 'onTimeChange' },
    { event: 'timechanged', handler: 'onTimeChanged' }
  ];

  componentWillUnmount() {
    this.timeline.destroy();
  }

  componentDidMount() {
    const { container } = this.refs;

    this.timeline = new Timeline(container as any, [], this.props.options);

    VisTimeline.eventHandlers.forEach(({ event, handler }) => {
      this.props[handler] && this.timeline.on(event as any, this.props[handler] as any);
    });

    const { retrieveTimeline } = this.props;
    retrieveTimeline && retrieveTimeline(this.timeline);

    this.init();
  }

  componentDidUpdate() {
    this.init();
  }

  shouldComponentUpdate(nextProps: TimelineProps) {
    VisTimeline.eventHandlers.forEach(({ event, handler }) => {
      const oldHandler = this.props[handler] as any;
      const newHandler = nextProps[handler] as any;
      if (!oldHandler) {
        if (!newHandler) return;
        return this.timeline.on(event as any, newHandler);
      }
      if (!newHandler) return this.timeline.off(event, oldHandler);
      if (oldHandler === newHandler) return;
      this.timeline.off(event, oldHandler);
      this.timeline.on(event as any, newHandler);
    });

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
    this.timeline.setSelection(selection || []);

    this.timeline.redraw();
  }

  render() {
    return <div ref="container" />;
  }
}
