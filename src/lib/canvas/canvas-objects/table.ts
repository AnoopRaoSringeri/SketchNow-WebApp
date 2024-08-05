import { makeAutoObservable } from "mobx";
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

export class Table implements ICanvasObjectWithId {
    readonly Board: CanvasBoard;
    type: ElementEnum = ElementEnum.Table;
    id = uuid();
    style = DefaultStyle;
    order = 0;
    constructor(v: PartialCanvasObject, parent: CanvasBoard) {
        this.x = v.x ?? 0;
        this.y = v.y ?? 0;
        this.h = v.h ?? 0;
        this.w = v.w ?? 0;
        this.value = v.value ?? "";
        this.id = v.id;
        this.Board = parent;
        this.order = v.order ?? 0;
        makeAutoObservable(this);
    }
    value = "";
    x = 0;
    y = 0;
    h = 0;
    w = 0;
    tmpX = 0;
    tmpY = 0;
    tmpH = 0;
    tmpW = 0;
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
        this.Board.Helper.applyStyles(ctx, this.style);
        ctx.strokeRect(this.x, this.y, this.w, this.h);
        ctx.fillRect(this.x, this.y, this.w, this.h);
    }

    // drawTable() {
    //     return render({
    //         id: this.id,
    //         position: {
    //             x: this.x,
    //             y: this.y
    //         },
    //         size: {
    //             height: this.h,
    //             width: this.w
    //         },
    //         transform: this.Board.Transform
    //     });
    // }

    create(ctx: CanvasRenderingContext2D) {
        this.draw(ctx);
    }

    getPosition() {
        return CanvasHelper.getAbsolutePosition({ x: this.x, y: this.y }, this.Board.Transform);
    }

    update(ctx: CanvasRenderingContext2D, objectValue: Partial<IObjectValue>, action: MouseAction, clearCanvas = true) {
        let { h = this.h, w = this.w, x = this.x, y = this.y } = objectValue;
        this.Board.Helper.applyStyles(ctx, DefaultStyle);
        if (clearCanvas) {
            this.Board.Helper.clearCanvasArea(ctx);
        }
        if (h < 0) {
            y = y + h;
            h = Math.abs(h);
        }
        if (w < 0) {
            x = x + w;
            w = Math.abs(w);
        }
        ctx.strokeRect(x, y, w, h);
        ctx.fillRect(x, y, w, h);
        ctx.restore();
        if (action == "up") {
            this.h = h;
            this.w = w;
            this.x = x;
            this.y = y;
        }
    }

    updateStyle<T extends keyof IObjectStyle>(ctx: CanvasRenderingContext2D, key: T, value: IObjectStyle[T]) {
        this.style[key] = value;
        this.Board.Helper.applyStyles(ctx, this.style);
        this.Board.Helper.clearCanvasArea(ctx);
        this.draw(ctx);
    }

    move(ctx: CanvasRenderingContext2D, position: Position, action: MouseAction, clearCanvas = true) {
        const { x, y } = position;
        this.Board.Helper.applyStyles(ctx, this.style);
        if (clearCanvas) {
            this.Board.Helper.clearCanvasArea(ctx);
        }
        if (action == "down") {
            this.tmpX = this.x;
            this.tmpY = this.y;
        }
        this.IsDragging = true;
        const offsetX = x + this.tmpX;
        const offsetY = y + this.tmpY;
        this.select({ x: offsetX, y: offsetY });
        ctx.restore();
        this.x = offsetX;
        this.y = offsetY;
        if (action == "up") {
            this.tmpX = 0;
            this.tmpY = 0;
            this.IsDragging = false;
        }
    }

    toSVG({ height, width }: IToSVGOptions) {
        return `<image src="${this.value}" style="top:${this.y * height}px;left:${this.x * width}px;width:${this.w * width}px;height:${this.h * height}px;"/>`;
    }

    getValues() {
        return {
            type: this.type,
            id: this.id,
            value: this.value,
            x: this.x,
            y: this.y,
            w: this.w,
            h: this.h,
            style: this.style,
            order: this.order
        };
    }

    delete() {}
    onSelect() {}
    set<T extends keyof ICanvasObject>(key: T, value: ICanvasObject[T]) {
        console.log(key, value);
    }
    resize(ctx: CanvasRenderingContext2D, delta: Delta, cPos: CursorPosition, action: MouseAction, clearCanvas = true) {
        const { dx, dy } = delta;
        this.Board.Helper.applyStyles(ctx, this.style);
        if (clearCanvas) {
            this.Board.Helper.clearCanvasArea(ctx);
        }
        if (action == "down") {
            this.tmpX = this.x;
            this.tmpY = this.y;
            this.tmpH = this.h;
            this.tmpW = this.w;
        }
        this.IsDragging = true;
        let w = dx;
        let h = dy;
        let y = this.tmpY;
        let x = this.tmpX;
        switch (cPos) {
            case "tl":
                x = x + w;
                y = y + h;
                if (h < 0) {
                    h = Math.abs(Math.abs(h) + this.tmpH);
                } else {
                    h = Math.abs(this.tmpH - Math.abs(h));
                }
                if (w < 0) {
                    w = Math.abs(Math.abs(w) + this.tmpW);
                } else {
                    w = Math.abs(this.tmpW - Math.abs(w));
                }
                break;
            case "tr":
                y = y + h;
                if (h < 0) {
                    h = Math.abs(this.tmpH + Math.abs(h));
                } else {
                    h = Math.abs(Math.abs(h) - this.tmpH);
                }
                if (w < 0) {
                    w = this.tmpW + w;
                } else {
                    w = Math.abs(this.tmpW + Math.abs(w));
                }
                break;
            case "bl":
                x = x + w;
                if (h < 0) {
                    h = this.tmpH - Math.abs(h);
                } else {
                    h = Math.abs(Math.abs(h) + this.tmpH);
                }
                if (w < 0) {
                    w = Math.abs(this.tmpW + Math.abs(w));
                } else {
                    w = Math.abs(this.tmpW - Math.abs(w));
                }
                break;
            case "br":
                if (h < 0) {
                    h = h + this.tmpH;
                } else {
                    h = Math.abs(this.tmpH + Math.abs(h));
                }
                if (w < 0) {
                    w = this.tmpW + w;
                } else {
                    w = Math.abs(this.tmpW + Math.abs(w));
                }
                break;
            case "t":
                break;
            case "b":
                break;
            case "l":
                break;
            case "r":
                break;
        }
        if (x >= this.tmpX + this.tmpW) {
            x = this.tmpX + this.tmpW;
        }
        if (y >= this.tmpY + this.tmpH) {
            y = this.tmpY + this.tmpH;
        }
        if (h < 0) {
            y = y + h;
            h = Math.abs(h);
        }
        if (w < 0) {
            x = x + w;
            w = Math.abs(w);
        }

        ctx.restore();

        this.select({ h, w, x, y });
        this.h = h;
        this.w = w;
        this.x = x;
        this.y = y;
        if (action == "up") {
            this.tmpX = 0;
            this.tmpY = 0;
            this.tmpH = 0;
            this.tmpW = 0;
            this.IsDragging = false;
        }
        return { x, y, h, w };
    }
}
