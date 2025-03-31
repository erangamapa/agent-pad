import {
    aiverseLogger,
    Action,
    ActionExample,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State,
} from "@aiverse/core";
import { queryPlayerRoundsWithLLM } from "../services";

/**
 * Gather conversation context from recent messages
 */
const getConversationContext = (
    runtime: IAgentRuntime,
    currentQuery: string
): string => {
    let context = "";

    try {
        // For demonstration, we'll check if the currentQuery appears to be a follow-up question
        const followUpIndicators = [
            "what about",
            "how about",
            "and what",
            "also tell me",
            "follow up",
            "in addition",
            "furthermore",
            "moreover",
            "then",
            "also",
            "too",
            "as well",
            "?",
            "additionally",
            "can you explain",
            "tell me more",
            "elaborate",
        ];

        const isLikelyFollowUp = followUpIndicators.some((indicator) =>
            currentQuery.toLowerCase().includes(indicator.toLowerCase())
        );

        if (isLikelyFollowUp) {
            // For demonstration purposes, we'll add a note that this seems to be a follow-up
            context =
                "Note: This appears to be a follow-up question. Consider previous context when answering.";
        }

        // In a real implementation, we would extract actual conversation history here
    } catch (error) {
        aiverseLogger.warn("Error gathering conversation context:", error);
    }

    return context;
};

export const playerHistoryInquiryAction: Action = {
    name: "PLAYER_HISTORY_INQUIRY",
    similes: [
        "HISTORY",
        "GAMES",
        "ROUNDS",
        "PLAYED",
        "WINNING",
        "LOSING",
        "BET",
        "WAGER",
        "CASINO",
    ],
    description:
        "Get information about your gaming history, rounds played, and game statistics.",
    suppressInitialMessage: false,
    validate: async (_runtime: IAgentRuntime) => {
        return true;
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        _state: State,
        _options: { [key: string]: unknown },
        callback: HandlerCallback
    ) => {
        try {
            // Get the user's query
            const query = message.content?.text || "";

            if (!query) {
                callback({
                    text: "What would you like to know about your gaming history?",
                });
                return true;
            }

            aiverseLogger.info(
                `Processing inquiry about player history: ${query}`
            );

            // Get conversation context to help with follow-up questions
            const conversationContext = getConversationContext(runtime, query);

            // Use LLM to generate a response based on user query and player rounds data
            const response = await queryPlayerRoundsWithLLM(
                runtime,
                query,
                conversationContext
            );

            // Send the response without additional formatting
            callback({
                text: response,
            });

            return true;
        } catch (error: any) {
            aiverseLogger.error(
                "Error in player history inquiry handler:",
                error
            );
            callback({
                text: "I'm having trouble accessing your gaming history right now. Please try again later.",
            });
            return false;
        }
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Which game have I played the most?",
                },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "Let me check your gaming history.",
                    action: "PLAYER_HISTORY_INQUIRY",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "What was my best round?",
                },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "I'll analyze your rounds to find your best performance.",
                    action: "PLAYER_HISTORY_INQUIRY",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "How much have I won playing Aviator?",
                },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "Let me calculate your Aviator game results.",
                    action: "PLAYER_HISTORY_INQUIRY",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "When did I last play roulette?",
                },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "I'll check when you last played roulette.",
                    action: "PLAYER_HISTORY_INQUIRY",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Show me my casino game statistics",
                },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "Here's a summary of your gaming activity:",
                    action: "PLAYER_HISTORY_INQUIRY",
                },
            },
        ],
    ],
};
