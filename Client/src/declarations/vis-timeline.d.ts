declare module 'vis-timeline' {
  import moment from 'moment';

  export type CustomTime = Date | number | string;
  export type Id = string | number;

  export interface DataItem {
    className?: string;
    align?: 'auto' | 'center' | 'left' | 'right';
    content: string;
    end?: CustomTime;
    group?: any;
    id?: Id;
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
    format?: {
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
    };
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

  export class Timeline {
    constructor(
      container: HTMLElement,
      items: Array<DataItem> | DataSet<DataItem> | DataView<DataItem>,
      groups: Array<DataGroup> | DataSet<DataGroup> | DataView<DataGroup>,
      options?: TimelineOptions
    );
    constructor(container: HTMLElement, items: Array<DataItem> | DataSet<DataItem> | DataView<DataItem>, options?: TimelineOptions);

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
