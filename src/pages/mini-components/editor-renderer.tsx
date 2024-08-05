import { observer } from "mobx-react";
import { TwitterPicker } from "react-color";
import { TwitterPickerStylesProps } from "react-color/lib/components/twitter/Twitter";

import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { DefaultFont } from "@/lib/canvas-helpers";
import { OptionTypeEnum, RegistryOption } from "@/lib/option-registry";
import { Font, IObjectStyle } from "@/types/custom-canvas";

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
export const Renderer = observer(function Renderer({
    optionKey: key,
    label,
    type,
    value,
    onChange
}: RegistryOption & { onChange: (key: keyof IObjectStyle, value: IObjectStyle[keyof IObjectStyle]) => unknown }) {
    switch (type) {
        case OptionTypeEnum.Color:
            return (
                <div>
                    <Label className="text-sm">{label}</Label>
                    <div className="flex gap-[5]">
                        <TwitterPicker
                            colors={SWATCHES}
                            styles={twitterStyle}
                            className="!w-full !border-none !shadow-none"
                            triangle="hide"
                            color={value as string}
                            onChange={(col) => {
                                onChange(key, col.hex);
                            }}
                        />
                        <Icon name="Minus" className="rotate-90" size="30px" />
                        <TwitterPicker
                            width="40px"
                            className="!border-none !shadow-none"
                            styles={twitterStyleSingle}
                            triangle="hide"
                            colors={[value as string]}
                        />
                    </div>
                </div>
            );
        case OptionTypeEnum.Range:
            return (
                <>
                    <Label className="text-sm">{label}</Label>
                    <Slider
                        value={[value as number]}
                        max={1000}
                        step={1}
                        onValueChange={(values) => {
                            onChange(key, values[0]);
                        }}
                    />
                </>
            );
        case OptionTypeEnum.Font:
            return (
                <div>
                    <Label className="text-sm">{label}</Label>
                    <Separator className="bg-white" />
                    <FontEditor font={(value ?? DefaultFont) as Font} onChange={(f) => onChange("font", f)} />
                </div>
            );
    }
});

const FontEditor = function FontEditor({ font, onChange }: { font: Font | null; onChange: (font: Font) => unknown }) {
    if (!font) {
        return null;
    }
    const { size, weight, color, style } = font;
    return (
        <div className="flex flex-col gap-2 pl-2 pt-2">
            <Label className="text-sm">Size</Label>
            <Slider
                value={[size as number]}
                max={1000}
                step={1}
                onValueChange={(values) => {
                    onChange({ ...font, size: values[0] });
                }}
            />
            <Label className="text-sm">Weight</Label>
            <Slider
                value={[weight as number]}
                max={1000}
                step={10}
                onValueChange={(values) => {
                    onChange({ ...font, weight: values[0] });
                }}
            />
            <div>
                <Label className="text-sm">Color</Label>
                <div className="flex gap-[5]">
                    <TwitterPicker
                        colors={SWATCHES}
                        styles={twitterStyle}
                        className="!w-full !border-none !shadow-none"
                        triangle="hide"
                        color={color}
                        onChange={(col) => {
                            onChange({ ...font, color: col.hex });
                        }}
                    />
                    <Icon name="Minus" className="rotate-90" size="30px" />
                    <TwitterPicker
                        width="40px"
                        className="!border-none !shadow-none"
                        styles={twitterStyleSingle}
                        triangle="hide"
                        colors={[color]}
                    />
                </div>
            </div>
            <div className="flex gap-4">
                <Button
                    size="sm"
                    variant={style === "normal" ? "outline" : "ghost"}
                    onClick={() => {
                        onChange({ ...font, style: "normal" });
                    }}
                >
                    <Icon name="Text" />
                </Button>
                <Button
                    size="sm"
                    variant={style === "italic" ? "outline" : "ghost"}
                    onClick={() => {
                        onChange({ ...font, style: "italic" });
                    }}
                >
                    <Icon name="Italic" />
                </Button>
            </div>
        </div>
    );
};
