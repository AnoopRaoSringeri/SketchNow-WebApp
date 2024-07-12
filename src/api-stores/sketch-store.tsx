import axios, { AxiosResponse } from "axios";
import { makeAutoObservable } from "mobx";

import { BaseUrl, getRequestConfig } from "@/api-stores/auth-store";
import { CanvasMetadata, SavedCanvas } from "@/types/canvas";

class SketchStore {
    constructor() {
        makeAutoObservable(this);
    }

    async GetAllSketches(): Promise<SavedCanvas[]> {
        try {
            const { data }: AxiosResponse<SavedCanvas[]> = await axios.get(
                `${BaseUrl}sketches`,
                getRequestConfig(true)
            );
            return data;
        } catch (e) {
            return [];
        }
    }

    async GetSketchById(id: string): Promise<SavedCanvas | null> {
        try {
            const { data }: AxiosResponse<SavedCanvas> = await axios.get(
                `${BaseUrl}sketch/${id}`,
                getRequestConfig(true)
            );
            return data;
        } catch (e) {
            return null;
        }
    }

    async SaveSketch(sketchMetadata: CanvasMetadata, name: string): Promise<SavedCanvas | null> {
        try {
            const { data }: AxiosResponse<SavedCanvas> = await axios.post(
                `${BaseUrl}create`,
                { name, metadata: sketchMetadata },
                getRequestConfig(true)
            );
            return data;
        } catch (e) {
            return null;
        }
    }

    async UpdateSketch(id: string, sketchMetadata: CanvasMetadata, name: string): Promise<boolean> {
        try {
            await axios.post(`${BaseUrl}update/${id}`, { name, metadata: sketchMetadata }, getRequestConfig(true));
            return true;
        } catch (e) {
            return false;
        }
    }

    async DeleteSketch(id: string): Promise<boolean> {
        try {
            await axios.delete(`${BaseUrl}delete/${id}`, getRequestConfig(true));
            return true;
        } catch (e) {
            return false;
        }
    }
}

export default SketchStore;
