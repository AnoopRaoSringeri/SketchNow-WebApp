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

export class Text implements ICanvasObjectWithId {
    readonly Board: CanvasBoard;
    type: ElementEnum = ElementEnum.Text;
    id = uuid();
    style = DefaultStyle;
    order = 0;
    constructor(v: PartialCanvasObject, parent: CanvasBoard) {
        this.x = v.x ?? 0;
        this.y = v.y ?? 0;
        this.value = v.value ?? "";
        this.id = v.id;
        this.style = { ...(v.style ?? DefaultStyle) };
        this.Board = parent;
        this.order = v.order ?? 0;
    }
    value = "";
    x = 0;
    y = 0;
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

    get Style() {
        return this.style;
    }

    get ShowSelection() {
        return this._showSelection;
    }

    set ShowSelection(value: boolean) {
        this._showSelection = value;
    }
    select({ x = this.x, y = this.y }: Partial<IObjectValue>) {
        this._isSelected = true;
        if (this.Board.CanvasCopy && this._showSelection) {
            const copyCtx = this.Board.CanvasCopy.getContext("2d");
            if (copyCtx) {
                const metrics = copyCtx.measureText(this.value);
                CanvasHelper.applySelection(copyCtx, {
                    height: metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent,
                    width: metrics.width,
                    x,
                    y
                });
            }
        }
    }

    unSelect() {
        this._isSelected = false;
        this._showSelection = false;
    }

    draw(ctx: CanvasRenderingContext2D) {
        CanvasHelper.applyStyles(ctx, this.style);
        ctx.fillText(this.value, this.x, this.y);
        // ctx.strokeText(this.value, this.x, this.y);
        ctx.restore();
    }

    create(ctx: CanvasRenderingContext2D) {
        this.draw(ctx);
    }

    getPosition() {
        return CanvasHelper.getAbsolutePosition({ x: this.x, y: this.y }, this.Board.Transform);
    }

    update(ctx: CanvasRenderingContext2D, objectValue: Partial<IObjectValue>, action: MouseAction, clearCanvas = true) {
        const { value = "" } = objectValue;
        if (clearCanvas) {
            this.Board.Helper.clearCanvasArea(ctx);
        }
        this.value = value;
        this.draw(ctx);
    }

    updateStyle<T extends keyof IObjectStyle>(ctx: CanvasRenderingContext2D, key: T, value: IObjectStyle[T]) {
        this.style[key] = value;
        CanvasHelper.applyStyles(ctx, this.style);
        this.Board.Helper.clearCanvasArea(ctx);
        this.draw(ctx);
    }

    move(ctx: CanvasRenderingContext2D, position: Position, action: MouseAction, clearCanvas = true) {
        const { x, y } = position;
        CanvasHelper.applyStyles(ctx, this.style);
        if (clearCanvas) {
            this.Board.Helper.clearCanvasArea(ctx);
        }
        this.IsDragging = true;
        const offsetX = x + this.x;
        const offsetY = y + this.y;
        ctx.fillText(this.value, offsetX, offsetY);
        ctx.strokeText(this.value, offsetX, offsetY);
        this.select({ x: offsetX, y: offsetY });
        ctx.restore();
        if (action == "up") {
            this.x = offsetX;
            this.y = offsetY;
            this.IsDragging = false;
        }
    }

    toSVG({ height, width }: IToSVGOptions) {
        return `<text x="${this.x * width}" y="${this.y * height}">${this.value}</text>`;
    }

    getValues() {
        return {
            type: this.type,
            id: this.id,
            value: this.value,
            x: this.x,
            y: this.y,
            style: this.style,
            order: this.order
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
