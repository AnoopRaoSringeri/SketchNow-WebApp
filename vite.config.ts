import react from "@vitejs/plugin-react";
import dotenv from "dotenv";
// import fs from "fs";
import path from "path";
import { defineConfig } from "vite";
import mkcert from "vite-plugin-mkcert";
dotenv.config();
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        mkcert({
            // savePath: "../certs", // save the generated certificate into certs directory
            // force: true // force generation of certs even without setting https property in the vite config
        })
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src")
        }
    },
    define: {
        "process.env": process.env
    },
    server: {
        // port: 3000,
        // https: {
        //     key: fs.readFileSync("../cert/key.pem"), // replace it with your key path
        //     cert: fs.readFileSync("../cert/cert.pem") // replace it with your certificate path
        // }
    }
});
