import { observer } from "mobx-react";
import { useEffect, useState } from "react";
import { useMutation } from "react-query";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";

import { useStore } from "@/api-stores/store-provider";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { useCanvas } from "@/hooks/use-canvas";
import { StyleEditorWrapper } from "@/pages/mini-components/canvas-style-editor";
import { ZoomController } from "@/pages/mini-components/zoom-controller";

import ElementSelector from "./element-selector";

const CanvasOptions = observer(function CanvasOptions({ name }: { name: string }) {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [sketchName, setSketchName] = useState(name);
    const { sketchStore } = useStore();
    const { canvasBoard } = useCanvas(id ?? "new");

    useEffect(() => {
        setSketchName(name);
    }, [name]);

    const saveBoard = async () => {
        console.log(canvasBoard.Canvas.toDataURL());
        if (id && id != "new") {
            await sketchStore.UpdateSketch(id, canvasBoard.toJSON(), sketchName, canvasBoard.Canvas.toDataURL());
            toast.success("Sketch saved successfully");
        } else {
            const response = await sketchStore.SaveSketch(
                canvasBoard.toJSON(),
                sketchName,
                canvasBoard.Canvas.toDataURL()
            );
            if (response) {
                toast.success("Sketch updated successfully");
                navigate(`/sketch/${response._id}`);
            }
        }
    };

    const { mutate, isLoading } = useMutation({
        mutationFn: () => saveBoard()
    });

    const goToHome = () => {
        navigate("/sketches");
    };

    return (
        <div className="absolute flex size-full overflow-hidden bg-transparent">
            <div className=" flex size-full items-center justify-center bg-transparent">
                <ElementSelector
                    onChange={(eleType) => {
                        canvasBoard.ElementType = eleType;
                    }}
                />
                <div className="absolute right-5 top-5 z-[100]">
                    <div className="flex w-full max-w-sm items-center space-x-2">
                        <Input
                            type="text"
                            placeholder="Name"
                            value={sketchName}
                            onChange={(e) => {
                                setSketchName(e.target.value);
                            }}
                        />
                        <Button size="sm" onClick={() => mutate()}>
                            {isLoading ? <Icon name="LoaderCircle" spin /> : <Icon name="Save" />}
                        </Button>
                    </div>
                </div>
                <div className="absolute left-5 top-5 z-[100]">
                    <Button size="sm" onClick={goToHome}>
                        <Icon size="20px" name="House" />
                    </Button>
                </div>
                <StyleEditorWrapper />
                <ZoomController />
            </div>
        </div>
    );
});

export default CanvasOptions;
