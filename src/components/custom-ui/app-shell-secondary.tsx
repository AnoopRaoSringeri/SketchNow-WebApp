import { observer } from "mobx-react";
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { useStore } from "@/api-stores/store-provider";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import Icon, { LucideIcons } from "@/components/ui/icon";
import { Image } from "@/components/ui/image";
import { Input } from "@/components/ui/input";
import { LayoutToggle } from "@/components/ui/layout-toggle";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SketchNow } from "@/images";
import { cn } from "@/lib/utils";

type NavbarActionType = {
    icon: LucideIcons;
    onClick?: () => unknown;
    link: string;
    label: string;
    value: string;
};

type AppShellProps = {
    navbarActions: NavbarActionType[];
    navbarVisble?: boolean;
};

export const AppShell = observer(function AppShell({ navbarActions, navbarVisble }: AppShellProps) {
    const [nav, setNav] = useState<string>("home");
    const { authStore } = useStore();
    const navigate = useNavigate();
    const logout = async () => {
        await authStore.Logout();
        localStorage.removeItem("IsAuthenticated");
        authStore.IsSessionValid = false;
        navigate("/");
    };
    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/80">
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background",
                    navbarVisble ? "sm:flex" : "hidden"
                )}
            >
                <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
                    <Image
                        src={SketchNow}
                        width={30}
                        height={30}
                        alt="Avatar"
                        className="overflow-hidden rounded-full"
                    />
                    {navbarActions.map((a) => (
                        <TooltipProvider key={a.label} delayDuration={0}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <NavLink
                                        to={a.link}
                                        className={cn(
                                            "flex size-9 items-center justify-center transition-colors md:size-8",
                                            a.value === nav
                                                ? "rounded-xl bg-primary text-lg font-semibold text-primary-foreground"
                                                : "rounded-lg text-muted-foreground"
                                        )}
                                        onClick={() => {
                                            setNav(a.value);
                                        }}
                                    >
                                        <Icon name={a.icon} className="size-5 transition-all hover:scale-105" />
                                        <span className="sr-only">{a.label}</span>
                                    </NavLink>
                                </TooltipTrigger>
                                <TooltipContent side="right">{a.label}</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    ))}
                </nav>
                <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <NavLink
                                    to="#"
                                    className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:size-8"
                                >
                                    <Icon name="Settings" className="size-5" />
                                    <span className="sr-only">Settings</span>
                                </NavLink>
                            </TooltipTrigger>
                            <TooltipContent side="right">Settings</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <NavLink
                                    to="/"
                                    className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:size-8"
                                    onClick={logout}
                                >
                                    <Icon name="LogOut" className="size-5" />
                                    <span className="sr-only">Logout</span>
                                </NavLink>
                            </TooltipTrigger>
                            <TooltipContent side="right">Logout</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </nav>
            </aside>
            <div
                className={cn(
                    "flex h-full flex-col overflow-hidden sm:gap-4 sm:py-4",
                    navbarVisble ? "sm:pl-14" : "sm:pl-0"
                )}
            >
                <header className="sticky top-0 z-30 flex h-14 items-center gap-4 overflow-hidden border-b bg-background px-4 py-1 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button size="icon" variant="outline" className="sm:hidden">
                                <Icon name="PanelLeft" className="size-5" />
                                <span className="sr-only">Toggle Menu</span>
                            </Button>
                        </SheetTrigger>

                        <SheetContent side="left" className="sm:max-w-xs">
                            <nav className="grid gap-6 text-lg font-medium">
                                <NavLink
                                    to="#"
                                    className="group flex size-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                                >
                                    <Icon name="Package2" className="size-5 transition-all group-hover:scale-110" />
                                    <span className="sr-only">Acme Inc</span>
                                </NavLink>
                                {navbarActions.map((a) => (
                                    <NavLink
                                        key={a.label}
                                        to={a.link}
                                        className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                                    >
                                        <Icon name={a.icon} className="size-5" />
                                        {a.label}
                                    </NavLink>
                                ))}
                            </nav>
                        </SheetContent>
                    </Sheet>
                    {/* <Breadcrumb className="hidden md:flex">
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild>
                                    <NavLink to="#">Dashboard</NavLink>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild>
                                    <NavLink to="#">Products</NavLink>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>All Products</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb> */}
                    <div style={{ flex: 1 }} />
                    {nav === "home" ? (
                        <div className="relative ml-auto flex-1 md:grow-0">
                            <Icon name="Search" className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search..."
                                className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
                            />
                        </div>
                    ) : null}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" className="overflow-hidden rounded-full">
                                {/* <Image
                                    src="/placeholder-user.jpg"
                                    width={36}
                                    height={36}
                                    alt="Avatar"
                                    className="overflow-hidden rounded-full"
                                /> */}
                                <Icon name="User" className="overflow-hidden rounded-full" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Settings</DropdownMenuItem>
                            <DropdownMenuItem>Support</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <ModeToggle />
                    <LayoutToggle />
                </header>
                <main className="flex flex-1 overflow-hidden p-4 sm:px-6 sm:py-0">
                    <Outlet />
                </main>
            </div>
        </div>
    );
});
