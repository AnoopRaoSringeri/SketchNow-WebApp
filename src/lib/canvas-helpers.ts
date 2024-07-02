import { Position, Size } from "@/types/canvas";
import {
    CanvasObject,
    CursorPosition,
    ElementEnum,
    ICanvasObjectWithId,
    ICanvasTransform,
    IObjectStyle,
    IObjectValue,
    IToSVGOptions
} from "@/types/custom-canvas";

export const DefaultStyle: IObjectStyle = { fillColor: "transparent", strokeStyle: "#fff", strokeWidth: 1 };

const HOVER_OFFSET = 10;

export const GUTTER = 2;

export const SELECTOR_POINT_RADIUS = 5;

export const CANVAS_SCALING_FACTOR = 0.0001;
export const CANVAS_SCALING_LIMIT = 0.00001;
export const CANVAS_SCALING_MULTIPLIER = 100;
export const CANVAS_ZOOM_IN_OUT_FACTOR = 0.05;

export const MIN_INTERVAL = 1;

export const SELECTION_ELEMENT_ID = "select-element";

export const DEFAULT_TRANSFORM: ICanvasTransform = {
    a: 1,
    b: 0,
    c: 0,
    d: 1,
    e: 0,
    f: 0
};

export const SelectionStyle: IObjectStyle = {
    fillColor: "#ccffff10",
    strokeStyle: "#ccffff",
    strokeWidth: 0.1
};

let CanvasWorker: Worker | null = null;
export class CanvasHelper {
    static getHeightRatio(canvasHeight: number, newHeight: number) {
        return newHeight / canvasHeight;
    }

    static getWidthRatio(canvasWidth: number, newWidth: number) {
        return newWidth / canvasWidth;
    }

    static getSizeRatio(nSize: Size, cSize: Size): Size {
        return { height: nSize.height / cSize.height, width: nSize.width / cSize.width };
    }

    static getCursorPosition(mousePosition: Position, values: CanvasObject, type: ElementEnum): CursorPosition {
        const { x, y } = mousePosition;
        const { x: cx = 0, y: cy = 0, h = 0, w = 0, style = DefaultStyle } = values;
        const { strokeWidth } = style;
        const wFactor = strokeWidth / 2;
        const ucx = cx + -wFactor;
        const ucy = cy + -wFactor;
        const uh = h + ucy + wFactor * 2;
        const uw = w + ucx + wFactor * 2;
        switch (type) {
            case ElementEnum.Square:
            case ElementEnum.Circle:
            case ElementEnum.Rectangle:
                return x >= ucx - HOVER_OFFSET &&
                    x <= ucx + HOVER_OFFSET &&
                    y >= ucy - HOVER_OFFSET &&
                    y <= ucy + HOVER_OFFSET
                    ? "tl"
                    : x >= ucx - HOVER_OFFSET &&
                        x <= ucx + HOVER_OFFSET &&
                        y >= uh - HOVER_OFFSET &&
                        y <= uh + HOVER_OFFSET
                      ? "bl"
                      : x >= uw - HOVER_OFFSET &&
                          x <= uw + HOVER_OFFSET &&
                          y >= ucy - HOVER_OFFSET &&
                          y <= ucy + HOVER_OFFSET
                        ? "tr"
                        : x >= uw - HOVER_OFFSET &&
                            x <= uw + HOVER_OFFSET &&
                            y >= uh - HOVER_OFFSET &&
                            y <= uh + HOVER_OFFSET
                          ? "br"
                          : "m";
            default:
                return "m";
        }
    }

    static getCursor(position: CursorPosition) {
        switch (position) {
            case "tl":
            case "br":
                return "se-resize";
            case "tr":
            case "bl":
                return "sw-resize";
            case "m":
                return "move";
            default:
                return "default";
        }
    }

    static getBoundingArea(type: ElementEnum, { x = 0, y = 0, h = 0, w = 0, points = [] }: Partial<IObjectValue>) {
        switch (type) {
            case ElementEnum.Circle:
                w = w / 2;
                h = h / 2;
                x = x + w;
                y = y + h;
                break;
            case ElementEnum.Rectangle:
            case ElementEnum.Square:
                break;
            case ElementEnum.Pencil: {
                let lx = Number.POSITIVE_INFINITY;
                let ly = Number.POSITIVE_INFINITY;
                let lh = Number.MIN_VALUE;
                let lw = Number.MIN_VALUE;
                points.forEach(([px, py]) => {
                    lx = Math.min(lx, px);
                    ly = Math.min(ly, py);
                    lh = Math.max(lh, py);
                    lw = Math.max(lw, px);
                });
                lh = lh - ly;
                lw = lw - lx;
                h = lh;
                w = lw;
                x = lx;
                y = ly;
                break;
            }
        }
        return { x, y, h, w };
    }

    static isUnderMouse(mousePosition: Position, values: Partial<IObjectValue>) {
        const { x, y } = mousePosition;
        const { x: cx = 0, y: cy = 0, h = 0, w = 0, points = [], style = DefaultStyle } = values;
        const { strokeWidth } = style;
        const wFactor = strokeWidth / 2;
        const ucx = cx + -wFactor;
        const ucy = cy + -wFactor;
        const uh = h + wFactor * 2;
        const uw = w + wFactor * 2;
        const [lpx, lpy] = points.length > 0 ? points[0] : [0, 0];
        return (
            (x >= ucx && x <= ucx + uw && y >= ucy && y <= ucy + uh) ||
            (x >= ucx && x <= ucx + uh && y >= ucy && y <= ucy + uh) ||
            // (x >= cx - ur && y >= cy - ur && x <= cx + ur && y <= cy + ur) ||
            points.find(
                ([px, py]) =>
                    px - (HOVER_OFFSET + wFactor) <= x &&
                    x <= px + HOVER_OFFSET + wFactor &&
                    py - (HOVER_OFFSET + wFactor) <= y &&
                    y <= py + HOVER_OFFSET + wFactor
            ) != null ||
            // (x == ucx && y == ucy) ||
            (x == lpx + wFactor && y == lpy + wFactor)
            // Math.sqrt(Math.pow(cx - x, 2) + Math.pow(cy - y, 2))
        );
    }

    static isUnderArea(
        { height, width, x: px, y: py }: Position & Size,
        { x = 0, y = 0, h = 0, w = 0, points = [] }: Partial<IObjectValue>,
        type: ElementEnum
    ) {
        switch (type) {
            case ElementEnum.Circle:
            case ElementEnum.Rectangle:
            case ElementEnum.Square:
                break;
            case ElementEnum.Pencil: {
                let lx = Number.POSITIVE_INFINITY;
                let ly = Number.POSITIVE_INFINITY;
                let lh = Number.MIN_SAFE_INTEGER;
                let lw = Number.MIN_SAFE_INTEGER;
                points.forEach(([px, py]) => {
                    lx = Math.min(lx, px);
                    ly = Math.min(ly, py);
                    lh = Math.max(lh, py);
                    lw = Math.max(lw, px);
                });
                lh = lh - ly;
                lw = lw - lx;
                h = lh;
                w = lw;
                x = lx;
                y = ly;
                break;
            }
        }
        return h <= height && w <= width && x >= px && y >= py && h + y <= height + py && w + x <= width + px;
    }

    static hoveredElement(mouseCords: Position, elements: ICanvasObjectWithId[]) {
        return elements.find(
            (e) =>
                this.isUnderMouse(mouseCords, e.getValues()) ||
                this.getCursorPosition(mouseCords, e.getValues(), e.type) != "m"
        );
    }

    static getElementsInsideArea(area: Position & Size, elements: ICanvasObjectWithId[]) {
        return elements.filter((e) => this.isUnderArea(area, e.getValues(), e.type));
    }

    static getHTMLStyle(style: IObjectStyle, { height, width }: IToSVGOptions) {
        return `fill: ${style.fillColor}; stroke: ${style.strokeStyle}; stroke-width: ${style.strokeWidth * Math.max(height, width)}px;`;
    }

    static getCurrentMousePosition(event: MouseEvent, { e, f, a }: ICanvasTransform) {
        const { offsetX: x, offsetY: y } = event;
        return { offsetX: (x - e) / a, offsetY: (y - f) / a };
    }

    static getAbsolutePosition({ x, y }: Position, { e, f, a }: ICanvasTransform) {
        return { x, y, ax: x * a + e, ay: y * a + f };
    }

    static getSelectedAreaBoundary(elements: ICanvasObjectWithId[]) {
        let x = Number.POSITIVE_INFINITY;
        let y = Number.POSITIVE_INFINITY;
        let h = Number.MIN_SAFE_INTEGER;
        let w = Number.MIN_SAFE_INTEGER;
        elements.forEach((ele) => {
            const { x: ex = 0, y: ey = 0, h: eh = 0, w: ew = 0, points = [] } = ele.getValues();
            switch (ele.type) {
                case ElementEnum.Circle:
                case ElementEnum.Square:
                case ElementEnum.Rectangle:
                    x = Math.min(x, ex);
                    y = Math.min(y, ey);
                    h = Math.max(h, eh + ey);
                    w = Math.max(w, ew + ex);
                    break;
                case ElementEnum.Line:
                case ElementEnum.Pencil:
                    points.forEach(([px, py]) => {
                        x = Math.min(x, px);
                        y = Math.min(y, py);
                        h = Math.max(h, py);
                        w = Math.max(w, px);
                    });
                    h = h - y;
                    w = w - x;
                    break;
            }
        });
        h = h - y;
        w = w - x;
        return { x, y, h, w };
    }

    static clearCanvasArea(
        ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
        { a, e, f }: ICanvasTransform
    ) {
        const xf = (Math.abs(e) * (a + 1)) / a;
        const yf = (Math.abs(f) * (a + 1)) / a;
        ctx.clearRect(-xf, -yf, window.innerWidth + xf * 2, window.innerHeight + yf * 2);
    }

    static getCanvasBoundary(
        ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
        { a, e, f }: ICanvasTransform,
        size: Size
    ) {
        const xf = (Math.abs(e) * (a + 1)) / a;
        const yf = (Math.abs(f) * (a + 1)) / a;
        return { x: -xf, y: -yf, w: size.width + xf * 2, h: size.height + yf * 2 };
    }

    static applyStyles(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, style: IObjectStyle) {
        ctx.save();
        const { fillColor, strokeStyle, strokeWidth } = style;
        ctx.fillStyle = fillColor;
        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = strokeWidth;
        ctx.lineCap = "round";
    }

    static applySelectedStyle(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) {
        ctx.save();
        ctx.strokeStyle = "#00ffff";
        ctx.fillStyle = "#00ffff";
        ctx.lineWidth = 0.5;
    }

    static applySelection(
        ctx: CanvasRenderingContext2D,
        { height: h, width: w, x, y }: Position & Size,
        withGutter: boolean = true
    ) {
        const { a } = ctx.getTransform();
        const radius = SELECTOR_POINT_RADIUS / a;
        const gutter = withGutter ? GUTTER : 0;
        CanvasHelper.applySelectedStyle(ctx);
        ctx.strokeRect(x - gutter, y - gutter, w + gutter * 2, h + gutter * 2);

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(x, y + h);
        ctx.arc(x, y + h, radius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(x + w, y);
        ctx.arc(x + w, y, radius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(x + w, y + h);
        ctx.arc(x + w, y + h, radius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();

        ctx.closePath();
        ctx.restore();
    }

    static GetDefaultTransForm() {
        return { ...DEFAULT_TRANSFORM };
    }

    static GetCanvasWorker() {
        if (!CanvasWorker) {
            CanvasWorker = new Worker(new URL("../workers/canvas-worker", import.meta.url), {
                type: "module",
                name: "canvas-worker"
            });
        }
        return CanvasWorker;
    }
}
