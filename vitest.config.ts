import react from "@vitejs/plugin-react";
import tsConfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
    plugins: [tsConfigPaths(), react()],
    test: {
        globals: true,
        passWithNoTests: true,
        setupFiles: "./src/setup-tests.ts", // Ensure this points to your setup file
        css: false,
        outputFile: {
            json: "coverage/report.json",
        },
        coverage: {
            reporter: ["text", "json", "html", "text-summary"],
        },
        clearMocks: true,
        mockReset: true,
        restoreMocks: true,
        unstubGlobals: true,
        unstubEnvs: true,
        include: ["**/?(*.)test.?(c|m)[jt]s?(x)"],
    },
});
