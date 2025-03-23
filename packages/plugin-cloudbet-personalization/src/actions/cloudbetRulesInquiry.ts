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

            // Post-process the response to ensure it doesn't contain follow-up questions
            let finalResponse = response;

            // Define patterns for questions and invitation phrases
            const questionPatterns = [
                /\?/g, // Any question mark
                /Would you like to know more\b/gi, // "Would you like to know more"
                /Can I help you with anything else\b/gi, // "Can I help you with anything else"
                /Do you have any other questions\b/gi, // "Do you have any other questions"
                /Is there anything else\b/gi, // "Is there anything else"
                /Let me know if\b/gi, // "Let me know if"
                /Feel free to ask\b/gi, // "Feel free to ask"
                /For more information\b/gi, // "For more information"
                /If you need further details\b/gi, // "If you need further details"
                /contact support\b/gi, // Mentions of contacting support
                /contact Cloudbet\b/gi, // Mentions of contacting Cloudbet
                /please reach out\b/gi, // "please reach out"
                /don't hesitate to\b/gi, // "don't hesitate to"
                /I'd be happy to\b/gi, // "I'd be happy to"
                /I would be happy to\b/gi, // "I would be happy to"
                /please let me know\b/gi, // "please let me know"
                /hope this helps\b/gi, // "hope this helps"
                /hope that helps\b/gi, // "hope that helps"
                /Any other\b.*\?/gi, // "Any other..." followed eventually by question mark
                /Would you like\b/gi, // "Would you like"
                /Do you want\b/gi, // "Do you want"
                /Can I assist\b/gi, // "Can I assist"
                /Can I provide\b/gi, // "Can I provide"
                /May I help\b/gi, // "May I help"
                /Should you have\b/gi, // "Should you have"
                /\bplease\b/gi, // "please" as a standalone word
            ];

            // First, check for and remove any sentences with questions
            const sentences = finalResponse.split(/(?<=[.!])\s+/);
            const filteredSentences = sentences.filter((sentence) => {
                return !questionPatterns.some((pattern) =>
                    pattern.test(sentence)
                );
            });

            // Join the filtered sentences
            finalResponse = filteredSentences.join(" ");

            // If we've filtered too much, restore the original response but remove question marks
            if (
                finalResponse.trim().length < 10 ||
                !finalResponse.includes(
                    "Based on Cloudbet's terms and conditions:"
                )
            ) {
                // Just remove question marks and common question phrases instead
                finalResponse = response;
                questionPatterns.forEach((pattern) => {
                    finalResponse = finalResponse.replace(pattern, "");
                });

                // Remove any double spaces created by replacements
                finalResponse = finalResponse.replace(/\s+/g, " ").trim();
            }

            // Make sure we still have our required prefix
            if (
                !finalResponse.includes(
                    "Based on Cloudbet's terms and conditions:"
                )
            ) {
                finalResponse =
                    "Based on Cloudbet's terms and conditions: " +
                    finalResponse;
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
                    text: "Based on Cloudbet's terms and conditions, withdrawals are processed within 24 hours, subject to verification procedures. The minimum withdrawal amount is 0.001 BTC or equivalent in other cryptocurrencies. There are no maximum withdrawal limits for verified accounts.",
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
