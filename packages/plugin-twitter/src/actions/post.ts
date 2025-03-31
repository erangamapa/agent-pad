import {
    Action,
    IAgentRuntime,
    Memory,
    State,
    composeContext,
    aiverseLogger,
    ModelClass,
    generateObject,
    truncateToCompleteSentence,
    ModelProviderName,
    generateText,
} from "@aiverse/core";
import { Scraper } from "agent-twitter-client";
import { tweetTemplate } from "../templates";
import { isTweetContent, TweetSchema } from "../types";

export const DEFAULT_MAX_TWEET_LENGTH = 280;

async function composeTweet(
    runtime: IAgentRuntime,
    _message: Memory,
    state?: State
): Promise<string> {
    try {
        const context = composeContext({
            state,
            template: tweetTemplate,
        });

        let tweetContent = "";

        try {
            // Try using generateObject first
            const tweetContentObject = await generateObject({
                runtime,
                context,
                modelClass: ModelClass.SMALL,
                schema: TweetSchema,
                stop: ["\n"],
            });

            if (isTweetContent(tweetContentObject.object)) {
                tweetContent = tweetContentObject.object.text.trim();
            } else {
                aiverseLogger.error(
                    "Invalid tweet content from generateObject:",
                    tweetContentObject.object
                );
                throw new Error("Invalid tweet content format");
            }
        } catch (error) {
            // If generateObject fails (e.g., for unsupported providers like hyperbolic),
            // fall back to generateText
            aiverseLogger.warn(
                "Falling back to generateText due to error:",
                error
            );

            tweetContent = await generateText({
                runtime,
                context:
                    context +
                    "\n\nWrite a concise tweet (under 280 characters):",
                modelClass: ModelClass.SMALL,
                stop: ["\n", "\n\n"],
            });

            // Clean up the response
            tweetContent = tweetContent.trim();
        }

        // Truncate the content to the maximum tweet length specified in the environment settings.
        const maxTweetLength = runtime.getSetting("MAX_TWEET_LENGTH");
        if (maxTweetLength) {
            tweetContent = truncateToCompleteSentence(
                tweetContent,
                Number(maxTweetLength)
            );
        } else {
            // Default truncation to standard tweet length if no setting
            tweetContent = truncateToCompleteSentence(
                tweetContent,
                DEFAULT_MAX_TWEET_LENGTH
            );
        }

        return tweetContent;
    } catch (error) {
        aiverseLogger.error("Error composing tweet:", error);
        throw error;
    }
}

async function sendTweet(twitterClient: Scraper, content: string) {
    const result = await twitterClient.sendTweet(content);

    const body = await result.json();
    aiverseLogger.log("Tweet response:", body);

    // Check for Twitter API errors
    if (body.errors) {
        const error = body.errors[0];
        aiverseLogger.error(
            `Twitter API error (${error.code}): ${error.message}`
        );
        return false;
    }

    // Check for successful tweet creation
    if (!body?.data?.create_tweet?.tweet_results?.result) {
        aiverseLogger.error(
            "Failed to post tweet: No tweet result in response"
        );
        return false;
    }

    return true;
}

async function postTweet(
    runtime: IAgentRuntime,
    content: string
): Promise<boolean> {
    try {
        const twitterClient = runtime.clients.twitter?.client?.twitterClient;
        const scraper = twitterClient || new Scraper();

        if (!twitterClient) {
            const username = runtime.getSetting("TWITTER_USERNAME");
            const password = runtime.getSetting("TWITTER_PASSWORD");
            const email = runtime.getSetting("TWITTER_EMAIL");
            const twitter2faSecret = runtime.getSetting("TWITTER_2FA_SECRET");

            if (!username || !password) {
                aiverseLogger.error(
                    "Twitter credentials not configured in environment"
                );
                return false;
            }
            // Login with credentials
            await scraper.login(username, password, email, twitter2faSecret);
            if (!(await scraper.isLoggedIn())) {
                aiverseLogger.error("Failed to login to Twitter");
                return false;
            }
        }

        // Send the tweet
        aiverseLogger.log("Attempting to send tweet:", content);

        try {
            if (content.length > DEFAULT_MAX_TWEET_LENGTH) {
                const noteTweetResult = await scraper.sendNoteTweet(content);
                if (
                    noteTweetResult.errors &&
                    noteTweetResult.errors.length > 0
                ) {
                    // Note Tweet failed due to authorization. Falling back to standard Tweet.
                    return await sendTweet(scraper, content);
                } else {
                    return true;
                }
            } else {
                return await sendTweet(scraper, content);
            }
        } catch (error) {
            throw new Error(`Note Tweet failed: ${error}`);
        }
    } catch (error) {
        // Log the full error details
        aiverseLogger.error("Error posting tweet:", {
            message: error.message,
            stack: error.stack,
            name: error.name,
            cause: error.cause,
        });
        return false;
    }
}

export const postAction: Action = {
    name: "POST_TWEET",
    similes: ["TWEET", "POST", "SEND_TWEET"],
    description: "Post a tweet to Twitter",
    validate: async (
        runtime: IAgentRuntime,
        message: Memory,
        state?: State
    ) => {
        try {
            // Check for Twitter credentials
            const username = runtime.getSetting("TWITTER_USERNAME");
            const password = runtime.getSetting("TWITTER_PASSWORD");
            const email = runtime.getSetting("TWITTER_EMAIL");
            const hasCredentials = !!username && !!password && !!email;
            aiverseLogger.log(`Has Twitter credentials: ${hasCredentials}`);

            if (!hasCredentials) {
                return false;
            }

            // Check if the model provider is supported
            const modelProvider = runtime.modelProvider;
            aiverseLogger.log(`Current model provider: ${modelProvider}`);

            // Even if we're using Hyperbolic, we have a fallback mechanism in place
            // so we can return true for validation

            return true;
        } catch (error) {
            aiverseLogger.error("Error validating Twitter action:", error);
            return false;
        }
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state?: State
    ): Promise<boolean> => {
        try {
            // Log runtime model provider for debugging
            aiverseLogger.log(`Using model provider: ${runtime.modelProvider}`);

            // Generate tweet content using context
            aiverseLogger.log("Attempting to compose tweet...");
            let tweetContent;
            try {
                tweetContent = await composeTweet(runtime, message, state);
            } catch (composeError) {
                aiverseLogger.error(
                    "Error in composeTweet function:",
                    composeError
                );
                return false;
            }

            if (!tweetContent) {
                aiverseLogger.error("No content generated for tweet");
                return false;
            }

            aiverseLogger.log(`Generated tweet content: ${tweetContent}`);

            // Check for dry run mode - explicitly check for string "true"
            if (
                process.env.TWITTER_DRY_RUN &&
                process.env.TWITTER_DRY_RUN.toLowerCase() === "true"
            ) {
                aiverseLogger.info(
                    `Dry run: would have posted tweet: ${tweetContent}`
                );
                return true;
            }

            // Post the tweet
            try {
                return await postTweet(runtime, tweetContent);
            } catch (postError) {
                aiverseLogger.error("Error in postTweet function:", postError);
                return false;
            }
        } catch (error) {
            aiverseLogger.error("Error in post action:", {
                message: error.message,
                stack: error.stack,
                name: error.name,
                cause: error.cause,
            });
            return false;
        }
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: { text: "You should tweet that" },
            },
            {
                user: "{{agentName}}",
                content: {
                    text: "I'll share this update with my followers right away!",
                    action: "POST_TWEET",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: { text: "Post this tweet" },
            },
            {
                user: "{{agentName}}",
                content: {
                    text: "I'll post that as a tweet now.",
                    action: "POST_TWEET",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: { text: "Share that on Twitter" },
            },
            {
                user: "{{agentName}}",
                content: {
                    text: "I'll share this message on Twitter.",
                    action: "POST_TWEET",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: { text: "Post that on X" },
            },
            {
                user: "{{agentName}}",
                content: {
                    text: "I'll post this message on X right away.",
                    action: "POST_TWEET",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: { text: "You should put that on X dot com" },
            },
            {
                user: "{{agentName}}",
                content: {
                    text: "I'll put this message up on X.com now.",
                    action: "POST_TWEET",
                },
            },
        ],
    ],
};
