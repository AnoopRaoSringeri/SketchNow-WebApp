import { CanvasBoard } from "@/lib/canvas/canvas-board";

import { AbsPosition, Delta, Position, Size } from "./canvas";

export interface IObjectValue {
    x: number;
    y: number;
    h: number;
    w: number;
    sa: number;
    ea: number;
    ro: number;
    points: [number, number][];
    value: string;
    style: IObjectStyle;
}

export interface IObjectStyle {
    strokeStyle: string;
    fillColor: string;
    strokeWidth: number;
    opacity: number;
    font: Font | null;
}

export interface Font {
    color: string;
    style: string;
    varient: string;
    weight: number | string;
    size: number | string;
    family:
        | string
        | "caption"
        | "icon"
        | "menu"
        | "message-box"
        | "small-caption"
        | "status-bar"
        | "initial"
        | "inherit";
}
export interface IObjectValueWithId extends Partial<IObjectValue> {
    id: string;
}
export interface IToSVGOptions extends Size {}
export type MouseAction = "down" | "move" | "up";

export interface ICanvasObjectMethods {
    draw: (ctx: CanvasRenderingContext2D) => unknown;
    create: (ctx: CanvasRenderingContext2D) => unknown;
    update: (
        ctx: CanvasRenderingContext2D,
        objectValue: Partial<IObjectValue>,
        action: MouseAction,
        clearCanvas?: boolean
    ) => unknown;
    updateStyle: <T extends keyof IObjectStyle>(
        ctx: CanvasRenderingContext2D,
        key: T,
        value: IObjectStyle[T],
        clearCanvas?: boolean
    ) => unknown;
    move: (ctx: CanvasRenderingContext2D, position: Position, action: MouseAction, clearCanvas?: boolean) => unknown;
    toSVG: (options: IToSVGOptions) => string;
    getValues: () => CanvasObject;
    select: (cords: Partial<IObjectValue>) => unknown;
    unSelect: () => unknown;
    resize: (
        ctx: CanvasRenderingContext2D,
        delta: Delta,
        curorPosition: CursorPosition,
        action: MouseAction,
        clearCanvas?: boolean
    ) => Position & { h: number; w: number };
    getPosition: () => Position & AbsPosition;
    set: <T extends keyof ObjectOptions>(key: T, value: ObjectOptions[T]) => unknown;
}
export interface ObjectOptions {
    IsSelected: boolean;
    IsDragging: boolean;
    ShowSelection: boolean;
}
export interface ICanvasObject extends Partial<IObjectValue>, ICanvasObjectMethods, ObjectOptions {
    type: ElementEnum;
    order: number;
    readonly Board: CanvasBoard;
}

export interface ICanvasObjectWithId extends ICanvasObject {
    id: string;
}

export type PartialCanvasObject = Partial<ICanvasObject> & { id: string };

export type CanvasObject = PartialCanvasObject & { type: ElementEnum };

export interface ICanvas {
    Canvas: HTMLCanvasElement | null;
    Elements: ICanvasObject[];
    toJSON: () => unknown;
    toSVG: (options: IToSVGOptions) => string;
}

export interface ICanvasTransform {
    scaleX: number;
    b: number;
    c: number;
    scaleY: number;
    transformX: number;
    transformY: number;
}

export enum ElementEnum {
    Line = "line",
    Square = "square",
    Rectangle = "rectangle",
    Circle = "circle",
    Pencil = "pencil",
    Text = "text",
    Move = "move"
}

export enum CanvasActionEnum {
    Pan = "pan",
    Zoom = "zoom",
    Select = "select",
    Resize = "resize",
    Move = "move"
}

export type CursorPosition = "m" | "tl" | "tr" | "br" | "bl" | "l" | "r" | "t" | "b";
