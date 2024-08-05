import { icons, LucideProps } from "lucide-react";
import { Suspense } from "react";

import { cn } from "@/lib/utils";

const fallback = <div style={{ background: "#ddd", width: 24, height: 24 }} />;

export type LucideIcons = keyof typeof icons;

interface IconProps extends Omit<LucideProps, "ref"> {
    name: LucideIcons;
    spin?: boolean;
}

const Icon = ({ name, className, spin, ...props }: IconProps) => {
    const LucideIcon = icons[name];

    return (
        <Suspense fallback={fallback}>
            <LucideIcon className={cn(spin ? "animate-spin" : "", className)} {...props} />
        </Suspense>
    );
};

export default Icon;
