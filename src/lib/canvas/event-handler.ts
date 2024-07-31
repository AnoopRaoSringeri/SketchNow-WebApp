import { v4 as uuid } from "uuid";

import { CanvasActionEnum, ElementEnum } from "@/types/custom-canvas";

import {
    CANVAS_SCALING_FACTOR,
    CANVAS_SCALING_LIMIT,
    CANVAS_SCALING_MULTIPLIER,
    CanvasHelper,
    SELECTION_ELEMENT_ID,
    SelectionStyle
} from "../canvas-helpers";
import { CanvasBoard } from "./canvas-board";
import { CavasObjectMap } from "./canvas-objects/object-mapping";

export class EventManager {
    private readonly Board: CanvasBoard;
    constructor(canvasBoard: CanvasBoard) {
        this.Board = canvasBoard;
    }

    onMouseDown(e: MouseEvent) {
        if (this.Board.Clicked) {
            return;
        }
        this.Board.Clicked = true;
        if (!this.Board.CanvasCopy) {
            return;
        }
        const context = this.Board.CanvasCopy.getContext("2d");
        if (!context) {
            return;
        }
        if (
            this.Board._selectedElements.length != 0 &&
            (this.Board.HoveredObject == null || this.Board.HoveredObject.id != this.Board._selectedElements[0].id) &&
            (this.Board.SelectionElement == null || this.Board._currentCanvasAction == CanvasActionEnum.Select)
        ) {
            this.Board.unSelectElements();
        }
        const { offsetX, offsetY } = CanvasHelper.getCurrentMousePosition(e, this.Board.Transform);
        this.Board.PointerOrigin = { x: offsetX, y: offsetY };
        if (e.detail == 1 && e.ctrlKey) {
            this.Board._currentCanvasAction = CanvasActionEnum.Pan;
            this.Board.PointerOrigin = { x: e.offsetX, y: e.offsetY };
        } else if (this.Board.ElementType == ElementEnum.Move) {
            if (e.detail == 1) {
                if (this.Board.HoveredObject) {
                    this.Board.Elements = this.Board.Elements.filter((e) => e.id != this.Board.HoveredObject!.id);
                    this.Board.redrawBoard();
                    this.Board.ActiveObjects = [this.Board.HoveredObject];
                    this.Board.SelectedElements = [this.Board.HoveredObject];
                    if (this.Board._currentCanvasAction == CanvasActionEnum.Resize && this.Board.CursorPosition) {
                        this.Board.ActiveObjects.forEach((ao) => {
                            ao.resize(context, { dx: 0, dy: 0 }, this.Board.CursorPosition!, "down");
                        });
                    } else {
                        this.Board.ActiveObjects.forEach((ao) => {
                            ao.move(context, { x: 0, y: 0 }, "down");
                        });
                        this.Board._currentCanvasAction = CanvasActionEnum.Select;
                    }
                } else {
                    this.Board.Helper.clearCanvasArea(context);
                    if (this.Board.SelectionElement) {
                        this.Board._tempSelectionArea = this.Board.SelectionElement;
                        if (this.Board._currentCanvasAction == CanvasActionEnum.Resize) {
                            this.Board.ActiveObjects = this.Board.SelectedElements;
                            this.Board.SelectedElements = [];
                            this.Board.Elements = this.Board.Elements.filter((e) => !e.IsSelected);
                            this.Board.redrawBoard();
                            this.Board._tempSelectionArea.resize(
                                context,
                                { dx: 0, dy: 0 },
                                this.Board.CursorPosition!,
                                "down",
                                false
                            );
                            this.Board.ActiveObjects.forEach((ele) => {
                                ele.update(context, { points: [] }, "down", false);
                            });
                        } else if (this.Board._currentCanvasAction == CanvasActionEnum.Move) {
                            this.Board.ActiveObjects = this.Board.SelectedElements;
                            this.Board.SelectedElements = [];
                            this.Board.Elements = this.Board.Elements.filter((e) => !e.IsSelected);
                            this.Board.redrawBoard();
                            this.Board._tempSelectionArea.move(context, { x: 0, y: 0 }, "down", false);
                            this.Board.ActiveObjects.forEach((ele) => {
                                ele.move(context, { x: 0, y: 0 }, "down", false);
                            });
                        } else {
                            this.Board._tempSelectionArea.update(
                                context,
                                { x: offsetX, y: offsetY, h: 0, w: 0 },
                                "down"
                            );
                        }
                    } else {
                        this.Board._currentCanvasAction = CanvasActionEnum.Select;
                        this.Board._tempSelectionArea = CavasObjectMap[ElementEnum.Rectangle](
                            {
                                x: offsetX,
                                y: offsetY,
                                h: 0,
                                w: 0,
                                id: `temp-${SELECTION_ELEMENT_ID}`,
                                style: SelectionStyle
                            },
                            this.Board
                        );
                        this.Board._tempSelectionArea.create(context);
                    }
                }
            }
        } else {
            if (this.Board.ElementType == ElementEnum.Text) {
                if (!this.Board.Text) {
                    this.Board.Text = CavasObjectMap[ElementEnum.Text](
                        {
                            x: offsetX,
                            y: offsetY,
                            value: "",
                            id: uuid(),
                            style: this.Board.Style,
                            order: this.Board.NewOrder
                        },
                        this.Board
                    );
                    this.Board.Text.create(context);
                }
            } else if (this.Board.ElementType == ElementEnum.Image) {
                this.Board.Image = CavasObjectMap[ElementEnum.Image](
                    {
                        x: offsetX,
                        y: offsetY,
                        value: "",
                        id: uuid(),
                        style: this.Board.Style,
                        order: this.Board.NewOrder
                    },
                    this.Board
                );
                this.Board.Image.create(context);
            } else {
                const newObj = CavasObjectMap[this.Board.ElementType](
                    {
                        x: offsetX,
                        y: offsetY,
                        h: 0,
                        w: 0,
                        points: [[offsetX, offsetY]],
                        id: uuid(),
                        style: this.Board.Style,
                        order: this.Board.NewOrder
                    },
                    this.Board
                );
                newObj.create(context);
                this.Board.ActiveObjects.push(newObj);
            }
        }
    }

    onMouseMove(e: MouseEvent) {
        if (!this.Board.CanvasCopy) {
            return;
        }
        const context = this.Board.CanvasCopy.getContext("2d");
        if (!context) {
            return;
        }
        const { offsetX, offsetY } = CanvasHelper.getCurrentMousePosition(e, this.Board.Transform);
        if (this.Board.PointerOrigin) {
            const { x, y } = this.Board.PointerOrigin;
            if (this.Board._currentCanvasAction == CanvasActionEnum.Pan) {
                const { offsetX, offsetY } = e;
                const dx = offsetX - x;
                const dy = offsetY - y;
                const { transformX: pe, transformY: pf } = this.Board.Transform;
                this.Board.Transform = { ...this.Board.Transform, transformX: pe + dx, transformY: pf + dy };
                this.Board.PointerOrigin = { x: offsetX, y: offsetY };
                this.Board.redrawBoard();
            } else if (this.Board.ElementType == ElementEnum.Move) {
                if (this.Board._tempSelectionArea) {
                    if (this.Board._currentCanvasAction == CanvasActionEnum.Select) {
                        this.Board._tempSelectionArea.update(
                            context,
                            {
                                w: offsetX - x,
                                h: offsetY - y
                                // points: [[offsetX, offsetY]]
                            },
                            "move"
                        );
                    } else if (this.Board._currentCanvasAction == CanvasActionEnum.Move) {
                        this.Board.Helper.clearCanvasArea(context);
                        this.Board._tempSelectionArea.move(context, { x: offsetX - x, y: offsetY - y }, "move", false);
                        this.Board.ActiveObjects.forEach((ele) => {
                            ele.move(context, { x: offsetX - x, y: offsetY - y }, "move", false);
                        });
                    } else if (
                        this.Board._currentCanvasAction == CanvasActionEnum.Resize &&
                        this.Board.CursorPosition
                    ) {
                        this.Board.Helper.clearCanvasArea(context);
                        const {
                            x: px = 0,
                            y: py = 0,
                            h: ph = 0,
                            w: pw = 0
                        } = this.Board._tempSelectionArea.getValues();
                        const {
                            x: rx = 0,
                            y: ry = 0,
                            h: rh = 0,
                            w: rw = 0
                        } = this.Board._tempSelectionArea.resize(
                            context,
                            { dx: offsetX - x, dy: offsetY - y },
                            this.Board.CursorPosition!,
                            "move",
                            false
                        );
                        const cp = this.Board.Helper.getCursorPosition(
                            { x: offsetX, y: offsetY },
                            {
                                id: this.Board._tempSelectionArea.id,
                                x: rx,
                                y: ry,
                                h: rh,
                                w: rw,
                                type: this.Board._tempSelectionArea.type
                            },
                            this.Board._tempSelectionArea.type
                        );
                        this.Board.ActiveObjects.forEach((ele) => {
                            const { x: ex = 0, y: ey = 0, h: eh = 0, w: ew = 0 } = ele.getValues();
                            const uh = (eh * rh) / ph;
                            const uw = (ew * rw) / pw;
                            let ox = 0;
                            let oy = 0;
                            let ux = 0;
                            let uy = 0;
                            switch (cp) {
                                case "br":
                                    ox = ((ex - rx) * rw) / pw;
                                    oy = ((ey - ry) * rh) / ph;
                                    ux = px + ox;
                                    uy = py + oy;
                                    break;
                                case "tr":
                                case "tl":
                                case "bl":
                                    ox = ((ex - px) * rw) / pw;
                                    oy = ((ey - py) * rh) / ph;
                                    ux = rx + ox;
                                    uy = ry + oy;
                            }
                            // if (ele.type == ElementEnum.Pencil) {
                            //     ele.resize(context, { dx: ox, dy: oy }, "m", "move", false);
                            // } else {
                            //     ele.update(context, { h: uh, w: uw, x: ux, y: uy, points: [] }, "move", false);
                            // }
                            ele.update(context, { h: uh, w: uw, x: ux, y: uy, points: [] }, "move", false);
                        });
                    }
                } else {
                    if (this.Board._currentCanvasAction == CanvasActionEnum.Resize && this.Board.CursorPosition) {
                        this.Board.SelectedElements = [];
                        this.Board.ActiveObjects.forEach((ao) => {
                            ao.resize(
                                context,
                                { dx: offsetX - x, dy: offsetY - y },
                                this.Board.CursorPosition!,
                                "move"
                            );
                        });
                    } else {
                        this.Board._currentCanvasAction = CanvasActionEnum.Move;
                        this.Board.SelectedElements = [];
                        this.Board.ActiveObjects.forEach((ao) => {
                            ao.move(context, { x: offsetX - x, y: offsetY - y }, "move");
                        });
                    }
                }
            } else {
                this.Board.ActiveObjects.forEach((ao) => {
                    ao.update(
                        context,
                        {
                            w: offsetX - x,
                            h: offsetY - y,
                            points: [[offsetX, offsetY]]
                        },
                        "move"
                    );
                });
            }
        } else if (this.Board.ElementType == ElementEnum.Move) {
            if (this.Board.SelectionElement) {
                const hovered =
                    this.Board.Helper.isUnderMouse(
                        { x: offsetX, y: offsetY },
                        this.Board.SelectionElement.getValues()
                    ) ||
                    this.Board.Helper.getCursorPosition(
                        { x: offsetX, y: offsetY },
                        this.Board.SelectionElement.getValues(),
                        this.Board.SelectionElement.type
                    ) != "m";
                if (hovered) {
                    this.Board.CursorPosition = this.Board.Helper.getCursorPosition(
                        { x: offsetX, y: offsetY },
                        this.Board.SelectionElement.getValues(),
                        this.Board.SelectionElement.type
                    );
                    if (this.Board.CursorPosition == "m") {
                        this.Board._currentCanvasAction = CanvasActionEnum.Move;
                    } else {
                        this.Board._currentCanvasAction = CanvasActionEnum.Resize;
                    }
                    this.Board.CanvasCopy.style.cursor = CanvasHelper.getCursor(this.Board.CursorPosition);
                    this.Board._tempSelectionArea = this.Board.SelectionElement;
                } else {
                    this.Board.CursorPosition = null;
                    this.Board._currentCanvasAction = CanvasActionEnum.Select;
                    this.Board.CanvasCopy.style.cursor = "default";
                    this.Board._tempSelectionArea = null;
                }
            } else {
                const ele = this.Board.Helper.hoveredElement({ x: offsetX, y: offsetY }, [
                    ...this.Board.Elements,
                    ...this.Board.Tables
                ]);
                if (ele) {
                    this.Board.CursorPosition = this.Board.Helper.getCursorPosition(
                        { x: offsetX, y: offsetY },
                        ele.getValues(),
                        ele.type
                    );
                    if (this.Board.CursorPosition == "m") {
                        this.Board._currentCanvasAction = CanvasActionEnum.Move;
                    } else {
                        this.Board._currentCanvasAction = CanvasActionEnum.Resize;
                    }
                    this.Board.CanvasCopy.style.cursor = CanvasHelper.getCursor(this.Board.CursorPosition);
                    this.Board.HoveredObject = ele;
                } else {
                    this.Board.CursorPosition = null;
                    this.Board._currentCanvasAction = CanvasActionEnum.Select;
                    this.Board.CanvasCopy.style.cursor = "default";
                    this.Board.HoveredObject = null;
                }
            }
        }
    }

    onMouseUp(e: MouseEvent) {
        if (!this.Board.Clicked) {
            return;
        }
        this.Board.Clicked = false;
        if (!this.Board.CanvasCopy) {
            return;
        }
        const context = this.Board.CanvasCopy.getContext("2d");
        if (!context) {
            return;
        }
        if (!this.Board.PointerOrigin) {
            return;
        }
        const { x, y } = this.Board.PointerOrigin;
        const { offsetX, offsetY } = CanvasHelper.getCurrentMousePosition(e, this.Board.Transform);
        if (this.Board._tempSelectionArea) {
            if (this.Board._currentCanvasAction == CanvasActionEnum.Resize) {
                const { x: px = 0, y: py = 0, h: ph = 0, w: pw = 0 } = this.Board._tempSelectionArea.getValues();
                const {
                    x: rx = 0,
                    y: ry = 0,
                    h: rh = 0,
                    w: rw = 0
                } = this.Board._tempSelectionArea.resize(
                    context,
                    { dx: offsetX - x, dy: offsetY - y },
                    this.Board.CursorPosition!,
                    "up"
                );
                const cp = this.Board.Helper.getCursorPosition(
                    { x: offsetX, y: offsetY },
                    {
                        id: this.Board._tempSelectionArea.id,
                        x: rx,
                        y: ry,
                        h: rh,
                        w: rw,
                        type: this.Board._tempSelectionArea.type
                    },
                    this.Board._tempSelectionArea.type
                );
                this.Board.ActiveObjects.forEach((ele) => {
                    const { x: ex = 0, y: ey = 0, h: eh = 0, w: ew = 0 } = ele.getValues();
                    const uh = (eh * rh) / ph;
                    const uw = (ew * rw) / pw;
                    let ox = 0;
                    let oy = 0;
                    let ux = 0;
                    let uy = 0;
                    switch (cp) {
                        case "br":
                            ox = ((ex - rx) * rw) / pw;
                            oy = ((ey - ry) * rh) / ph;
                            ux = px + ox;
                            uy = py + oy;
                            break;
                        case "tr":
                        case "tl":
                        case "bl":
                            ox = ((ex - px) * rw) / pw;
                            oy = ((ey - py) * rh) / ph;
                            ux = rx + ox;
                            uy = ry + oy;
                            break;
                    }
                    ele.update(context, { h: uh, w: uw, x: ux, y: uy, points: [] }, "up", false);
                });
                this.Board.SelectionElement = this.Board._tempSelectionArea;
                context.closePath();
                this.Board.saveBoard();
                return;
            } else if (this.Board._currentCanvasAction == CanvasActionEnum.Move) {
                this.Board._tempSelectionArea.move(context, { x: offsetX - x, y: offsetY - y }, "up");
            } else {
                this.Board._tempSelectionArea.update(
                    context,
                    {
                        w: offsetX - x,
                        h: offsetY - y,
                        points: [[offsetX, offsetY]]
                    },
                    "up"
                );
                const { h = 0, w = 0, x: sax = 0, y: say = 0 } = this.Board._tempSelectionArea.getValues();
                this.Board.SelectedElements = CanvasHelper.getElementsInsideArea(
                    { height: h, width: w, x: sax, y: say },
                    this.Board.Elements
                );
                if (this.Board.SelectedElements.length <= 0) {
                    this.Board.PointerOrigin = null;
                    this.Board.unSelectElements();
                    return;
                }
                this.Board._applySelectionStyle = false;
                // Uncomment if individual selection is required
                this.Board.SelectedElements.forEach((ele) => {
                    ele.select(ele.getValues());
                    ele.set("ShowSelection", false);
                });
                const selectedAreaBoundary = CanvasHelper.getSelectedAreaBoundary(this.Board.SelectedElements);
                this.Board._tempSelectionArea.update(
                    context,
                    {
                        ...selectedAreaBoundary
                    },
                    "up"
                );
                this.Board._tempSelectionArea.draw(context);
                this.Board._tempSelectionArea.select({});
                this.Board._tempSelectionArea.set("ShowSelection", true);
            }
            this.Board.SelectionElement = this.Board._tempSelectionArea;
        }
        if (this.Board.ActiveObjects.length != 0) {
            if (this.Board.ElementType == ElementEnum.Move) {
                if (this.Board._currentCanvasAction == CanvasActionEnum.Resize) {
                    this.Board.ActiveObjects.forEach((ao) => {
                        ao.resize(context, { dx: offsetX - x, dy: offsetY - y }, this.Board.CursorPosition!, "up");
                    });
                } else if (this.Board._currentCanvasAction == CanvasActionEnum.Select) {
                    this.Board.ActiveObjects.forEach((ao) => {
                        ao.select(ao.getValues());
                        ao.set("ShowSelection", true);
                    });
                } else {
                    this.Board.ActiveObjects.forEach((ao) => {
                        ao.move(context, { x: offsetX - x, y: offsetY - y }, "up");
                    });
                }
                this.Board.Tables.forEach((t) => {
                    const table = this.Board.ActiveObjects.find((e) => e.id == t.id);
                    if (table) {
                        t.update(context, table.getValues(), "up", false);
                    }
                });
                this.Board.ActiveObjects = this.Board.ActiveObjects.filter((e) => e.type != ElementEnum.Table);
                this.Board.SelectedElements = this.Board.ActiveObjects;
            } else {
                this.Board.ActiveObjects.forEach((ao) => {
                    ao.update(
                        context,
                        {
                            w: offsetX - x,
                            h: offsetY - y,
                            points: [[offsetX, offsetY]]
                        },
                        "up"
                    );
                });
                if (this.Board.ElementType == ElementEnum.Table) {
                    this.Board.Tables = [
                        ...this.Board.Tables,
                        ...this.Board.ActiveObjects.filter((e) => e.type == ElementEnum.Table)
                    ];
                    this.Board.ActiveObjects = [];
                }
            }
            context.closePath();
            this.Board.saveBoard();
        } else {
            this.Board.PointerOrigin = null;
            context.closePath();
            this.Board.redrawBoard();
            this.Board._currentCanvasAction = CanvasActionEnum.Select;
            this.Board._tempSelectionArea = null;
        }
    }

    onWheelAction(e: WheelEvent) {
        const oldX = this.Board.Transform.transformX;
        const oldY = this.Board.Transform.transformY;

        const localX = e.clientX;
        const localY = e.clientY;

        const previousScale = this.Board.Transform.scaleX;
        const newScale = Number(Math.abs(this.Board.Transform.scaleX + e.deltaY * CANVAS_SCALING_FACTOR).toFixed(4));
        const newX = localX - (localX - oldX) * (newScale / previousScale);
        const newY = localY - (localY - oldY) * (newScale / previousScale);
        if (newScale <= CANVAS_SCALING_LIMIT) {
            const newScale = CANVAS_SCALING_LIMIT;
            const newX = localX - (localX - oldX) * (newScale / previousScale);
            const newY = localY - (localY - oldY) * (newScale / previousScale);
            this.Board.Transform = {
                ...this.Board.Transform,
                transformX: newX,
                transformY: newY,
                scaleX: newScale,
                scaleY: newScale
            };
            this.Board.Zoom = newScale * CANVAS_SCALING_MULTIPLIER;
            return;
        }
        if (isNaN(newX) || isNaN(newY) || !isFinite(newX) || !isFinite(newY)) {
            return;
        }
        this.Board.Transform = {
            ...this.Board.Transform,
            transformX: newX,
            transformY: newY,
            scaleX: newScale,
            scaleY: newScale
        };
        this.Board.Zoom = newScale * CANVAS_SCALING_MULTIPLIER;
        this.Board.redrawBoard();
    }

    onTouchStart(e: TouchEvent) {
        if (!this.Board.CanvasCopy) {
            return;
        }
        const context = this.Board.CanvasCopy.getContext("2d");
        if (!context) {
            return;
        }
        if (
            this.Board.SelectedElements.length != 0 &&
            this.Board.HoveredObject?.id != this.Board.SelectedElements[0]?.id
        ) {
            this.Board.unSelectElements();
        }
        const { clientX: offsetX, clientY: offsetY } = e.touches[0];
        this.Board.PointerOrigin = { x: offsetX, y: offsetY };
        if (this.Board.ElementType == ElementEnum.Move) {
            const ele = this.Board.Helper.hoveredElement({ x: offsetX, y: offsetY }, this.Board.Elements);
            if (ele) {
                this.Board.Elements = this.Board.Elements.filter((e) => e.id != ele.id);
                this.Board.redrawBoard();
                this.Board.HoveredObject = ele;
                this.Board.ActiveObjects = [ele];
                this.Board.SelectedElements = [ele];
                this.Board.ActiveObjects[0].move(context, { x: 0, y: 0 }, "down");
            }
            const table = this.Board.Helper.hoveredElement({ x: offsetX, y: offsetY }, this.Board.Tables);
            if (table) {
                this.Board.Elements = this.Board.Elements.filter((e) => e.id != table.id);
                this.Board.redrawBoard();
                this.Board.HoveredObject = table;
                this.Board.ActiveObjects = [table];
                this.Board.SelectedElements = [table];
                this.Board.ActiveObjects[0].move(context, { x: 0, y: 0 }, "down");
            }
        } else {
            const newObj = CavasObjectMap[this.Board.ElementType](
                {
                    x: offsetX,
                    y: offsetY,
                    h: 0,
                    w: 0,
                    points: [[offsetX, offsetY]],
                    id: uuid(),
                    style: this.Board.Style,
                    order: this.Board.NewOrder
                },
                this.Board
            );
            newObj.create(context);
            this.Board.ActiveObjects.push(newObj);
        }
    }

    onTouchMove(e: TouchEvent) {
        if (!this.Board.CanvasCopy) {
            return;
        }
        const context = this.Board.CanvasCopy.getContext("2d");
        if (!context) {
            return;
        }
        const { clientX: offsetX, clientY: offsetY } = e.touches[0];
        if (this.Board.ActiveObjects.length != 0 && this.Board.PointerOrigin) {
            const { x, y } = this.Board.PointerOrigin;
            if (this.Board.ElementType == ElementEnum.Move) {
                this.Board.ActiveObjects[0].move(context, { x: offsetX - x, y: offsetY - y }, "move");
            } else {
                this.Board.ActiveObjects[0].update(
                    context,
                    {
                        w: offsetX - x,
                        h: offsetY - y,
                        points: [[offsetX, offsetY]]
                    },
                    "move"
                );
            }
        }
    }

    onTouchEnd(e: TouchEvent) {
        if (!this.Board.CanvasCopy) {
            return;
        }
        const context = this.Board.CanvasCopy.getContext("2d");
        if (!context) {
            return;
        }
        if (this.Board.ActiveObjects.length != 0) {
            const { clientX: offsetX, clientY: offsetY } = e.changedTouches[0];
            if (this.Board.ActiveObjects.length != 0 && this.Board.PointerOrigin) {
                const { x, y } = this.Board.PointerOrigin;
                if (this.Board.ElementType == ElementEnum.Move) {
                    this.Board.ActiveObjects[0].move(context, { x: offsetX - x, y: offsetY - y }, "up");
                } else {
                    this.Board.ActiveObjects[0].update(context, { w: offsetX - x, h: offsetY - y }, "up");
                }
            }
            context.closePath();
            this.Board.saveBoard();
        } else {
            this.Board.PointerOrigin = null;
            return;
        }
    }
}
