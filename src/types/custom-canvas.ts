import { Position, Size } from "./canvas";

export interface IObjectValue {
    x: number;
    y: number;
    h: number;
    w: number;
    r: number;
    sa: number;
    ea: number;
    points: [number, number][];
}

export interface IToSVGOptions extends Size {}

export interface ICanvasObject extends Partial<IObjectValue> {
    type: ElementEnum;
    draw: (ctx: CanvasRenderingContext2D) => unknown;
    create: (ctx: CanvasRenderingContext2D) => unknown;
    update: (ctx: CanvasRenderingContext2D, objectValue: Partial<IObjectValue>) => unknown;
    toSVG: (options: IToSVGOptions) => string;
    onSelect?: () => unknown;
    delete?: () => unknown;
    get?: () => this;
    set?: <T extends keyof ICanvasObject>(key: T, value: ICanvasObject[T]) => unknown;
    move?: (position: Position) => unknown;
    resize?: (size: Size) => unknown;
}

export interface ICanvas {
    Canvas: HTMLCanvasElement | null;
    Elements: ICanvasObject[];
    toJSON: () => unknown;
    toSVG: (options: IToSVGOptions) => string;
    // getElement?: (elementId: string) => ICanvasObject;
    // setElement?: (elementId: string, element: ICanvasObject) => unknown;
    // moveElement?: (elementId: string, position: Position) => unknown;
    // resizeElement?: (elementId: string, size: ElementSize) => unknown;
    // onSelect?: () => unknown;
    // removeElement?: () => unknown;
}

export enum ElementEnum {
    Line = "line",
    Square = "square",
    Rectangle = "rectangle",
    Circle = "circle",
    Ellipse = "ellipse",
    Pencil = "pencil",
    Move = "move"
}
