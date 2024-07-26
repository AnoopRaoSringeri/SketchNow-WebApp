import { observer } from "mobx-react";
import { useParams } from "react-router";

import { ScrollArea } from "@/components/ui/scroll-area";
import { useCanvas } from "@/hooks/use-canvas";
import { OptionRegistry } from "@/lib/option-registry";

import { Renderer } from "./editor-renderer";
import { OptionsWrapper } from "./options-wrapper";

export const CanvasStyleEditor = observer(function CanvasStyleEditor() {
    const { id } = useParams<{ id: string }>();
    const { canvasBoard } = useCanvas(id ?? "new");
    const canvasStyle = canvasBoard.Style;

    return (
        <div className="absolute left-5 top-20 z-[100]  flex  flex-row items-center gap-1">
            <ScrollArea>
                <div className="flex h-full w-[260px] flex-col gap-4 rounded-sm bg-slate-500 p-5">
                    {OptionRegistry[canvasBoard.ElementType].map((o, i) => (
                        <Renderer
                            key={i}
                            {...o}
                            value={canvasStyle[o.optionKey]}
                            onChange={(key, value) => canvasBoard.setStyle(key, value)}
                        />
                    ))}
                    <OptionsWrapper />
                </div>
            </ScrollArea>
        </div>
    );
});
