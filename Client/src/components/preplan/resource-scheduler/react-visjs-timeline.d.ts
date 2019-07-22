declare module 'react-visjs-timeline' {
  import { DataSet, TimelineOptions } from 'vis';
  import { Component } from 'react';

  export interface TimelineProps {
    groups: DataSet;
    items: DataSet;
    options: TimelineOptions;
    contextmenuHandler(props: any): void;
    mouseMoveHandler(props: any): void;
    mouseOverHandler(props:any):?void;
  }

  export default class Timeline extends Component<TimelineProps> {}
}
