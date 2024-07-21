import { observer } from "mobx-react";
import { TwitterPicker } from "react-color";
import { TwitterPickerStylesProps } from "react-color/lib/components/twitter/Twitter";
import { useParams } from "react-router";

import Icon from "@/components/ui/icon";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { useCanvas } from "@/hooks/use-canvas";

// import { ElementOptions } from "./element-options";
import { OptionsWrapper } from "./options-wrapper";

const SWATCHES = [
    "#FF6900",
    "#FCB900",
    "#7BDCB5",
    "#00D084",
    "#8ED1FC",
    "#0693E3",
    "#ABB8C3",
    "#EB144C",
    "#9900EF",
    "transparent"
];

const twitterStyle: { default: Partial<TwitterPickerStylesProps> } = {
    default: {
        input: {
            display: "none"
        },
        hash: {
            display: "none"
        },
        card: {
            background: "transparent"
        },
        swatch: {
            padding: 0,
            margin: 0
        },
        body: {
            padding: 0,
            margin: 0,
            background: "transparent",
            boxShadow: "none",
            display: "flex",
            gap: 4,
            flexWrap: "wrap",
            border: "none"
        }
    }
};

const twitterStyleSingle: { default: Partial<TwitterPickerStylesProps> } = { default: { ...twitterStyle.default } };

export const ElementStyleEditor = observer(function ElemntStyleEditor() {
    const { id } = useParams<{ id: string }>();
    const { canvasBoard } = useCanvas(id ?? "new");
    const selectedElements = canvasBoard.SelectedElements;
    const element = selectedElements[0];
    const elementStyle = element?.style;

    if (!elementStyle) {
        return <></>;
    }

    return (
        <div className="absolute left-5 top-20 z-[100]  flex  flex-row items-center gap-1">
            <ScrollArea>
                <div className="flex h-full w-[260px] flex-col gap-4 rounded-sm bg-slate-500 p-5">
                    <Label className="text-sm">Storke width</Label>
                    <Slider
                        value={[elementStyle.strokeWidth ?? 0]}
                        onValueChange={(values) => {
                            canvasBoard.updateStyle("strokeWidth", values[0]);
                        }}
                    />
                    <div>
                        <Label className="text-sm">Stroke</Label>
                        <div className="flex gap-[5]">
                            <TwitterPicker
                                colors={SWATCHES}
                                styles={twitterStyle}
                                className="!w-full !border-none !shadow-none"
                                triangle="hide"
                                color={elementStyle.strokeStyle}
                                onChange={(col) => {
                                    canvasBoard.updateStyle("strokeStyle", col.hex);
                                }}
                            />
                            <Icon name="Minus" className="rotate-90" size="30px" />
                            <TwitterPicker
                                width="40px"
                                className="!border-none !shadow-none"
                                styles={twitterStyleSingle}
                                triangle="hide"
                                colors={[elementStyle.strokeStyle]}
                            />
                        </div>
                    </div>
                    <div>
                        <Label className="text-sm">Background</Label>
                        <div className="flex gap-[5]">
                            <TwitterPicker
                                colors={SWATCHES}
                                styles={twitterStyle}
                                className="!w-full !border-none !shadow-none"
                                triangle="hide"
                                color={elementStyle.fillColor}
                                onChange={(col) => {
                                    canvasBoard.updateStyle("fillColor", col.hex);
                                }}
                            />
                            <Icon name="Minus" className="rotate-90" size="30px" />
                            <TwitterPicker
                                width="40px"
                                className="!border-none !shadow-none"
                                styles={twitterStyleSingle}
                                triangle="hide"
                                colors={[elementStyle.fillColor]}
                            />
                        </div>
                    </div>
                    <Label className="text-sm">Opacity</Label>
                    <Slider
                        value={[elementStyle.opacity ?? 0]}
                        max={100}
                        step={1}
                        onValueChange={(values) => {
                            canvasBoard.updateStyle("opacity", values[0]);
                        }}
                    />
                    <OptionsWrapper />
                </div>
            </ScrollArea>
        </div>
    );
});
