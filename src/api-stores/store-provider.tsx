import { createContext, ReactNode, useContext } from "react";

import AuthStore from "@/api-stores/auth-store";
import SketchStore from "@/api-stores/sketch-store";
import UploadStore from "@/api-stores/upload-store";

const store = {
    authStore: new AuthStore(),
    sketchStore: new SketchStore(),
    uploadStore: new UploadStore()
};

const StoreContex = createContext(store);

const useStore = () => {
    return useContext(StoreContex);
};

const StoreProvider = ({ children }: { children: ReactNode }) => {
    const storeValue = useContext(StoreContex);
    return <StoreContex.Provider value={storeValue}>{children}</StoreContex.Provider>;
};
export { StoreProvider, useStore };
