import axios, { AxiosResponse } from "axios";

import { BaseUrl, getRequestConfig } from "@/api-stores/auth-store";

class UploadStore {
    async UploadFile(file: File, id: string): Promise<{ data: string[][] }> {
        try {
            const formData = new FormData();
            formData.append("id", id);
            formData.append("file", file);
            const { data }: AxiosResponse<{ data: string[][] }> = await axios.post(`${BaseUrl}upload`, formData, {
                withCredentials: true
            });
            return data;
        } catch (e) {
            return { data: [] };
        }
    }
    async GetData(id: string): Promise<{ data: string[][] }> {
        try {
            const { data }: AxiosResponse<{ data: string[][] }> = await axios.get(
                `${BaseUrl}data/${id}`,
                getRequestConfig(true)
            );
            return data;
        } catch (e) {
            return { data: [] };
        }
    }
}

export default UploadStore;
