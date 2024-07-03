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

export class Line implements ICanvasObjectWithId {
    readonly _parent: CanvasBoard;
    type: ElementEnum = ElementEnum.Line;
    id = uuid();
    style = DefaultStyle;
    constructor(v: PartialCanvasObject, parent: CanvasBoard) {
        this.x = v.x ?? 0;
        this.y = v.y ?? 0;
        this.points = [...(v.points ?? [])];
        this.id = v.id;
        this.style = { ...(v.style ?? DefaultStyle) };
        this._parent = parent;
    }
    points: [number, number][] = [];
    x = 0;
    y = 0;
    private _isSelected = false;

    get IsSelected() {
        return this._isSelected;
    }

    draw(ctx: CanvasRenderingContext2D) {
        CanvasHelper.applyStyles(ctx, this.style);
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        if (this.points.length > 0) {
            const [x, y] = this.points[0];
            ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.closePath();
        ctx.restore();
    }

    create(ctx: CanvasRenderingContext2D) {
        CanvasHelper.applyStyles(ctx, this.style);
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
    }

    select(value: Partial<IObjectValue>) {
        console.log(value);
        this._isSelected = true;
    }

    unSelect() {
        this._isSelected = false;
    }

    getPosition() {
        return CanvasHelper.getAbsolutePosition({ x: this.x, y: this.y }, this._parent.Transform);
    }

    update(ctx: CanvasRenderingContext2D, objectValue: Partial<IObjectValue>, action: MouseAction, clearCanvas = true) {
        const { points = this.points, x = this.x, y = this.y } = objectValue;
        if (action == "down") {
            CanvasHelper.applyStyles(ctx, this.style);
        }
        if (clearCanvas) {
            CanvasHelper.clearCanvasArea(ctx, this._parent.Transform);
        }
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        if (points.length > 0) {
            const [x, y] = points[0];
            ctx.lineTo(x, y);
            ctx.stroke();
            this.points = points;
        }
        this.x = x;
        this.y = y;
    }

    updateStyle<T extends keyof IObjectStyle>(ctx: CanvasRenderingContext2D, key: T, value: IObjectStyle[T]) {
        this.style[key] = value;
        CanvasHelper.applyStyles(ctx, this.style);
        CanvasHelper.clearCanvasArea(ctx, this._parent.Transform);
        this.draw(ctx);
    }

    move(ctx: CanvasRenderingContext2D, position: Position, action: MouseAction) {
        const { x, y } = position;
        if (action == "down") {
            CanvasHelper.applyStyles(ctx, this.style);
        }
        CanvasHelper.clearCanvasArea(ctx, this._parent.Transform);
        ctx.beginPath();
        if (this.points.length > 0) {
            const [px, py] = this.points[0];
            const offsetX = x + this.x;
            const offsetY = y + this.y;
            const offsetPX = x + px;
            const offsetPY = y + py;
            ctx.moveTo(offsetX, offsetY);
            ctx.lineTo(offsetPX, offsetPY);
            ctx.stroke();
        }
        if (action == "up") {
            ctx.closePath();
            ctx.restore();
            this.x = x + this.x;
            this.y = y + this.y;
            this.points = this.points.map((p) => {
                const [px, py] = p;
                const offsetX = x + px;
                const offsetY = y + py;
                return [offsetX, offsetY];
            });
        }
    }

    toSVG({ height, width }: IToSVGOptions) {
        let s = "";
        if (this.points.length > 0) {
            const [ix, iy] = this.points[0];
            s = `M ${this.x * width} ${this.y * height} L ${ix * width} ${iy * height}`;
        }
        return `<path d="${s}" style="${CanvasHelper.getHTMLStyle(this.style, { height, width })}" />`;
    }

    getValues() {
        return {
            type: this.type,
            id: this.id,
            points: this.points,
            x: this.x,
            y: this.y,
            style: this.style
        };
    }

    delete() {}
    onSelect() {}
    set<T extends keyof ICanvasObject>(key: T, value: ICanvasObject[T]) {
        console.log(key, value);
    }
    resize(ctx: CanvasRenderingContext2D, delta: Delta, cPos: CursorPosition, action: MouseAction) {
        console.log(delta, cPos, action);
    }
}
