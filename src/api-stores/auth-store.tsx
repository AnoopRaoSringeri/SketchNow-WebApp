import axios, { AxiosResponse } from "axios";
import { makeAutoObservable, runInAction } from "mobx";

export const BaseUrl = process.env.SKETCH_NOW_URL;
export const getRequestConfig = (withCredentials?: boolean) => {
    return {
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        },
        withCredentials: withCredentials
    };
};

class AuthStore {
    constructor() {
        makeAutoObservable(this);
    }
    isSessionValid = false;

    get IsSessionValid() {
        return this.isSessionValid;
    }

    set IsSessionValid(value: boolean) {
        runInAction(() => {
            this.isSessionValid = value;
        });
    }
    async Login({
        username,
        password,
        email
    }: {
        username: string;
        password: string;
        email: string;
    }): Promise<{ token: string } | null> {
        try {
            const { data }: AxiosResponse<{ token: string }> = await axios.post(
                `${BaseUrl}login`,
                {
                    username,
                    email,
                    password
                },
                getRequestConfig(true)
            );
            return data;
        } catch (e) {
            return null;
        }
    }

    async Logout(): Promise<boolean> {
        try {
            await axios.get(`${BaseUrl}logout`, getRequestConfig(true));
            return true;
        } catch (e) {
            return false;
        }
    }

    async Register({
        username,
        password,
        email
    }: {
        username: string;
        password: string;
        email: string;
    }): Promise<boolean> {
        try {
            await axios.post(
                `${BaseUrl}register`,
                {
                    username,
                    email,
                    password
                },
                getRequestConfig()
            );
            return true;
        } catch (e) {
            return false;
        }
    }

    async ForgotPassword(email: string): Promise<boolean> {
        try {
            await axios.post(
                `${BaseUrl}forgotPassword`,
                {
                    email
                },
                getRequestConfig()
            );
            return true;
        } catch (e) {
            return false;
        }
    }

    async IsValidSession(): Promise<boolean> {
        try {
            await axios.get(`${BaseUrl}`, getRequestConfig(true));
            return true;
        } catch (e) {
            return false;
        }
    }
}

export default AuthStore;
