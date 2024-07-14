import { observer } from "mobx-react";
import { useParams } from "react-router";

import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { useCanvas } from "@/hooks/use-canvas";
import { ElementEnum } from "@/types/custom-canvas";
import { Option } from "@/types/layout";

const ElementSelector = observer(function ElementSelector({
    options,
    onChange
}: {
    options: Option[];
    onChange: (value: ElementEnum) => unknown;
}) {
    const { id } = useParams<{ id: string }>();
    const { canvasBoard } = useCanvas(id ?? "new");

    return (
        <div className="absolute top-5 z-[100] flex flex-row items-center gap-1">
            {/* <div className="absolute left-5 z-[100]  flex flex-col items-center gap-1"> */}
            {options.map((o) => (
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
    );
});

export default ElementSelector;
