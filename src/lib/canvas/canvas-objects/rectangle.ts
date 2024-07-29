import { computed, makeObservable, observable } from "mobx";
import { v4 as uuid } from "uuid";

import { CanvasHelper, DefaultStyle } from "@/lib/canvas-helpers";
import { Delta, Position } from "@/types/canvas";
import {
    CursorPosition,
    ElementEnum,
    ICanvasObjectWithId,
    IObjectStyle,
    IObjectValue,
    IToSVGOptions,
    MouseAction,
    ObjectOptions,
    PartialCanvasObject
} from "@/types/custom-canvas";

import { CanvasBoard } from "../canvas-board";

export class Rectangle implements ICanvasObjectWithId {
    readonly Board: CanvasBoard;
    type: ElementEnum = ElementEnum.Rectangle;
    id = uuid();
    style = DefaultStyle;
    order = 0;
    constructor({ x, y, h, w, id, style, order = 0 }: PartialCanvasObject, parent: CanvasBoard) {
        this.x = x ?? 0;
        this.y = y ?? 0;
        this.h = h ?? 0;
        this.w = w ?? 0;
        this.id = id;
        this.style = { ...(style ?? DefaultStyle) };
        this.Board = parent;
        this.order = order;
        makeObservable(this, {
            _isDragging: observable,
            IsDragging: computed
        });
    }
    x = 0;
    y = 0;
    h = 0;
    w = 0;
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

    draw(ctx: CanvasRenderingContext2D) {
        this.create(ctx);
        if (this.IsSelected) {
            this.select({ x: this.x, y: this.y });
        }
        ctx.restore();
    }

    create(ctx: CanvasRenderingContext2D) {
        CanvasHelper.applyStyles(ctx, this.style);
        ctx.strokeRect(this.x, this.y, this.w, this.h);
        ctx.fillRect(this.x, this.y, this.w, this.h);
    }

    select({ x = this.x, y = this.y, h = this.h, w = this.w }: Partial<IObjectValue>) {
        this._isSelected = true;
        if (this.Board.CanvasCopy && this._showSelection) {
            const copyCtx = this.Board.CanvasCopy.getContext("2d");
            if (copyCtx) {
                CanvasHelper.applySelection(copyCtx, { height: h, width: w, x, y });
            }
        }
    }

    unSelect() {
        this._isSelected = false;
        this._showSelection = false;
    }

    update(ctx: CanvasRenderingContext2D, objectValue: Partial<IObjectValue>, action: MouseAction, clearCanvas = true) {
        let { h = this.h, w = this.w, x = this.x, y = this.y } = objectValue;
        CanvasHelper.applyStyles(ctx, this.style);
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

    updateStyle<T extends keyof IObjectStyle>(
        ctx: CanvasRenderingContext2D,
        key: T,
        value: IObjectStyle[T],
        clearCanvas = true
    ) {
        this.style[key] = value;
        CanvasHelper.applyStyles(ctx, this.style);
        if (clearCanvas) {
            this.Board.Helper.clearCanvasArea(ctx);
        }
        ctx.strokeRect(this.x, this.y, this.w, this.h);
        ctx.fillRect(this.x, this.y, this.w, this.h);
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
        ctx.strokeRect(offsetX, offsetY, this.w, this.h);
        ctx.fillRect(offsetX, offsetY, this.w, this.h);
        this.select({ x: offsetX, y: offsetY });
        ctx.restore();
        if (action == "up") {
            this.x = offsetX;
            this.y = offsetY;
            this.IsDragging = false;
        }
    }

    resize(ctx: CanvasRenderingContext2D, delta: Delta, cPos: CursorPosition, action: MouseAction, clearCanvas = true) {
        const { dx, dy } = delta;
        CanvasHelper.applyStyles(ctx, this.style);
        if (clearCanvas) {
            this.Board.Helper.clearCanvasArea(ctx);
        }
        this.IsDragging = true;
        let w = dx;
        let h = dy;
        let y = this.y;
        let x = this.x;
        switch (cPos) {
            case "tl":
                x = x + w;
                y = y + h;
                if (h < 0) {
                    h = Math.abs(Math.abs(h) + this.h);
                } else {
                    h = Math.abs(this.h - Math.abs(h));
                }
                if (w < 0) {
                    w = Math.abs(Math.abs(w) + this.w);
                } else {
                    w = Math.abs(this.w - Math.abs(w));
                }
                break;
            case "tr":
                y = y + h;
                if (h < 0) {
                    h = Math.abs(this.h + Math.abs(h));
                } else {
                    h = Math.abs(Math.abs(h) - this.h);
                }
                if (w < 0) {
                    w = this.w + w;
                } else {
                    w = Math.abs(this.w + Math.abs(w));
                }
                break;
            case "bl":
                x = x + w;
                if (h < 0) {
                    h = this.h - Math.abs(h);
                } else {
                    h = Math.abs(Math.abs(h) + this.h);
                }
                if (w < 0) {
                    w = Math.abs(this.w + Math.abs(w));
                } else {
                    w = Math.abs(this.w - Math.abs(w));
                }
                break;
            case "br":
                if (h < 0) {
                    h = h + this.h;
                } else {
                    h = Math.abs(this.h + Math.abs(h));
                }
                if (w < 0) {
                    w = this.w + w;
                } else {
                    w = Math.abs(this.w + Math.abs(w));
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
        if (x >= this.x + this.w) {
            x = this.x + this.w;
        }
        if (y >= this.y + this.h) {
            y = this.y + this.h;
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

        this.select({ h, w, x, y });
        if (action == "up") {
            this.h = h;
            this.w = w;
            this.x = x;
            this.y = y;
            this.IsDragging = false;
        }
        return { x, y, h, w };
    }

    getValues() {
        return {
            type: this.type,
            id: this.id,
            h: this.h,
            w: this.w,
            x: this.x,
            y: this.y,
            style: this.style,
            order: this.order
        };
    }

    set<T extends keyof ObjectOptions>(key: T, value: ObjectOptions[T]) {
        this[key] = value;
    }

    getPosition() {
        return CanvasHelper.getAbsolutePosition({ x: this.x, y: this.y }, this.Board.Transform);
    }

    toSVG(options: IToSVGOptions) {
        return `<rect width="${this.w * options.width}" height="${this.h * options.height}" x="${this.x * options.width}" y="${this.y * options.height}" style="${CanvasHelper.getHTMLStyle(this.style, options)}" />`;
    }
}
