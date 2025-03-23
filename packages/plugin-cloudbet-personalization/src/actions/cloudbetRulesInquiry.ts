import {
    elizaLogger,
    Action,
    ActionExample,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State,
} from "@elizaos/core";
import { searchRulesForQuery } from "../services";

export const cloudbetRulesInquiryAction: Action = {
    name: "CLOUDBET_RULES_INQUIRY",
    similes: ["TERMS", "CONDITIONS", "RULES", "POLICY", "SPORTSBOOK", "CASINO"],
    description:
        "Get information about Cloudbet's terms, conditions, and sportsbook rules.",
    suppressInitialMessage: false,
    validate: async (_runtime: IAgentRuntime) => {
        return true;
    },
    handler: async (
        _runtime: IAgentRuntime,
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
                    text: "I need a specific question about Cloudbet's terms, conditions, or rules to help you. Could you please provide more details about what you'd like to know?",
                });
                return true;
            }

            elizaLogger.info(`Searching Cloudbet rules for: ${query}`);

            // Search for relevant information
            const response = await searchRulesForQuery(query);

            // Format and send the response
            callback({
                text: response,
            });

            return true;
        } catch (error: any) {
            elizaLogger.error(
                "Error in Cloudbet rules inquiry handler:",
                error
            );
            callback({
                text: "I'm having trouble accessing Cloudbet's terms and conditions right now. Please try again later or contact Cloudbet support directly.",
            });
            return false;
        }
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "What are the rules for cashout on Cloudbet?",
                },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "Let me find that information for you.",
                    action: "CLOUDBET_RULES_INQUIRY",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Can you tell me about the withdrawal limitations on Cloudbet?",
                },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "I'll look that up for you in Cloudbet's terms and conditions.",
                    action: "CLOUDBET_RULES_INQUIRY",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "What are the bonus playthrough requirements on Cloudbet?",
                },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "Let me check Cloudbet's terms regarding bonus playthrough requirements.",
                    action: "CLOUDBET_RULES_INQUIRY",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Explain Cloudbet's sportsbook rules",
                },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "Here's what I found about Cloudbet's sportsbook rules:",
                    action: "CLOUDBET_RULES_INQUIRY",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "What are Cloudbet's terms and conditions for casino games?",
                },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "Let me search Cloudbet's terms and conditions regarding casino games.",
                    action: "CLOUDBET_RULES_INQUIRY",
                },
            },
        ],
    ] as ActionExample[][],
} as Action;
