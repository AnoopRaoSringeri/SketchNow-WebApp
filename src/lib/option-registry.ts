import { ElementEnum, IObjectStyle } from "@/types/custom-canvas";

import { DefaultFont, DefaultStyle } from "./canvas-helpers";

type T = keyof IObjectStyle;

export enum OptionTypeEnum {
    Range = "Range",
    Color = "Color",
    Number = "Number",
    Font = "Font"
}

export type RegistryOption = {
    optionKey: T;
    value: IObjectStyle[T];
    type: OptionTypeEnum;
    label: string;
};

export type OptionRegistryType = {
    [key in ElementEnum]: RegistryOption[];
};

const BaseOptions: RegistryOption[] = [
    { optionKey: "fillColor", value: DefaultStyle["fillColor"], type: OptionTypeEnum.Color, label: "Background" },
    {
        optionKey: "opacity",
        value: DefaultStyle["opacity"],
        type: OptionTypeEnum.Range,
        label: "Opacity"
    },
    { optionKey: "strokeStyle", value: DefaultStyle["strokeStyle"], type: OptionTypeEnum.Color, label: "Stroke" },
    { optionKey: "strokeWidth", value: DefaultStyle["strokeWidth"], type: OptionTypeEnum.Range, label: "Stroke width" }
];

export const OptionRegistry: OptionRegistryType = {
    [ElementEnum.Line]: [...BaseOptions],
    [ElementEnum.Square]: [...BaseOptions],
    [ElementEnum.Rectangle]: [...BaseOptions],
    [ElementEnum.Circle]: [...BaseOptions],
    [ElementEnum.Text]: [
        {
            optionKey: "opacity",
            value: DefaultStyle["opacity"],
            type: OptionTypeEnum.Range,
            label: "Opacity"
        },
        { optionKey: "strokeStyle", value: DefaultStyle["strokeStyle"], type: OptionTypeEnum.Color, label: "Stroke" },
        {
            optionKey: "strokeWidth",
            value: DefaultStyle["strokeWidth"],
            type: OptionTypeEnum.Range,
            label: "Stroke width"
        },
        { label: "Font", optionKey: "font", type: OptionTypeEnum.Font, value: DefaultFont }
    ],
    [ElementEnum.Pencil]: [...BaseOptions],
    [ElementEnum.Move]: [],
    [ElementEnum.Image]: []
};
