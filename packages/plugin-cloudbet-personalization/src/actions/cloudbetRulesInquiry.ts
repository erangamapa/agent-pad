import {
    elizaLogger,
    Action,
    ActionExample,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State,
} from "@elizaos/core";
import { queryRulesWithLLM } from "../services";

/**
 * Gather conversation context from recent messages
 */
const getConversationContext = (
    runtime: IAgentRuntime,
    currentQuery: string
): string => {
    let context = "";

    try {
        // Attempt to get previous messages from runtime context or state
        // This is a simplified approach that depends on the specific runtime implementation

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
        // from runtime.getState() or similar methods, depending on the runtime API
    } catch (error) {
        elizaLogger.warn("Error gathering conversation context:", error);
    }

    return context;
};

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
                    text: "I need a specific question about Cloudbet's terms, conditions, or rules to help you. Could you please provide more details about what you'd like to know?",
                });
                return true;
            }

            elizaLogger.info(
                `Processing inquiry about Cloudbet rules: ${query}`
            );

            // Get conversation context to help with follow-up questions
            const conversationContext = getConversationContext(runtime, query);

            // Use LLM to generate a response based on user query, conversation context, and Cloudbet rules
            const response = await queryRulesWithLLM(
                runtime,
                query,
                conversationContext
            );

            // Post-process the response to ensure it's brief and factual
            let finalResponse = response;

            // Define patterns for questions and friendly language
            const unwantedPatterns = [
                /\?/g, // Any question mark
                /Would you like\b|Can I\b|Do you\b|Is there\b|Let me know\b|Feel free\b/gi, // Questions/offers
                /\bplease\b|\bhope\b|\bglad\b|\bhappy\b|\bhelp(ful)?\b|\bassist\b/gi, // Friendly language
                /for more information|further details|reach out|don't hesitate|contact support/gi, // Engagement
                /I would|I will|I can|I'd|I'm|I am|we|our/gi, // First person language
                /thank|thanks|helpful|assist|support|provide/gi, // Service language
                /additionally|moreover|furthermore|also|too|as well/gi, // Connective terms that add length
            ];

            // Remove unwanted phrases and patterns
            unwantedPatterns.forEach((pattern) => {
                finalResponse = finalResponse.replace(pattern, "");
            });

            // Ensure the response starts with our required prefix
            const prefix = ":";
            if (!finalResponse.includes(prefix)) {
                finalResponse = prefix + " " + finalResponse.trim();
            } else {
                // Extract just the part after the prefix
                const parts = finalResponse.split(prefix);
                if (parts.length > 1) {
                    finalResponse = prefix + parts[1].trim();
                }
            }

            // Remove double spaces and clean up
            finalResponse = finalResponse.replace(/\s+/g, " ").trim();

            // Limit to two sentences maximum
            const sentences = finalResponse.split(/(?<=[.!])\s+/);
            if (sentences.length > 2) {
                finalResponse = sentences.slice(0, 2).join(" ");
            }

            // If we've stripped too much, provide a minimal response
            if (finalResponse.length <= prefix.length + 5) {
                finalResponse = `${prefix} This information is not in the reference material.`;
            }

            // Format and send the response
            callback({
                text: finalResponse,
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
        // Add example of follow-up question
        [
            {
                user: "{{user1}}",
                content: {
                    text: "What are the withdrawal limits on Cloudbet?",
                },
            },
            {
                user: "{{agent}}",
                content: {
                    text: ", withdrawals are processed within 24 hours, subject to verification procedures. The minimum withdrawal amount is 0.001 BTC or equivalent in other cryptocurrencies. There are no maximum withdrawal limits for verified accounts.",
                    action: "CLOUDBET_RULES_INQUIRY",
                },
            },
            {
                user: "{{user1}}",
                content: {
                    text: "And what about verification requirements?",
                },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "Let me check about the verification requirements.",
                    action: "CLOUDBET_RULES_INQUIRY",
                },
            },
        ],
    ] as ActionExample[][],
} as Action;
