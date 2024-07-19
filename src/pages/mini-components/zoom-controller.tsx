import { Minus, Plus, Scan, Search } from "lucide-react";
import { observer } from "mobx-react";
import { useParams } from "react-router";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useCanvas } from "@/hooks/use-canvas";

export const ZoomController = observer(function ZoomController() {
    const { id } = useParams<{ id: string }>();
    const { canvasBoard } = useCanvas(id ?? "new");

    function zoomIn() {
        canvasBoard.zoomIn();
    }

    function zoomOut() {
        canvasBoard.zoomOut();
    }

    function fitToView() {
        canvasBoard.fitToView();
    }
    return (
        <div className="absolute bottom-5 right-5 z-[100]  flex  flex-row items-center gap-1">
            <Search />
            <Label className="p-1 text-lg">{canvasBoard.Zoom.toFixed(2)}%</Label>
            <Button size="xs" variant="ghost" onClick={zoomIn}>
                <Plus size={20} />
            </Button>
            <Button size="xs" variant="simple" onClick={zoomOut}>
                <Minus size={20} />
            </Button>
            <Button size="xs" variant="simple" onClick={fitToView}>
                <Scan size={20} />
            </Button>
        </div>
    );
});
