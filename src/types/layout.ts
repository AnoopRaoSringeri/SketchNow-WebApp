import { LucideIcons } from "@/components/ui/icon";

import { ElementEnum } from "./custom-canvas";

export interface Option {
    icon: LucideIcons;
    value: ElementEnum;
    description: string;
}
