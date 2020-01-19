declare module 'vis-timeline' {
  import moment from 'moment';

  export type CustomTime = Date | number | string;
  export type Id = string | number;

  export interface DataItem {
    className?: string;
    align?: 'auto' | 'center' | 'left' | 'right';
    content: string;
    end?: CustomTime;
    group?: Id;
    id?: Id;
    selectable?: boolean;
    start: CustomTime;
    style?: string;
    subgroup?: Id;
    title?: string;
    type?: 'box' | 'point' | 'range' | 'background';
    editable?:
      | boolean
      | {
          remove?: boolean;
          updateGroup?: boolean;
          updateTime?: boolean;
        };
    /** Other item data */ data?: any;
  }

  export interface DataGroup {
    className?: string;
    content: string;
    id: Id;
    style?: string;
    title?: string;
    visible?: boolean;
    nestedGroups?: Array<Id>;
    showNested?: boolean;
    treeLevel?: number;
    /** Other group data */ data?: any;
  }

  export interface DataSetSelectionOptions<T extends DataItem | DataGroup> {
    fields?: string[];
    filter?(data: T): unknown;
    order?: string; //TODO
    // returnType?:string //TODO
  }

  export class DataSet<T extends DataItem | DataGroup> {
    constructor(items: Array<T>, options?: { fieldId?: string });
    constructor(options?: { fieldId?: string });

    add(data: T | T[], senderId?: Id): Id | Id[];
    clear(senderId?: Id): Id | Id[];
    distinct(field: string): Array<T>;
    forEach(callback: (data: T) => void, options?: DataSetSelectionOptions<T>);
    get(id: Id | Id[], options?: DataSetSelectionOptions<T>): T | T[];
    getDataSet(): DataSet<T>;
    getIds(options?: DataSetSelectionOptions<T>);
    map<R>(callback: (data: T) => R, options?: DataSetSelectionOptions<T>): R[];
    max(field: string): T | null;
    min(field: string): T | null;
    off(event: 'add' | 'update' | 'remove' | '*', callback: (event: 'add' | 'update' | 'remove', properties: { items: Id[] } | null, senderId: Id | null) => void);
    on(event: 'add' | 'update' | 'remove' | '*', callback: (event: 'add' | 'update' | 'remove', properties: { items: Id[] } | null, senderId: Id | null) => void);
    remove(id: Id | Id[], senderId?: Id): Id[];
    update(data: T | T[], senderId?: Id): Id[];
  }

  export class DataView<T extends DataItem | DataGroup> {
    constructor(items: Array<T>);
    //TODO
  }

  export interface TimelineOptions {
    align?: 'auto' | 'center' | 'left' | 'right';
    autoResize?: boolean;
    clickToUse?: boolean;
    configure?: boolean | ((option: string, path: Array<string>) => boolean);
    dataAttributes?: boolean | string | string[];
    editable?:
      | boolean
      | {
          add?: boolean;
          remove?: boolean;
          updateGroup?: boolean;
          updateTime?: boolean;
          overrideItems?: boolean;
        };
    end?: CustomTime;
    format?: TimeStepFormat;
    groupEditable?:
      | boolean
      | {
          add?: boolean;
          remove?: boolean;
          order?: boolean;
        };
    // groupOrder?: string | Function; //TODO
    // groupOrderSwap?: (fromGroup: any, toGroup: any, groups: DataSet<DataGroup>) => void;
    groupTemplate?: (groupData: DataGroup, groupElement: HTMLElement, editedGroupData: DataGroup) => string;
    height?: number | string;
    // hiddenDates?: any; //TODO
    horizontalScroll?: boolean;
    itemsAlwaysDraggable?:
      | boolean
      | {
          item?: boolean;
          range?: boolean;
        };
    locale?: string;
    locales?: any; //TODO
    moment?(date: CustomTime): moment.Moment;
    margin?:
      | number
      | {
          axis?: number;
          item?:
            | number
            | {
                horizontal?: number;
                vertical?: number;
              };
        };
    max?: CustomTime;
    maxHeight?: number | string;
    maxMinorChars?: number;
    min?: CustomTime;
    minHeight?: number | string;
    moveable?: boolean;
    multiselect?: boolean;
    multiselectPerGroup?: boolean;
    onAdd?: (item: DataItem, callback: (item: DataItem | null) => void) => void;
    onAddGroup?: (group: DataGroup, callback: (group: DataGroup | null) => void) => void;
    onDragObjectOnItem?: (objectData: any, item: DataItem) => void;
    onInitialDrawComplete?: () => void;
    onMove?: (item: DataItem, callback: (item: DataItem | null) => void) => void;
    onMoveGroup?: (group: DataGroup, callback: (group: DataGroup | null) => void) => void;
    onMoving?: (item: DataItem, callback: (item: DataItem | null) => void) => void;
    onRemove?: (item: DataItem, callback: (item: DataItem | null) => void) => void;
    onRemoveGroup?: (group: DataGroup, callback: (group: DataGroup | null) => void) => void;
    onUpdate?: (item: DataItem, callback: (item: DataItem | null) => void) => void;
    // order?: Function; //TODO
    orientation?:
      | 'top'
      | 'bottom'
      | 'both'
      | 'none'
      | {
          axis?: 'top' | 'bottom' | 'both' | 'none';
          item?: 'top' | 'bottom' | 'both' | 'none';
        };
    rtl?: boolean;
    selectable?: boolean;
    showCurrentTime?: boolean;
    showMajorLabels?: boolean;
    showMinorLabels?: boolean;
    showTooltips?: boolean;
    stack?: boolean;
    stackSubgroups?: boolean;
    snap?: null | ((date: Date, scale: 'millisecond' | 'second' | 'minute' | 'hour' | 'weekday' | 'week' | 'day' | 'month' | 'year', step: number) => Date | number);
    start?: CustomTime;
    template?: (itemData: DataItem, itemElement: HTMLElement, editedItemData: DataItem) => string;
    timeAxis?: {
      scale?: 'millisecond' | 'second' | 'minute' | 'hour' | 'weekday' | 'week' | 'day' | 'month' | 'year';
      step?: number;
    };
    type?: undefined | 'box' | 'point' | 'range' | 'background';
    tooltip?: {
      followMouse?: boolean;
      overflowMethod?: 'cap' | 'flip';
      delay?: number;
      template?: (itemData: DataItem, editedItemData: DataItem) => string;
    };
    tooltipOnItemUpdateTime?:
      | boolean
      | {
          template: (itemData: DataItem) => string;
        };
    verticalScroll?: boolean;
    width?: string | number;
    zoomable?: boolean;
    zoomKey?: 'altKey' | 'ctrlKey' | 'metaKey';
    zoomMax?: number;
    zoomMin?: number;
  }

  export interface TimelineFitOptions {
    animation?:
      | boolean
      | {
          duration?: number;
          easingFunction?:
            | 'linear'
            | 'easeInQuad'
            | 'easeOutQuad'
            | 'easeInOutQuad'
            | 'easeInCubic'
            | 'easeOutCubic'
            | 'easeInOutCubic'
            | 'easeInQuart'
            | 'easeOutQuart'
            | 'easeInOutQuart'
            | 'easeInQuint'
            | 'easeOutQuint'
            | 'easeInOutQuint';
        };
  }

  export interface TimelineEventProperties {
    group: Id | null;
    item: Id | null;
    pageX: number;
    pageY: number;
    x: number;
    y: number;
    time: Date;
    snappedTime: Date;
    what: null | 'item' | 'background' | 'axis' | 'group-label' | 'custom-time' | 'current-time';
    event: Event;
  }

  export type TimelineEvents =
    | 'currentTimeTick'
    | 'click'
    | 'contextmenu'
    | 'doubleClick'
    | 'drop'
    | 'mouseOver'
    | 'mouseDown'
    | 'mouseUp'
    | 'mouseMove'
    | 'groupDragged'
    | 'changed'
    | 'rangechange'
    | 'rangechanged'
    | 'select'
    | 'itemover'
    | 'itemout'
    | 'timechange'
    | 'timechanged';

  export interface TimelineDom {
    background: Element;
    backgroundHorizontal: Element;
    backgroundVertical: Element;
    bottom: Element;
    center: Element;
    centerContainer: Element;
    container: Element;
    left: Element;
    leftContainer: Element;
    loadingScreen: Element;
    right: Element;
    rightContainer: Element;
    rollingModeBtn: Element;
    root: Element;
    shadowBottom: Element;
    shadowBottomLeft: Element;
    shadowBottomRight: Element;
    shadowTop: Element;
    shadowTopLeft: Element;
    shadowTopRight: Element;
    top: Element;
  }

  export interface TimelineDomProps {
    background: { height: number; width: number };
    border: { left: number; right: number; top: number; bottom: number };
    borderRootHeight: number;
    borderRootWidth: number;
    bottom: { height: number; width: number };
    center: { height: number; width: number };
    centerContainer: { height: number; width: number };
    lastHeight: number;
    lastWidth: number;
    left: { height: number; width: number };
    leftContainer: { height: number; width: number };
    right: { height: number; width: number };
    rightContainer: { height: number; width: number };
    root: { height: number; width: number };
    scrollTop: number;
    scrollTopMin: number;
    scrollbarWidth: number;
    top: { height: number; width: number };
  }

  export interface TimelineBody {
    dom: TimelineDom;
    domProps: TimelineDomProps;
    emitter: any; //TODO
    hiddenDates: any; //TODO
    range: Range;
    util: {
      getScale(): any; //TODO
      getStep(): any; //TODO
      toGlobalScreen(): any; //TODO
      toGlobalTime(): any; //TODO
      toScreen(): any; //TODO
      toTime(): any; //TODO
    };
  }

  export interface Range {
    animationTimer: any; //TODO
    body: TimelineBody;
    defaultOptions: TimelineOptions; //TODO: Only a part of it
    deltaDifference: number;
    end: number;
    endToFront: boolean;
    millisecondsPerPixelCache: any; //TODO
    options: TimelineOptions; //TODO: Only a part of it
    props: any; //TODO
    rolling: any; //TODO
    scaleOffset: any; //TODO
    start: number;
    startToFront: boolean;
    timeoutID: Id;
  }

  export interface TimeAxis {
    body: TimelineBody;
    defaultOptions: TimelineOptions; //TODO: Only a part of it
    dom: {
      background: Element;
      forground: Element;
      lines: Element[];
      majorTexts: Element[];
      measureCharMajor: Element;
      measureCharMinor: Element;
      minorTexts: Element[];
      redundant: any; //TODO
    };
    options: TimelineOptions; //TODO: Only a part of it
    props: {
      height: number;
      lintTop: 0;
      majorCharHeight: number;
      majorCharWidth: number;
      majorLabelHeight: number;
      majorLineHeight: number;
      majorLineWidth: number;
      minorCharHeight: number;
      minorCharWidth: number;
      minorLabelHeight: number;
      minorLineHeight: number;
      minorLineWidth: number;
      range: { start: number; end: number; minimumStep: number };
      width: number;
      _previousHeight: any; //TODO
      _previousWidth: any; //TODO
    };
    step: TimeStep;
  }

  export interface TimeStepFormat {
    minorLabels:
      | {
          millisecond?: string;
          second?: string;
          minute?: string;
          hour?: string;
          weekday?: string;
          day?: string;
          week?: string;
          month?: string;
          year?: string;
        }
      | ((datetime: Date, scale: number, step: number) => string);
    majorLabels:
      | {
          millisecond?: string;
          second?: string;
          minute?: string;
          hour?: string;
          weekday?: string;
          day?: string;
          week?: string;
          month?: string;
          year?: string;
        }
      | ((datetime: Date, scale: number, step: number) => string);
  }

  export interface TimeStep {
    autoScale: boolean;
    current: any; //TODO
    format: TimeStepFormat;
    hiddenDates: any; //TODO
    moment: any; //TODO
    options: TimelineOptions; //TODO: Only a part of it
    scale: string; //TODO
    step: number; //TODO
    switchedDay: boolean;
    switchedMonth: boolean;
    switchedYear: boolean;
    _end: any; //TODO
    _start: any; //TODO
  }

  export interface CurrentTime {
    //TODO
  }

  export interface ItemSet {
    body: TimelineBody;
    conversion: {
      toScreen(): any; //TODO
      toTime: any; //TODO
    };
    defaultOptions: TimelineOptions; //TODO: Only a part of it
    dom: {
      axis: Element;
      background: Element;
      foreground: Element;
      frame: Element;
      labelSet: Element;
    };
    groupHammer: any; //TODO
    groupIds: Id[];
    groupListeners: any; //TODO
    groupTouchParams: any; //TODO
    groups: {
      [id: string]: Group;
      [id: number]: Group;
    };
    groupsData: DataView<DataGroup>;
    hammer: any; //TODO
    initialDrawDone: boolean;
    initialItemSetDrawn: boolean;
    itemListeners: any; //TODO
    itemOptions: any; //TODO
    items: {
      [id: string]: RangeItem | BackgroundItem; //TODO: Any more item type?
      [id: number]: RangeItem | BackgroundItem; //TODO: Any more item type?
    };
    itemsData: DataSet<DataItem>;
    itemsSettingTime: Date;
    lastRangeStart: number;
    lastStack: boolean;
    lastStackSubgroups: boolean;
    lastVisibleInterval: number;
    options: TimelineOptions; //TODO: Only a part of it
    popup: any; //TODO
    popupTimer: any; //TODO
    props: {
      height: number;
      lastWidthleft: number;
      toGroupwidth: number;
      _previousHeight: number;
      _previousWidth: number;
    };
    selection: any[]; //TODO
    touchParams: any; //TODO
    userContinureNotBail: any; //TODO
  }

  export interface Group {
    //TODO
  }

  export interface RangeItem {
    //TODO
  }

  export interface BackgroundItem {
    //TODO
  }

  export class Timeline {
    constructor(
      container: HTMLElement,
      items: Array<DataItem> | DataSet<DataItem> | DataView<DataItem>,
      groups: Array<DataGroup> | DataSet<DataGroup> | DataView<DataGroup>,
      options?: TimelineOptions
    );
    constructor(container: HTMLElement, items: Array<DataItem> | DataSet<DataItem> | DataView<DataItem>, options?: TimelineOptions);

    body: TimelineBody;
    components: [Range, TimeAxis, CurrentTime, ItemSet];
    currentTime: CurrentTime;
    customTimes: any[]; //TODO
    defaultOptions: TimelineOptions; //TODO: What part of it?
    dom: TimelineDom;
    groupsData: DataView<DataGroup>;
    hammer: any; //TODO
    initTime: Date;
    initialDrawDone: boolean;
    initialFitDone: boolean;
    initialRangeChangeDone: boolean;
    itemSet: ItemSet;
    itemsData: DataSet<DataItem>;
    itemsDone: boolean;
    listeners: any; //TODO
    options: TimelineOptions; //TODO: What part of it?
    props: TimelineDomProps;
    range: Range;
    redrawCount: number;
    timeAxis: TimeAxis;
    timeAxis2: TimeAxis | null;
    touch: any; //TODO
    watchTimer: any; //TODO
    _callbacks: {
      _change: Function[];
      changed: Function[];
      checkRangedItems: Function[];
      contextmenu: Function[];
      destroyTimeline: Function[];
      mouseOver: Function[];
      mousewheel: Function[];
      panend: Function[];
      panmove: Function[];
      panstart: Function[];
      pinch: Function[];
      rangechange: Function[];
      rangechanged: Function[];
      select: Function[];
      touch: Function[];
    };
    _onResize: Function;
    _origRedraw: Function;
    _redraw: Function;

    addCustomTime(time: CustomTime, id?: Id): Id;
    destroy(): void;
    fit(options?: TimelineFitOptions): void;
    focus(id: Id | Array<Id>, options?: TimelineFitOptions): void;
    getCurrentTime(): Date;
    getCustomTime(id?: Id): Date;
    getEventProperties(event: Event): TimelineEventProperties;
    getItemRange(): { min: Date; max: Date };
    getSelection(): Array<Id>;
    getVisibleItems(): Array<Id>;
    getWindow(): { start: Date; end: Date };
    moveTo(time: CustomTime, options?: TimelineFitOptions, callback?: () => void): void;
    moveTo(time: CustomTime, callback?: () => void): void;
    on(event: 'currentTimeTick', callback: () => void): void;
    on(
      event: 'click' | 'contextmenu' | 'doubleClick' | 'drop' | 'mouseOver' | 'mouseDown' | 'mouseUp' | 'mouseMove',
      callback: (properties: TimelineEventProperties) => void
    ): void;
    on(event: 'groupDragged', callback: (group: Id) => void): void;
    on(event: 'changed', callback: () => void): void;
    on(event: 'rangechange' | 'rangechanged', callback: (properties: { start: number; end: number; byUser: boolean; event: Event }) => void): void;
    on(event: 'select', callback: (properties: { items: Array<Id>; event: Event }) => void): void;
    on(event: 'itemover' | 'itemout', callback: (properties: { item: Id; event: Event }) => void): void;
    on(event: 'timechange' | 'timechanged', callback: (properties: { id: Id; time: Date; event: Event }) => void): void;
    off(event: TimelineEvents, callback: Function): void;
    redraw(): void;
    removeCustomTime(id: Id): void;
    setCurrentTime(time: CustomTime): void;
    setCustomTime(time: CustomTime, id?: Id): void;
    setCustomTimeTitle(title: string, id?: Id): void;
    setData(data: { groups?: Array<DataGroup> | DataSet<DataGroup> | DataView<DataGroup>; items?: Array<DataItem> | DataSet<DataItem> | DataView<DataItem> }): void;
    setGroups(groups?: Array<DataGroup> | DataSet<DataGroup> | DataView<DataGroup>): void;
    setItems(items: Array<DataItem> | DataSet<DataItem> | DataView<DataItem>): void;
    setOptions(options: TimelineOptions): void;
    setSelection(id: Id | Array<Id>): void;
    setWindow(start: CustomTime, end: CustomTime, options?: TimelineFitOptions): void;
    zoomIn(ratio: null | number, options?: TimelineFitOptions, callback?: () => void);
    zoomOut(ratio: null | number, options?: TimelineFitOptions, callback?: () => void);
  }
}
