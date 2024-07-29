import { action, computed, makeObservable, observable, toJS } from "mobx";
import { createRef } from "react";
import { v4 as uuid } from "uuid";

import { AdditionalCanvasOptions, CanvasMetadata, Position, Size } from "@/types/canvas";
import {
    CanvasActionEnum,
    CursorPosition,
    ElementEnum,
    ICanvas,
    ICanvasObjectWithId,
    ICanvasTransform,
    IObjectStyle,
    IToSVGOptions
} from "@/types/custom-canvas";
import { CanvasWorkerMessage } from "@/types/worker";

import {
    CANVAS_SCALING_LIMIT,
    CANVAS_SCALING_MULTIPLIER,
    CANVAS_ZOOM_IN_OUT_FACTOR,
    CanvasHelper,
    DefaultStyle,
    MIN_INTERVAL
} from "../canvas-helpers";
import { CavasObjectMap } from "./canvas-objects/object-mapping";
import { EventManager } from "./event-handler";

let CanvasWorker: Worker | null = null;
export class CanvasBoard implements ICanvas {
    private _lastTimestamp = 0;
    private _clicked = false;
    private _canvas: React.RefObject<HTMLCanvasElement>;
    private _canvasCopy: React.RefObject<HTMLCanvasElement>;
    private _elements: ICanvasObjectWithId[] = [];
    private _pointerOrigin: Position | null = null;
    private _readOnly: boolean = false;
    private _cursorPosition: CursorPosition | null = null;

    private _activeObjects: ICanvasObjectWithId[] = [];
    private _hoveredObject: ICanvasObjectWithId | null = null;

    _elementType: ElementEnum = ElementEnum.Move;
    _isElementSelectorLocked = true;
    _currentCanvasAction: CanvasActionEnum = CanvasActionEnum.Select;
    _zoom = 100;
    _style: IObjectStyle = DefaultStyle;
    _selectedElements: ICanvasObjectWithId[] = [];
    _canvasTransform: ICanvasTransform = CanvasHelper.GetDefaultTransForm();

    private EventManager: EventManager;
    _tempSelectionArea: ICanvasObjectWithId | null = null;
    _selectionArea: ICanvasObjectWithId | null = null;
    _applySelectionStyle = true;

    Helper: CanvasHelper;

    text: ICanvasObjectWithId | null = null;

    image: ICanvasObjectWithId | null = null;

    constructor() {
        this.EventManager = new EventManager(this);
        this._canvas = createRef();
        this._canvasCopy = createRef();
        this.Helper = new CanvasHelper(this);
        makeObservable(this, {
            _elementType: observable,
            ElementType: computed,
            _isElementSelectorLocked: observable,
            IsElementSelectorLocked: computed,
            _style: observable,
            Style: computed,
            setStyle: action,
            _selectedElements: observable,
            SelectedElements: computed,
            _zoom: observable,
            Zoom: computed,
            _canvasTransform: observable,
            Transform: computed,
            _selectionArea: observable,
            SelectionElement: computed,
            NewOrder: computed,
            Elements: computed,
            text: observable,
            Text: computed,
            image: observable,
            Image: computed
        });
    }

    get Canvas() {
        if (!this._canvas.current) {
            throw new Error("canvas is not initialized");
        }
        return this._canvas.current!;
    }

    get CanvasCopy() {
        if (this.ReadOnly) {
            return null;
        }
        // if (!this._canvasCopy.current) {
        //     throw new Error("canvas copy is not initialized");
        // }
        return this._canvasCopy.current!;
    }

    get CanvasRef() {
        return this._canvas;
    }

    get CanvasCopyRef() {
        return this._canvasCopy;
    }

    get ElementType() {
        return this._elementType;
    }

    set ElementType(type: ElementEnum) {
        if (type != this._elementType) {
            this.Text = null;
            this._elementType = type;
            this._activeObjects = [];
            this.unSelectElements();
            if (this.CanvasCopy) {
                if (type == ElementEnum.Pencil) {
                    this.CanvasCopy.style.cursor = "crosshair";
                } else {
                    this.CanvasCopy.style.cursor = "default";
                }
            }
        }
    }

    get Height() {
        return this.Canvas.height;
    }

    set Height(height: number) {
        this.Canvas.height = height;
        if (this.CanvasCopy) {
            this.CanvasCopy.height = height;
        }
    }

    get Width() {
        return this.Canvas.width;
    }

    set Width(width: number) {
        this.Canvas.width = width;
        if (this.CanvasCopy) {
            this.CanvasCopy.width = width;
        }
    }

    get ReadOnly() {
        return this._readOnly;
    }

    set ReadOnly(value: boolean) {
        this._readOnly = value;
    }

    get Zoom() {
        return this._zoom;
    }

    set Zoom(zoom: number) {
        this._zoom = zoom;
    }

    get Style() {
        return toJS(this._style);
    }

    get SelectedElements() {
        return this._selectedElements;
    }

    set SelectedElements(elements: ICanvasObjectWithId[]) {
        this._selectedElements = elements;
    }

    get Transform() {
        return this._canvasTransform;
    }

    get SelectionElement() {
        return this._selectionArea;
    }

    set SelectionElement(ele: ICanvasObjectWithId | null) {
        this._selectionArea = ele;
    }

    set Transform(transform: ICanvasTransform) {
        this._canvasTransform = transform;
    }

    get ActiveObjects() {
        return this._activeObjects;
    }

    set ActiveObjects(objects: ICanvasObjectWithId[]) {
        this._activeObjects = objects;
    }

    get Elements() {
        return this._elements.sort((a, b) => a.order - b.order);
    }

    set Elements(objects: ICanvasObjectWithId[]) {
        this._elements = objects;
    }

    get HoveredObject() {
        return this._hoveredObject;
    }

    set HoveredObject(object: ICanvasObjectWithId | null) {
        this._hoveredObject = object;
    }

    get PointerOrigin() {
        return this._pointerOrigin;
    }

    set PointerOrigin(origin: Position | null) {
        this._pointerOrigin = origin;
    }

    get CursorPosition() {
        return this._cursorPosition;
    }

    set CursorPosition(position: CursorPosition | null) {
        this._cursorPosition = position;
    }

    get Clicked() {
        return this._clicked;
    }

    set Clicked(value: boolean) {
        this._clicked = value;
    }

    get IsElementSelectorLocked() {
        return this._isElementSelectorLocked;
    }

    set IsElementSelectorLocked(value: boolean) {
        this._isElementSelectorLocked = value;
    }

    get NewOrder() {
        return this.Elements.length + 1;
    }

    get Text() {
        return this.text;
    }

    set Text(value: ICanvasObjectWithId | null) {
        this.text = value;
    }

    get Image() {
        return this.image;
    }

    set Image(value: ICanvasObjectWithId | null) {
        this.image = value;
    }

    updateText(value: string) {
        if (!this.CanvasCopy || !this.Text) {
            return;
        }
        const context = this.CanvasCopy.getContext("2d");
        if (!context) {
            return;
        }
        this.Text.update(context, { value: value }, "down");
        this.PointerOrigin = null;
        this._elements.push(this.Text);
        this.Text = null;
        this.redrawBoard();
    }

    uploadImage(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files || !this.CanvasCopy) {
            return;
        }
        const ctx = this.CanvasCopy.getContext("2d");
        if (!ctx) {
            return;
        }
        const file = e.target.files[0];
        const reader = new FileReader();
        // Read in the image file as a data URL.
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            this.drawImage(event, ctx);
        };
    }

    drawImage(event: ProgressEvent<FileReader>, ctx: CanvasRenderingContext2D) {
        if (
            event.target?.readyState == FileReader.DONE &&
            event.target.result &&
            typeof event.target.result === "string"
        ) {
            this.Image?.update(ctx, { value: event.target.result }, "up");
            this.PointerOrigin = null;
            this._elements.push(this.Image!);
            this.Image = null;
            this.redrawBoard();
        }
    }

    init({ width, height }: Size) {
        if (!this.CanvasCopy) {
            return;
        }
        this.Canvas.width = this.CanvasCopy.width = width;
        this.Canvas.height = this.CanvasCopy.height = height;
    }

    loadBoard(metadata: CanvasMetadata, { height, readonly, width, draw }: Partial<AdditionalCanvasOptions>) {
        CanvasWorker = CanvasHelper.GetCanvasWorker();

        this.ReadOnly = readonly ?? false;
        this.Height = height ?? metadata.size.height;
        this.Width = width ?? metadata.size.width;
        this.Transform = metadata.transform;
        this.Zoom = metadata.transform.scaleX * CANVAS_SCALING_MULTIPLIER;
        const objArray = metadata.elements.map((ele) => {
            return CavasObjectMap[ele.type](ele, this);
        });
        this._elements = objArray;
        if (draw) {
            this.redrawBoard();
        }
    }

    createBoard({ height = window.innerHeight, width = window.innerWidth }: Partial<AdditionalCanvasOptions>) {
        CanvasWorker = CanvasHelper.GetCanvasWorker();
        this.Height = height;
        this.Width = width;
    }

    resizeBoard() {
        this.Canvas.width = window.innerWidth;
        this.Canvas.height = window.innerHeight;
        if (this.CanvasCopy) {
            this.CanvasCopy.width = window.innerWidth;
            this.CanvasCopy.height = window.innerHeight;
        }
        this.redrawBoard();
    }

    setStyle<T extends keyof IObjectStyle>(key: T, value: IObjectStyle[T]) {
        this._style[key] = value;
        if (this.CanvasCopy) {
            const context = this.CanvasCopy.getContext("2d");
            if (context) {
                context.save();
            }
        }
    }

    updateStyle<T extends keyof IObjectStyle>(key: T, value: IObjectStyle[T]) {
        if (this.CanvasCopy) {
            const context = this.CanvasCopy.getContext("2d");
            if (context && this._selectedElements.length > 0) {
                const clearCanvas = this.SelectionElement == null;
                if (!clearCanvas) {
                    this.Helper.clearCanvasArea(context);
                }
                this._selectedElements.forEach((ele) => {
                    ele.updateStyle(context, key, value, clearCanvas);
                });
                if (this.SelectionElement) {
                    this.SelectionElement.set("ShowSelection", true);
                    this.SelectionElement.select({});
                }
                this.SelectedElements = [...this._selectedElements];
            }
        }
    }

    selectElements() {
        //
    }

    unSelectElements() {
        this.SelectedElements.forEach((ele) => {
            ele.unSelect();
        });
        this.SelectedElements = [];
        this._tempSelectionArea = null;
        this.SelectionElement = null;
        this._applySelectionStyle = true;
        this.redrawBoard();
    }

    removeElement(id: string) {
        this._elements = this.Elements.filter((e) => e.id != id);
        this.SelectedElements = [];
        this.redrawBoard();
    }

    removeElements() {
        this._elements = this.Elements.filter((e) => this.SelectedElements.find((se) => se.id == e.id) == null);
        this.SelectedElements = [];
        this.SelectionElement = null;
        this.redrawBoard();
    }

    copyElement(id: string) {
        if (!this.CanvasCopy) {
            return;
        }
        const context = this.CanvasCopy.getContext("2d");
        if (!context) {
            return;
        }
        const elementToCopy = this.Elements.find((e) => e.id == id);
        if (elementToCopy) {
            const copyElement = CavasObjectMap[elementToCopy.type](
                { ...elementToCopy, id: uuid(), order: this.NewOrder },
                this
            );
            copyElement.move(context, { x: 0, y: 0 }, "down");
            copyElement.move(context, { x: 40, y: 40 }, "up");
            context.closePath();
            this._elements.push(copyElement);
            this.SelectedElements = [copyElement];
            this.saveBoard();
        }
    }

    copyElements() {
        if (!this.CanvasCopy) {
            return;
        }
        if (!this.SelectionElement) {
            return;
        }
        const context = this.CanvasCopy.getContext("2d");
        if (!context) {
            return;
        }
        const elementsToCopy = this.Elements.filter((e) => this.SelectedElements.find((se) => se.id == e.id) != null);
        this.Helper.clearCanvasArea(context);
        const copiedItems: ICanvasObjectWithId[] = [];
        elementsToCopy.forEach((ele, i) => {
            const copyElement = CavasObjectMap[ele.type]({ ...ele, id: uuid(), order: this.NewOrder + i }, this);
            copyElement.move(context, { x: 0, y: 0 }, "down", false);
            copyElement.move(context, { x: 40, y: 40 }, "up", false);
            copiedItems.push(copyElement);
        });
        context.closePath();

        this.SelectedElements = copiedItems;
        if (this.SelectedElements.length <= 0) {
            this.PointerOrigin = null;
            this.unSelectElements();
            return;
        }
        this._applySelectionStyle = false;
        // Uncomment if individual selection is required
        this.SelectedElements.forEach((ele) => {
            ele.select(ele.getValues());
            ele.set("ShowSelection", false);
        });
        const selectedAreaBoundary = CanvasHelper.getSelectedAreaBoundary(this.SelectedElements);
        this.SelectionElement.update(
            context,
            {
                ...selectedAreaBoundary
            },
            "up"
        );
        this.SelectionElement.draw(context);
        this.SelectionElement.select({});
        this.SelectionElement.set("ShowSelection", true);
        elementsToCopy.forEach((ele) => {
            ele.unSelect();
        });
        this.ActiveObjects = copiedItems;
        this.saveBoard();
    }

    zoomIn() {
        if (this.CanvasCopy) {
            const contextCopy = this.CanvasCopy.getContext("2d");
            if (contextCopy) {
                this.Helper.clearCanvasArea(contextCopy);
            }
        }
        const context = this.Canvas.getContext("2d");
        if (context) {
            this.Helper.clearCanvasArea(context);
        }
        this.Transform = {
            ...this.Transform,
            scaleX: this.Transform.scaleX + CANVAS_ZOOM_IN_OUT_FACTOR,
            scaleY: this.Transform.scaleY + CANVAS_ZOOM_IN_OUT_FACTOR
        };
        this.Zoom = this.Transform.scaleX * CANVAS_SCALING_MULTIPLIER;
        this.redrawBoard();
    }

    zoomOut() {
        if (this.CanvasCopy) {
            const contextCopy = this.CanvasCopy.getContext("2d");
            if (contextCopy) {
                this.Helper.clearCanvasArea(contextCopy);
            }
        }
        const context = this.Canvas.getContext("2d");
        if (context) {
            this.Helper.clearCanvasArea(context);
        }
        const newScale = Math.max(CANVAS_SCALING_LIMIT, this.Transform.scaleX - CANVAS_ZOOM_IN_OUT_FACTOR);
        this.Transform = {
            ...this.Transform,
            scaleX: newScale,
            scaleY: newScale
        };
        this.Zoom = this.Transform.scaleX * CANVAS_SCALING_MULTIPLIER;
        this.redrawBoard();
    }

    fitToView() {
        if (this.CanvasCopy) {
            const contextCopy = this.CanvasCopy.getContext("2d");
            if (contextCopy) {
                this.Helper.clearCanvasArea(contextCopy);
            }
        }
        const context = this.Canvas.getContext("2d");
        if (context) {
            this.Helper.clearCanvasArea(context);
        }
        this.Transform = CanvasHelper.GetDefaultTransForm();
        this.Zoom = 100;
        this.redrawBoard();
    }

    saveBoard() {
        if (this._activeObjects.length > 0) {
            if (this.SelectionElement) {
                this._elements.push(...this._activeObjects);
                this._pointerOrigin = null;
                this.SelectedElements = this._activeObjects;
                this._activeObjects = [];
                this._hoveredObject = null;
            } else {
                this._elements.push(...this._activeObjects);
                this._pointerOrigin = null;
                this._activeObjects = [];
                this._hoveredObject = null;
            }
        }
        if (!this._isElementSelectorLocked) {
            this.ElementType = ElementEnum.Move;
        }
        this.redrawBoard();
    }

    redrawBoard() {
        const fId = window.requestAnimationFrame((timestamp) => {
            if (timestamp - this._lastTimestamp >= MIN_INTERVAL) {
                if (!CanvasWorker) {
                    return;
                }
                if (this.CanvasCopy) {
                    const contextCopy = this.CanvasCopy.getContext("2d");
                    if (contextCopy) {
                        this.Helper.clearCanvasArea(contextCopy);
                        contextCopy.resetTransform();
                        const { scaleX: a, b, c, scaleY: d, transformX: e, transformY: f } = this.Transform;
                        contextCopy.transform(a, b, c, d, e, f);
                        this.ActiveObjects.forEach((ele) => {
                            ele.draw(contextCopy);
                        });
                        if (this.SelectionElement) {
                            this.SelectionElement.draw(contextCopy);
                        }
                        contextCopy.restore();
                    }
                }
                const context = this.Canvas.getContext("2d");
                if (context) {
                    this.Helper.clearCanvasArea(context);
                    context.resetTransform();
                    const { scaleX: a, b, c, scaleY: d, transformX: e, transformY: f } = this.Transform;
                    context.transform(a, b, c, d, e, f);
                    this.Elements.forEach((ele) => {
                        ele.draw(context);
                    });
                    context.restore();
                }
                CanvasWorker.onmessage = function (e) {
                    console.log(e.data);
                };

                // this.RunInWorker({
                //     type: "redraw",
                //     data: {
                //         metadata: this.toJSON()
                //     }
                // });
                // CanvasWorker.onmessage = (e) => {
                //     const btm = e.data;
                //     const ctx = this.Canvas.getContext("bitmaprenderer");
                //     if (ctx) {
                //         ctx.transferFromImageBitmap(btm);
                //     }
                //     console.log(ctx);
                // };
                this._lastTimestamp = timestamp;
            }
        });

        setTimeout(() => {
            window.cancelAnimationFrame(fId);
        }, 100);
    }

    dispose() {
        this.SelectedElements = [];
        this._activeObjects = [];
        this.ElementType = ElementEnum.Move;
        this.ReadOnly = false;
        this._hoveredObject = null;
        this._currentCanvasAction = CanvasActionEnum.Select;
        this.Transform = CanvasHelper.GetDefaultTransForm();
    }

    toJSON(): CanvasMetadata {
        return {
            elements: [...this.Elements.map((ele) => ele.getValues())],
            size: { height: this.Height, width: this.Width },
            transform: this.Transform
        };
    }

    toSVG({ height, width }: IToSVGOptions) {
        let svgString = "";
        const sRatio = CanvasHelper.getSizeRatio({ height, width }, { height: this.Height, width: this.Width });
        this.Elements.forEach((ele) => {
            svgString += ele.toSVG(sRatio);
        });
        return `<svg width="${width}" height="${height}" xmlns="http://sketch-now/svg">${svgString}</svg>`;
    }

    onMouseDown(e: MouseEvent) {
        this.EventManager.onMouseDown(e);
    }

    onMouseMove(e: MouseEvent) {
        this.EventManager.onMouseMove(e);
    }

    onMouseUp(e: MouseEvent) {
        this.EventManager.onMouseUp(e);
    }

    onWheelAction(e: WheelEvent) {
        this.EventManager.onWheelAction(e);
    }

    onTouchStart(e: TouchEvent) {
        this.EventManager.onTouchStart(e);
    }

    onTouchMove(e: TouchEvent) {
        this.EventManager.onTouchMove(e);
    }

    onTouchEnd(e: TouchEvent) {
        this.EventManager.onTouchEnd(e);
    }

    RunInWorker = (message: CanvasWorkerMessage) => {
        CanvasWorker!.postMessage(message);
    };
}
