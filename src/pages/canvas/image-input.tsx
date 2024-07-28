import { observer } from "mobx-react";
import { useEffect, useRef } from "react";
import { useParams } from "react-router";

import { useCanvas } from "@/hooks/use-canvas";
import { ElementEnum } from "@/types/custom-canvas";

export const ImageInput = observer(function ImageInput() {
    const { id } = useParams<{ id: string }>();
    const { canvasBoard } = useCanvas(id ?? "new");
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (canvasBoard.Image) {
            inputRef.current?.click();
        }
    }, [canvasBoard.Image]);

    useEffect(() => {
        inputRef.current?.addEventListener("cancel", onCancel);
        return () => {
            inputRef.current?.removeEventListener("cancel", onCancel);
        };
    }, [canvasBoard.Image]);

    function onCancel() {
        canvasBoard.Image = null;
    }

    if (canvasBoard.ElementType != ElementEnum.Image || !canvasBoard.Image) {
        return null;
    }
    return (
        <div className="absolute z-50 flex size-full overflow-hidden bg-transparent">
            <input
                id="canvas-image"
                ref={inputRef}
                className="absolute size-full text-transparent file:hidden"
                type="file"
                title=" "
                value={""}
                onChange={(e) => canvasBoard.uploadImage(e)}
            />
        </div>
    );
});
