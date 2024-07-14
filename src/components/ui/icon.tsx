import { icons, LucideProps } from "lucide-react";
import { Suspense } from "react";

const fallback = <div style={{ background: "#ddd", width: 24, height: 24 }} />;

export type LucideIcons = keyof typeof icons;

interface IconProps extends Omit<LucideProps, "ref"> {
    name: LucideIcons;
}

const Icon = ({ name, ...props }: IconProps) => {
    const LucideIcon = icons[name];

    return (
        <Suspense fallback={fallback}>
            <LucideIcon {...props} />
        </Suspense>
    );
};

export default Icon;
