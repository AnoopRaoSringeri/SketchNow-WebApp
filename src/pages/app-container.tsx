import { Suspense } from "react";
import { Route, Routes } from "react-router";
import { HashRouter } from "react-router-dom";

import { Loader } from "@/components/ui/loader";
import { useLayout } from "@/hooks/layout-provider";
import { Auth } from "@/pages/auth/auth-page";
import { LogInPage } from "@/pages/auth/login-page";
import { RegisterPage } from "@/pages/auth/register-page";
import { CanvasBoard } from "@/pages/canvas/canvas-board";
import SketchList from "@/pages/canvas/sketches";

import { PlaygroundCanvas } from "./playground/playground-canvas";

function AppContainer() {
    const { element } = useLayout();
    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<Auth />}>
                    <Route
                        path=""
                        element={
                            <Suspense fallback={<Loader />}>
                                <LogInPage />
                            </Suspense>
                        }
                    />
                    <Route
                        path="register"
                        element={
                            <Suspense fallback={<Loader />}>
                                <RegisterPage />
                            </Suspense>
                        }
                    />
                </Route>
                <Route
                    path="/:id"
                    element={
                        <Suspense fallback={<Loader />}>
                            <PlaygroundCanvas />
                        </Suspense>
                    }
                />
                <Route path="sketch" element={element}>
                    <Route
                        path=""
                        element={
                            <Suspense fallback={<Loader />}>
                                <SketchList />
                            </Suspense>
                        }
                    />
                    <Route
                        path="/sketch/:id"
                        element={
                            <Suspense fallback={<Loader />}>
                                <CanvasBoard />
                            </Suspense>
                        }
                    />
                </Route>
                {/* <Route
                    path="/sketch/:id"
                    element={
                        <Suspense fallback={<Loader />}>
                            <CanvasBoard />
                        </Suspense>
                    }
                /> */}
            </Routes>
        </HashRouter>
    );
}

export default AppContainer;
