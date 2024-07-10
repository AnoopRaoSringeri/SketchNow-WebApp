import { observer } from "mobx-react";
import { useEffect } from "react";
import { useParams } from "react-router";

import { OptionsWrapper } from "@/components/mini-components/options-wrapper";
import { useCanvas } from "@/hooks/use-canvas";

import CanvasOptions from "../canvas/canvas-options";

export const PlaygroundCanvas = observer(function PlaygroundCanvas() {
    const { id } = useParams<{ id: string }>();
    const { canvasBoard } = useCanvas(id ?? "playground");
    const canvas = canvasBoard.CanvasRef;

    useEffect(() => {
        canvasBoard.createBoard({});
    }, [canvas]);

    return (
        <>
            <CanvasOptions name={""} />
            <OptionsWrapper />
            <canvas
                id="playground-canvas-board"
                className="absolute z-10 overscroll-none"
                ref={canvasBoard.CanvasRef}
            ></canvas>
            <canvas
                id="playground-canvas-board-copy"
                className="absolute z-20 overscroll-none"
                ref={canvasBoard.CanvasCopyRef}
            ></canvas>
        </>
    );
});
