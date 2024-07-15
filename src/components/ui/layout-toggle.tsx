import { Layout, Navigation } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useLayout } from "@/hooks/layout-provider";

export function LayoutToggle() {
    const { setLayout, layout } = useLayout();

    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
                <Button variant="simple" size="icon">
                    {layout === "simple" ? (
                        <Navigation className="size-[1.2rem] rotate-0 scale-100 transition-all" />
                    ) : (
                        <Layout className="size-[1.2rem] rotate-0 scale-100 transition-all" />
                    )}
                    <span className="sr-only">Toggle layout</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLayout("simple")}>Simple</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLayout("secondary")}>Secondary</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
