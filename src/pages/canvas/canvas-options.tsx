import { Save } from "lucide-react";
import { observer } from "mobx-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";

import { useStore } from "@/api-stores/store-provider";
import { CanvasStyleEditor } from "@/pages/mini-components/canvas-style-editor";
import { ElementStyleEditor } from "@/pages/mini-components/element-style-editor";
import { ZoomController } from "@/pages/mini-components/zoom-controller";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { useCanvas } from "@/hooks/use-canvas";
import { ElementEnum } from "@/types/custom-canvas";
import { Option } from "@/types/layout";

import ElementSelector from "./element-selector";

const LeftOptionLists: Option[] = [
    { icon: "Move", value: ElementEnum.Move },
    { icon: "Pencil", value: ElementEnum.Pencil },
    { icon: "RectangleHorizontal", value: ElementEnum.Rectangle },
    { icon: "Circle", value: ElementEnum.Circle },
    { icon: "Square", value: ElementEnum.Square },
    { icon: "Minus", value: ElementEnum.Line }
];

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
        if (id && id != "new") {
            await sketchStore.UpdateSketch(id, canvasBoard.toJSON(), sketchName);
            toast.success("Sketch saved successfully");
        } else {
            const response = await sketchStore.SaveSketch(canvasBoard.toJSON(), sketchName);
            if (response) {
                toast.success("Sketch updated successfully");
                navigate(`/sketch/${response._id}`);
            }
        }
    };

    const goToHome = () => {
        navigate("/sketches");
    };

    return (
        <div className="absolute flex size-full overflow-hidden bg-transparent">
            <div className=" flex size-full items-center justify-center bg-transparent">
                <ElementSelector
                    options={LeftOptionLists}
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
                        <Button size="sm" onClick={saveBoard}>
                            <Save />
                        </Button>
                    </div>
                </div>
                <div className="absolute left-5 top-5 z-[100]">
                    <Button size="sm" onClick={goToHome}>
                        <Icon size="20px" name="House" />
                    </Button>
                </div>
                {canvasBoard.ElementType == ElementEnum.Move ? null : <CanvasStyleEditor />}
                <ElementStyleEditor />
                <ZoomController />
            </div>
        </div>
    );
});

export default CanvasOptions;
