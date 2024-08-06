import { TrashIcon } from "lucide-react";
import { observer } from "mobx-react";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useNavigate } from "react-router";

import { useStore } from "@/api-stores/store-provider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader } from "@/components/ui/loader";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SavedCanvas } from "@/types/canvas";

import { NoSketch } from "../no-sketch-page";

const SketchList = observer(function SketchList() {
    const { sketchStore } = useStore();
    const [sketches, setSketches] = useState<SavedCanvas[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const sketches = await sketchStore.GetAllSketches();
        setSketches(sketches);
        setLoading(false);
    };

    const deleteSketch = async (canvasId: string) => {
        setSketches(sketches.filter((s) => s._id != canvasId));
        await sketchStore.DeleteSketch(canvasId);
    };

    return (
        <div className="flex size-full items-center justify-center">
            <Loader loading={loading} />
            {sketches.length == 0 && !loading ? (
                <NoSketch />
            ) : (
                <ScrollArea className="size-full p-5" type="auto">
                    <div className="flex flex-1 flex-wrap gap-5 overflow-hidden">
                        {sketches.map((d) => (
                            <Sketch key={d._id} canvasId={d._id} name={d.name} onDelete={deleteSketch} />
                        ))}
                    </div>
                </ScrollArea>
            )}
        </div>
    );
});

export default SketchList;

const Sketch = function Sketch({
    canvasId,
    name,
    onDelete
}: {
    canvasId: string;
    name: string;
    onDelete: (id: string) => unknown;
}) {
    const { sketchStore } = useStore();
    const navigate = useNavigate();

    const { data, isLoading } = useQuery({
        queryFn: async () => {
            return await sketchStore.GetImageData(canvasId);
        },
        queryKey: ["SketchImageData", canvasId]
    });

    const onClick = () => {
        navigate(`/sketch/${canvasId}`);
    };

    return (
        <>
            <div className="group relative flex flex-col items-center gap-0 rounded-sm">
                {isLoading ? (
                    <div className=" box-content aspect-square h-[200px] w-[300px] cursor-pointer rounded-sm border-2 border-gray-500/30 object-cover">
                        <Loader loading={isLoading} />
                    </div>
                ) : (
                    <>
                        <div className="absolute right-0 top-0 ">
                            <Button
                                size="xs"
                                variant="destructive"
                                onClick={() => onDelete(canvasId)}
                                className="opacity-0  transition duration-300 group-hover:opacity-100"
                            >
                                <TrashIcon size={20} color="white" />
                            </Button>
                        </div>
                        <img
                            onClick={onClick}
                            className=" box-content aspect-square h-[200px] w-[300px] cursor-pointer rounded-sm border-2 border-gray-500/30 object-cover"
                            src={data ?? ""}
                        />
                    </>
                )}
                <Label className="p-1 text-lg">{name}</Label>
            </div>
        </>
    );
};
