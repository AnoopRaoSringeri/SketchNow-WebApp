import { observer } from "mobx-react";
import { useParams } from "react-router";

import { useCanvas } from "@/hooks/use-canvas";

import { TableRenderer } from "./table-renderer";

export const TablesRenderer = observer(function TablesRenderer() {
    const { id } = useParams<{ id: string }>();
    const { canvasBoard } = useCanvas(id ?? "new");

    return (
        <div className="absolute  flex size-full overflow-hidden bg-transparent">
            {canvasBoard.TableIds.map((id) => (
                <TableRenderer key={id} board={canvasBoard} id={id} transform={canvasBoard.Transform} />
            ))}
        </div>
    );
});
