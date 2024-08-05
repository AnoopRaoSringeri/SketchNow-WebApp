import { observer } from "mobx-react";
import { useParams } from "react-router";

import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { Label } from "@/components/ui/label";
import { useCanvas } from "@/hooks/use-canvas";
import { ElementEnum } from "@/types/custom-canvas";
import { Option } from "@/types/layout";

const LeftOptionLists: Option[] = [
    {
        icon: "Move",
        value: ElementEnum.Move,
        description: "Select and drag elements to move or click and drag to select multiple elements"
    },
    {
        icon: "Hand",
        value: ElementEnum.Pan,
        description: "Click and drag to move canvas, scroll to zoom-in or zoom-out"
    },
    {
        icon: "Pencil",
        value: ElementEnum.Pencil,
        description: ""
    },
    {
        icon: "RectangleHorizontal",
        value: ElementEnum.Rectangle,
        description: ""
    },
    {
        icon: "Circle",
        value: ElementEnum.Circle,
        description: ""
    },
    {
        icon: "Square",
        value: ElementEnum.Square,
        description: ""
    },
    {
        icon: "Minus",
        value: ElementEnum.Line,
        description: ""
    },
    {
        icon: "Type",
        value: ElementEnum.Text,
        description: ""
    },
    {
        icon: "ImagePlus",
        value: ElementEnum.Image,
        description: "Click anywhere on the screen to insert image"
    },
    {
        icon: "Table",
        value: ElementEnum.Table,
        description: "Click and drag to draw a file inpup, upload file to add a table"
    }
];

const ElementSelector = observer(function ElementSelector({ onChange }: { onChange: (value: ElementEnum) => unknown }) {
    const { id } = useParams<{ id: string }>();
    const { canvasBoard } = useCanvas(id ?? "new");

    const selectedOption = LeftOptionLists.find((o) => o.value == canvasBoard.ElementType);

    return (
        <div className="absolute top-5 z-[100] flex flex-col items-center gap-1">
            <div className=" flex flex-row items-center gap-1">
                <Button
                    size="sm"
                    variant={canvasBoard.IsElementSelectorLocked ? "default" : "secondary"}
                    onClick={() => {
                        canvasBoard.IsElementSelectorLocked = !canvasBoard.IsElementSelectorLocked;
                    }}
                >
                    {canvasBoard.IsElementSelectorLocked ? (
                        <Icon name="Lock" size="20px" />
                    ) : (
                        <Icon name="LockOpen" size="20px" />
                    )}
                </Button>
                <Icon name="Minus" className="rotate-90" size="30px" />
                {LeftOptionLists.map((o) => (
                    <Button
                        size="sm"
                        variant={canvasBoard.ElementType == o.value ? "default" : "secondary"}
                        key={o.value}
                        onClick={() => {
                            onChange(o.value);
                        }}
                    >
                        <Icon name={o.icon} size="20px" />
                    </Button>
                ))}
            </div>
            {selectedOption ? <Label className="text-xs ">{selectedOption.description}</Label> : null}
        </div>
    );
});

export default ElementSelector;
