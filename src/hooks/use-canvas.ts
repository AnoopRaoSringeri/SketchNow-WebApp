import { useEffect } from "react";

import { CanvasBoard } from "@/lib/canvas/canvas-board";

const CanvasMap: Map<string, CanvasBoard> = new Map();
let canvasBoard: CanvasBoard | null = null;

export function useCanvas(canvasId: string) {
    const savedCanvas = CanvasMap.get(canvasId);
    if (!savedCanvas) {
        canvasBoard = new CanvasBoard();
        CanvasMap.set(canvasId, canvasBoard);
    } else {
        canvasBoard = savedCanvas;
    }
    // const copy = window;
    const copy = canvasBoard.CanvasCopy;

    useEffect(() => {
        copy?.addEventListener("resize", onResize);
        return () => {
            copy?.removeEventListener("resize", onResize);
        };
    }, [onResize]);

    useEffect(() => {
        copy?.addEventListener("mousedown", onMouseDown);
        return () => {
            copy?.removeEventListener("mousedown", onMouseDown);
        };
    }, [onMouseDown]);

    useEffect(() => {
        copy?.addEventListener("touchstart", onTouchStart, { passive: false });
        return () => {
            copy?.removeEventListener("touchstart", onTouchStart);
        };
    }, [onTouchStart]);

    useEffect(() => {
        copy?.addEventListener("mousemove", onMouseMove);
        return () => {
            copy?.removeEventListener("mousemove", onMouseMove);
        };
    }, [onMouseMove]);

    useEffect(() => {
        copy?.addEventListener("touchmove", onTouchMove, { passive: false });
        return () => {
            copy?.removeEventListener("touchmove", onTouchMove);
        };
    }, [onTouchMove]);

    useEffect(() => {
        copy?.addEventListener("mouseup", onMouseUp);
        return () => {
            copy?.removeEventListener("mouseup", onMouseUp);
        };
    }, [onMouseUp]);

    useEffect(() => {
        copy?.addEventListener("mouseleave", onMouseUp);
        return () => {
            copy?.removeEventListener("mouseleave", onMouseUp);
        };
    }, [onMouseUp]);

    useEffect(() => {
        copy?.addEventListener("touchend", onTouchEnd);
        return () => {
            copy?.removeEventListener("touchend", onTouchEnd);
        };
    }, [onTouchEnd]);

    useEffect(() => {
        copy?.addEventListener("touchcancel", onTouchEnd);
        return () => {
            copy?.removeEventListener("touchcancel", onTouchEnd);
        };
    }, [onTouchEnd]);

    useEffect(() => {
        copy?.addEventListener("wheel", onWheelAction, { passive: false });
        return () => {
            copy?.removeEventListener("wheel", onWheelAction);
        };
    }, [onWheelAction]);

    function onResize() {
        canvasBoard?.resizeBoard();
    }

    function onMouseDown(e: MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        canvasBoard?.onMouseDown(e);
    }

    function onTouchStart(e: globalThis.TouchEvent) {
        e.preventDefault();
        e.stopPropagation();
        canvasBoard?.onTouchStart(e);
    }

    function onMouseMove(e: MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        canvasBoard?.onMouseMove(e);
    }

    function onTouchMove(e: globalThis.TouchEvent) {
        canvasBoard?.onTouchMove(e);
    }

    function onMouseUp(e: MouseEvent) {
        canvasBoard?.onMouseUp(e);
    }

    function onTouchEnd(e: globalThis.TouchEvent) {
        canvasBoard?.onTouchEnd(e);
    }

    function removeCanvasCache(id: string) {
        CanvasMap.delete(id);
    }

    function onWheelAction(e: WheelEvent) {
        canvasBoard?.onWheelAction(e);
    }
    return { canvasBoard, removeCanvasCache };
}
