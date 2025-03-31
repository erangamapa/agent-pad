import {
    aiverseLogger,
    Action,
    ActionExample,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State,
    generateImage,
} from "@aiverse/core";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { getLastBetDetails } from "./placeNBAMoneyLineBet";

// Define bet details type for type safety
interface BetDetails {
    eventName: string;
    teamName: string;
    stake: number | null;
    price: string;
    status: string;
    timestamp: number;
}

export async function validateCloudinaryConfig(
    runtime: IAgentRuntime
): Promise<boolean> {
    const cloudName = runtime.getSetting("CLOUDINARY_CLOUD_NAME");
    const apiKey = runtime.getSetting("CLOUDINARY_API_KEY");
    const apiSecret = runtime.getSetting("CLOUDINARY_API_SECRET");

    if (!cloudName || !apiKey || !apiSecret) {
        aiverseLogger.error(
            "Missing Cloudinary configuration. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
        );
        return false;
    }

    // Configure Cloudinary
    cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
    });

    return true;
}

export async function uploadToCloudinary(
    filePath: string,
    filename: string
): Promise<string> {
    try {
        aiverseLogger.log(`Uploading image to Cloudinary: ${filename}`);
        const result = await cloudinary.uploader.upload(filePath, {
            public_id: filename,
            overwrite: true,
            resource_type: "image",
        });

        aiverseLogger.log(`Cloudinary upload successful: ${result.secure_url}`);
        return result.secure_url;
    } catch (error) {
        aiverseLogger.error(`Cloudinary upload failed: ${error}`);
        throw error;
    }
}

export async function saveGeneratedImageAndUploadToCloudinary(imageResult: {
    success: boolean;
    data?: string[];
    error?: any;
}): Promise<string> {
    if (
        !imageResult.success ||
        !imageResult.data ||
        imageResult.data.length === 0
    ) {
        throw new Error("Failed to generate image");
    }

    const image = imageResult.data[0];
    // Save the image and get filepath
    const filename = `generated_${Date.now()}`;

    // Choose save function based on image data format
    const filepath = image.startsWith("http")
        ? await saveHeuristImage(image, filename)
        : saveBase64Image(image, filename);

    // Upload to Cloudinary
    const cloudinaryUrl = await uploadToCloudinary(filepath, filename);

    // Optionally delete the local file after uploading to Cloudinary
    try {
        fs.unlinkSync(filepath);
        aiverseLogger.log(`Deleted local file: ${filepath}`);
    } catch (error) {
        aiverseLogger.error(`Failed to delete local file: ${filepath}`, error);
    }

    return cloudinaryUrl;
}

// Define helper functions
export function saveBase64Image(base64Data: string, filename: string): string {
    // Remove header from base64 string if it exists
    const base64Image = base64Data.replace(/^data:image\/\w+;base64,/, "");

    // Create directory if it doesn't exist
    const dir = "./tmp";
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    // Save file
    const filepath = `${dir}/${filename}.png`;
    fs.writeFileSync(filepath, base64Image, { encoding: "base64" });
    aiverseLogger.log(`Saved base64 image to: ${filepath}`);

    return filepath;
}

export async function saveHeuristImage(
    imageUrl: string,
    filename: string
): Promise<string> {
    const response = await fetch(imageUrl);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create directory if it doesn't exist
    const dir = "./tmp";
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    const filepath = `${dir}/${filename}.png`;
    fs.writeFileSync(filepath, buffer);
    aiverseLogger.log(`Saved image from URL to: ${filepath}`);

    return filepath;
}

export const generateNBABetSlip: Action = {
    name: "GENERATE_NBA_BET_SLIP",
    similes: ["BETSLIP", "IMAGE", "NBA", "BETTING", "SPORTS"],
    description: "Generate an image slip for NBA betting.",
    suppressInitialMessage: true,
    validate: async (runtime: IAgentRuntime) => {
        // Validate Cloudinary config
        return await validateCloudinaryConfig(runtime);
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        callback: HandlerCallback
    ) => {
        try {
            // First try to get bet details from the shared module-level variable
            const betDetails = getLastBetDetails();

            if (!betDetails) {
                callback({
                    text: "I couldn't find any recent bet details. Please place a bet first before generating an image.",
                });
                return false;
            }

            const { eventName, teamName, stake, price, status } = betDetails;

            // Validate Cloudinary configuration
            const cloudinaryConfigValid =
                await validateCloudinaryConfig(runtime);
            if (!cloudinaryConfigValid) {
                callback({
                    text: "I couldn't generate the bet slip image due to missing Cloudinary configuration.",
                });
                return false;
            }

            // Generate the image
            const images = await generateImage(
                {
                    width: 1600,
                    height: 1152,
                    prompt: `Create an image of a ${eventName} game with their logos in the background. Add 'wagered $${stake?.toString()} X ${price}' to the very bottom of the image without covering logos.`,
                    negativePrompt: "ugly, blurry, low quality, distorted",
                    seed: 42,
                    stylePreset: "anime",
                    numIterations: 50,
                },
                runtime
            );

            const cloudinaryUrl =
                await saveGeneratedImageAndUploadToCloudinary(images);

            // Return the image with success message
            callback({
                text:
                    status === "ACCEPTED"
                        ? `Here's your bet slip for the $${stake?.toString()} bet on ${teamName} in the ${eventName} game.`
                        : `Here's your bet slip for the pending $${stake?.toString()} bet on ${teamName} in the ${eventName} game.`,
                attachments: [
                    {
                        id: uuidv4(),
                        url: cloudinaryUrl,
                        title: "Betslip",
                        source: "imageGeneration",
                        description: `${eventName} game`,
                        text: `Betting for ${eventName}`,
                        contentType: "image/png",
                    },
                ],
            });
            return true;
        } catch (error: any) {
            aiverseLogger.error("Error generating NBA bet slip:", error);
            callback({
                text: "Sorry, I couldn't generate the bet slip image. Please try again later.",
            });
            return false;
        }
    },
    // Examples for the action
    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Generate a bet slip for my recent NBA bet",
                },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "Here's your bet slip for the $100 bet on Lakers in the Lakers vs Bulls game.",
                    action: "GENERATE_NBA_BET_SLIP",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Show me an image of my bet",
                },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "Here's your bet slip for the $75 bet on Celtics in the Celtics vs Heat game.",
                    action: "GENERATE_NBA_BET_SLIP",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Create a bet slip image",
                },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "Here's your bet slip for the $50 bet on Warriors in the Warriors vs Nets game.",
                    action: "GENERATE_NBA_BET_SLIP",
                },
            },
        ],
    ] as ActionExample[][],
};
