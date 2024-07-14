import { createContext, useContext, useMemo, useState } from "react";

import { AppShellPrimary } from "@/components/custom-ui/app-shell-primary";
import { AppShell } from "@/components/custom-ui/app-shell-secondary";

type Layout = "simple" | "secondary";

type LayoutProviderProps = {
    children: React.ReactNode;
    defaultLayout?: Layout;
    storageKey?: string;
};

type LayoutProviderState = {
    layout: Layout;
    setLayout: (layout: Layout) => void;
    element: JSX.Element;
    setInitiallyVisible: (visible: boolean) => void;
};

const initialState: LayoutProviderState = {
    layout: "simple",
    setLayout: () => null,
    element: <AppShellPrimary />,
    setInitiallyVisible: () => null
};

const LayoutProviderContext = createContext<LayoutProviderState>(initialState);

export function LayoutProvider({
    children,
    defaultLayout = "simple",
    storageKey = "layout",
    ...props
}: LayoutProviderProps) {
    const [layout, setLayout] = useState<Layout>(() => (localStorage.getItem(storageKey) as Layout) || defaultLayout);
    const [initiallyVisible, setInitiallyVisible] = useState(true);

    const AppLayout = useMemo(() => {
        return layout === "simple" ? (
            <AppShellPrimary initiallyVisible={initiallyVisible} />
        ) : (
            <AppShell navbarActions={[]} navbarVisble={true} />
        );
    }, [layout, initiallyVisible]);

    const value = {
        element: AppLayout,
        layout: layout,
        setLayout: (layout: Layout) => {
            localStorage.setItem(storageKey, layout);
            setLayout(layout);
        },
        setInitiallyVisible
    };

    return (
        <LayoutProviderContext.Provider {...props} value={value}>
            {children}
        </LayoutProviderContext.Provider>
    );
}

export const useLayout = () => {
    const context = useContext(LayoutProviderContext);

    if (context === undefined) {
        throw new Error("useLayout must be used within a LayoutProvider");
    }

    return context;
};
