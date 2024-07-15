import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { useStore } from "@/api-stores/store-provider";
import { LogInRequet } from "@/types/auth";

export function useAuth() {
    const [loading, setLoading] = useState(false);
    const { authStore } = useStore();
    const navigate = useNavigate();
    const isAuthenticated = localStorage.getItem("IsAuthenticated");

    const refreshToken = async () => {
        if (isAuthenticated == "true") {
            const res = await authStore.IsValidSession();
            if (!res) {
                endSession();
            } else {
                authStore.IsSessionValid = true;
            }
        } else {
            endSession();
        }
    };

    const endSession = () => {
        navigate("/");
        localStorage.removeItem("IsAuthenticated");
        toast.error("Session expired login again");
        authStore.IsSessionValid = false;
    };

    const logOut = async () => {
        await authStore.Logout();
        localStorage.removeItem("IsAuthenticated");
        authStore.IsSessionValid = false;
        navigate("/");
        toast.error("User logged out successfully");
    };

    const logIn = async (values: LogInRequet) => {
        setLoading(true);
        const response = await authStore.Login(values);
        if (response) {
            toast.success("Logged in successfully");
            localStorage.setItem("IsAuthenticated", "true");
            authStore.IsSessionValid = true;
            navigate("/sketches");
        } else {
            toast.error("User login failed");
        }
        setLoading(false);
    };

    const register = async (values: LogInRequet) => {
        setLoading(true);
        const res = await authStore.Register(values);
        if (res) {
            toast.success("User registered successfully");
            navigate("/login");
        } else {
            toast.error("User registration failed");
        }
        setLoading(false);
    };

    return { register, logOut, logIn, loading, refreshToken };
}
