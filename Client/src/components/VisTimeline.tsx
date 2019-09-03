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
  onRangeChange?(properties: { start: Date; end: Date; byUser: boolean; event: Event }): void;
  onRangeChanged?(properties: { start: Date; end: Date; byUser: boolean; event: Event }): void;
  onSelect?(properties: { items: Array<Id>; event: Event }): void;
  onItemOver?(properties: { item: Id; event: Event }): void;
  onItemOut?(properties: { item: Id; event: Event }): void;
  onTimeChange?(properties: { id: Id; time: Date; event: Event }): void;
  onTimeChanged?(properties: { id: Id; time: Date; event: Event }): void;
}

export interface TimelineProps extends TimelineEventProps {
  options: TimelineOptions;
  groups: DataGroup[];
  items: DataItem[];
  selection?: Id | Id[];
  scrollTop?: number;
  onScrollY?(scrollTop: number): void;
  retrieveTimeline?(timeline: Timeline): void;
}

export default class VisTimeline extends Component<TimelineProps> {
  private timeline!: Timeline;
  private itemsChange: boolean = true;
  private groupsChange: boolean = true;
  private optionsChange: boolean = true;
  private selectionChange: boolean = true;

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

    this.props.onScrollY && this.timeline.body.dom.leftContainer.addEventListener('scroll', () => this.props.onScrollY!(this.timeline.body.dom.leftContainer.scrollTop));

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

    const { options, groups, items, selection } = this.props;

    this.optionsChange = options !== nextProps.options;
    this.groupsChange = groups !== nextProps.groups;
    this.itemsChange = items !== nextProps.items;
    this.selectionChange = selection !== nextProps.selection;

    return this.optionsChange || this.groupsChange || this.itemsChange || this.selectionChange;
  }

  init() {
    const { options, groups, items, selection, scrollTop } = this.props;

    this.optionsChange && this.timeline.setOptions(options);
    this.itemsChange
      ? this.groupsChange
        ? this.timeline.setData({ groups: new DataSet(groups), items: new DataSet(items) })
        : this.timeline.setItems(items)
      : this.groupsChange && this.timeline.setGroups(groups);
    this.selectionChange && this.timeline.setSelection(selection || []);

    scrollTop === undefined || setTimeout(() => (this.timeline.body.dom.leftContainer.scrollTop = scrollTop));
  }

  render() {
    return <div ref="container" />;
  }
}
