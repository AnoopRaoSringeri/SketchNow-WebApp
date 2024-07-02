import { useElementSize } from "@mantine/hooks";
import { observer } from "mobx-react";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import { toast } from "sonner";

import { useStore } from "@/api-stores/store-provider";

export const Auth = observer(function Auth() {
    const { authStore } = useStore();
    const navigate = useNavigate();
    const isAuthenticated = localStorage.getItem("IsAuthenticated");

    useEffect(() => {
        if (isAuthenticated == "true") {
            refreshToken();
        }
    }, []);

    const refreshToken = async () => {
        const res = await authStore.IsValidSession();
        if (!res) {
            navigate("/");
            localStorage.removeItem("IsAuthenticated");
            toast.error("Session expired login again");
            authStore.IsSessionValid = false;
        } else {
            authStore.IsSessionValid = true;
        }
    };

    return (
        <div className="size-full lg:grid  lg:grid-cols-2">
            <div className="hidden bg-muted lg:block">
                <Animation />
            </div>
            <div className="flex items-center justify-center py-12">
                <Outlet />
            </div>
        </div>
    );
});

const Animation = function Animation() {
    const { ref, width, height } = useElementSize();
    useEffect(() => {
        loadScript();
    }, []);
    const loadScript = () => {
        const body = document.body;
        const script = document.createElement("script");
        script.innerHTML = "";
        script.src = "/src/pages/animation/script.js";
        script.type = "module";
        script.async = true;
        script.defer = true;
        body.appendChild(script);
    };
    return (
        <>
            <canvas ref={ref} id="animation-canvas" className="size-full" width={width} height={height}></canvas>
        </>
    );
};
