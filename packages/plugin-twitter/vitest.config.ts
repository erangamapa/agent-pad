import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
    test: {
        globals: true,
        environment: "node",
    },
    resolve: {
        alias: {
            "@aiverse/core": resolve(__dirname, "../core/src"),
        },
    },
});
