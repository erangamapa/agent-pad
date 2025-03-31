import { IAgentRuntime } from "@aiverse/core";
import { z } from "zod";

export const nbaBettingEnvSchema = z.object({
    CLOUDBET_API_KEY: z.string().min(1, "Cloudbet API key is required"),
});

export type nbaBettingConfig = z.infer<typeof nbaBettingEnvSchema>;

export async function validateNBAMoneyLineBettingConfig(
    runtime: IAgentRuntime
): Promise<nbaBettingConfig> {
    try {
        const config = {
            CLOUDBET_API_KEY: runtime.getSetting("CLOUDBET_API_KEY"),
        };
        console.log("config: ", config);
        return nbaBettingEnvSchema.parse(config);
    } catch (error) {
        console.log("error::::", error);
        if (error instanceof z.ZodError) {
            const errorMessages = error.errors
                .map((err) => `${err.path.join(".")}: ${err.message}`)
                .join("\n");
            throw new Error(
                `Cloudbet API configuration validation failed:\n${errorMessages}`
            );
        }
        throw error;
    }
}
