import { v4 as uuid } from "uuid";

import { CanvasHelper, DefaultFont, DefaultStyle } from "@/lib/canvas-helpers";
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

export class CanvasImage implements ICanvasObjectWithId {
    readonly Board: CanvasBoard;
    type: ElementEnum = ElementEnum.Image;
    id = uuid();
    style = DefaultStyle;
    order = 0;
    image = new Image();
    constructor(v: PartialCanvasObject, parent: CanvasBoard) {
        this.x = v.x ?? 0;
        this.y = v.y ?? 0;
        this.h = v.h ?? 0;
        this.w = v.w ?? 0;
        this.value = v.value ?? "";
        this.id = v.id;
        this.style = { ...(v.style ?? DefaultStyle) };
        this.style.font = this.style.font ?? DefaultFont;
        this.Board = parent;
        this.order = v.order ?? 0;
    }
    value = "";
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
        if (this.value == "") {
            return;
        }
        CanvasHelper.applyStyles(ctx, this.style);
        if (this.image.src == "" || this.image.src == null) {
            this.image.src = this.value;
            this.image.onload = () => {
                ctx.drawImage(this.image, this.x, this.y);
                this.w = this.image.width;
                this.h = this.image.height;
            };
        } else {
            ctx.drawImage(this.image, this.x, this.y, this.w, this.h);
        }
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
        ctx.drawImage(this.image, offsetX, offsetY, this.w, this.h);
        this.select({ x: offsetX, y: offsetY });
        ctx.restore();
        if (action == "up") {
            this.x = offsetX;
            this.y = offsetY;
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
        ctx.drawImage(this.image, x, y, w, h);

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
}
