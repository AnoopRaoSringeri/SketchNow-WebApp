import getStroke, { StrokeOptions } from "perfect-freehand";
import { v4 as uuid } from "uuid";

import { CanvasHelper, DefaultStyle } from "@/lib/canvas-helpers";
import { Delta, Position } from "@/types/canvas";
import {
    CursorPosition,
    ElementEnum,
    ICanvasObject,
    ICanvasObjectWithId,
    IObjectStyle,
    IObjectValue,
    IToSVGOptions,
    MouseAction,
    PartialCanvasObject
} from "@/types/custom-canvas";

import { CanvasBoard } from "../canvas-board";

const options: StrokeOptions = {
    smoothing: 0.01,
    thinning: 0,
    streamline: 0.99,
    simulatePressure: false,
    easing: (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t))
};
const average = (a: number, b: number) => (a + b) / 2;
function getSvgPathFromStroke(points: number[][], closed = true) {
    const len = points.length;

    if (len < 4) {
        return ``;
    }

    let a = points[0];
    let b = points[1];
    const c = points[2];

    let result = `M${a[0].toFixed(2)},${a[1].toFixed(2)} Q${b[0].toFixed(
        2
    )},${b[1].toFixed(2)} ${average(b[0], c[0]).toFixed(2)},${average(b[1], c[1]).toFixed(2)} T`;

    for (let i = 2, max = len - 1; i < max; i++) {
        a = points[i];
        b = points[i + 1];
        result += `${average(a[0], b[0]).toFixed(2)},${average(a[1], b[1]).toFixed(2)} `;
    }

    if (closed) {
        result += "Z";
    }
    return result;
}
export class Pencil implements ICanvasObjectWithId {
    readonly _parent: CanvasBoard;

    type: ElementEnum = ElementEnum.Pencil;
    id = uuid();
    style = DefaultStyle;
    constructor(v: PartialCanvasObject, parent: CanvasBoard) {
        this.points = [...(v.points ?? [])];
        this.id = v.id;
        this.style = { ...(v.style ?? DefaultStyle) };
        this._parent = parent;
    }
    points: [number, number][] = [];

    private _isSelected = false;
    private _showSelection = false;
    _isDragging = false;

    get IsSelected() {
        return this._isSelected;
    }
    get IsDragging() {
        return this._isDragging;
    }

    set IsDragging(value: boolean) {
        this._isDragging = value;
    }
    get ShowSelection() {
        return this._showSelection;
    }

    set ShowSelection(value: boolean) {
        this._showSelection = value;
    }

    get Style() {
        return this.style;
    }
    select({ points = this.points }: Partial<IObjectValue>) {
        this._isSelected = true;
        let x = Number.POSITIVE_INFINITY;
        let y = Number.POSITIVE_INFINITY;
        let h = Number.MIN_SAFE_INTEGER;
        let w = Number.MIN_SAFE_INTEGER;
        points.forEach(([px, py]) => {
            x = Math.min(x, px);
            y = Math.min(y, py);
            h = Math.max(h, py);
            w = Math.max(w, px);
        });
        h = h - y;
        w = w - x;
        if (this._parent.CanvasCopy) {
            const copyCtx = this._parent.CanvasCopy.getContext("2d");
            if (copyCtx) {
                CanvasHelper.applySelection(copyCtx, { height: h, width: w, x, y }, false);
            }
        }
    }

    unSelect() {
        this._isSelected = false;
    }

    getPosition() {
        return CanvasHelper.getAbsolutePosition({ x: 0, y: 0 }, this._parent.Transform);
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        CanvasHelper.applyStyles(ctx, this.style);
        const stroke = getStroke(this.points, {
            size: this.style.strokeWidth,
            ...options
        });
        const pathData = getSvgPathFromStroke(stroke);
        const myPath = new Path2D(pathData);
        ctx.stroke(myPath);
        ctx.fill(myPath);
        ctx.restore();
        if (this.IsSelected) {
            this.select({ points: this.points });
        }
    }

    create(ctx: CanvasRenderingContext2D) {
        CanvasHelper.applyStyles(ctx, this.style);
    }

    update(ctx: CanvasRenderingContext2D, objectValue: Partial<IObjectValue>, action: MouseAction, clearCanvas = true) {
        if (clearCanvas) {
            CanvasHelper.clearCanvasArea(ctx, this._parent.Transform);
        }
        if (action == "down") {
            CanvasHelper.applyStyles(ctx, this.style);
        }
        const { points = this.points } = objectValue;
        const [x, y] = points[0];
        const [prevX, prevY] = this.points[this.points.length - 1];
        if (prevX != x || prevY != y) {
            this.points.push([x, y]);
        }
        const stroke = getStroke(this.points, {
            size: this.style.strokeWidth,
            ...options
        });
        const pathData = getSvgPathFromStroke(stroke);
        const myPath = new Path2D(pathData);
        ctx.stroke(myPath);
        ctx.fill(myPath);
    }

    move(ctx: CanvasRenderingContext2D, position: Position, action: MouseAction) {
        const { x, y } = position;
        if (action == "down") {
            CanvasHelper.applyStyles(ctx, this.style);
        }
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        const points: [number, number][] = this.points.map((p) => {
            const [px, py] = p;
            const offsetX = x + px;
            const offsetY = y + py;
            return [offsetX, offsetY];
        });
        const stroke = getStroke(points, {
            size: this.style.strokeWidth,
            ...options
        });
        const pathData = getSvgPathFromStroke(stroke);
        const myPath = new Path2D(pathData);
        ctx.stroke(myPath);
        ctx.fill(myPath);
        this.select({ points });
        if (action == "up") {
            ctx.restore();
            this.points = this.points.map((p) => {
                const [px, py] = p;
                const offsetX = x + px;
                const offsetY = y + py;
                return [offsetX, offsetY];
            });
        }
    }

    updateStyle<T extends keyof IObjectStyle>(ctx: CanvasRenderingContext2D, key: T, value: IObjectStyle[T]) {
        this.style[key] = value;
        this.draw(ctx);
    }

    toSVG({ height, width }: IToSVGOptions) {
        let s = "";
        if (this.points.length > 0) {
            const stroke = getStroke(
                this.points.map(([x, y]) => {
                    return [x * width, y * height];
                }),
                {
                    size: this.style.strokeWidth,
                    ...options
                }
            );
            s = getSvgPathFromStroke(stroke);
        }
        return `<path d="${s}" style="${CanvasHelper.getHTMLStyle(this.style, { height, width })}" />`;
    }

    getValues() {
        return {
            type: this.type,
            id: this.id,
            points: this.points,
            style: this.style
        };
    }

    delete() {}
    onSelect() {}
    set<T extends keyof ICanvasObject>(key: T, value: ICanvasObject[T]) {
        console.log(key, value);
    }
    resize(ctx: CanvasRenderingContext2D, delta: Delta, cPos: CursorPosition, action: MouseAction) {
        console.log(action);
        return { x: 0, y: 0, h: 0, w: 0 };
    }
}
