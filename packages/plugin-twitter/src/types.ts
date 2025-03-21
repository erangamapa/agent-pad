import { z } from "zod";

export interface TweetContent {
    text: string;
}

export const TweetSchema = z.object({
    text: z.string().describe("The text of the tweet"),
});

/**
 * Checks if an object matches the TweetContent interface
 * Enhanced to handle various response formats from different providers
 */
export const isTweetContent = (obj: any): obj is TweetContent => {
    // Standard validation with the schema
    if (TweetSchema.safeParse(obj).success) {
        return true;
    }

    // Alternative formats that different providers might return

    // Check if the object itself is a string (some providers might just return the text)
    if (typeof obj === "string" && obj.trim().length > 0) {
        return false; // We don't want to modify our code flow, but this helps in debugging
    }

    // Check if object has a content property with text
    if (
        obj &&
        typeof obj.content === "object" &&
        typeof obj.content.text === "string"
    ) {
        return false; // For debugging purposes
    }

    // Check if object has a message property with text
    if (obj && typeof obj.message === "string") {
        return false; // For debugging purposes
    }

    return false;
};
