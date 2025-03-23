import {
    elizaLogger,
    Action,
    ActionExample,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State,
    generateText,
    ModelClass,
} from "@elizaos/core";

/**
 * Loyalty benefits data as raw string for context
 */
const LOYALTY_BENEFITS_DATA = `Loyalty tiers and benefits
Discover the benefits of each loyalty tier, where every level-up unlocks more rakeback, bigger cash drops, and greater rewards.

Cloudbet Rewards features eight loyalty tiers, each offering rewards that increase in value as you progress through the tiers. The bigger you bet, the faster you level up, and the bigger your rewards.

Rewards at each loyalty tier
Each loyalty tier have turnover requirement and offers rakeback, boosted rakeback, daily, weekly, and monthly cash drops, and Level-up Rewards. The faster you move up through the tiers, the bigger your rewards.

Tier,Turnover Requirements (USD),Rakeback,Boosted Rakeback (with TURBO),Total Level-up Rewards (USD)
Bronze,$1000,5%,Up to 10%,-
Silver,$10000,5%,Up to 10%,15
Gold,$100000,5%,Up to 10%,150
Emerald,$1000000,5%,Up to 10%,1500
Sapphire (VIP),$10000000,5%,Up to 12.5%,15000
Ruby (VIP),$100000000,5%,Up to 15%,227500
Diamond (VIP),$1000000000,10%,Up to 20%,1820000
Blue Diamond (VIP),$10000000000,15%,Up to 25%,14500000


Frequently asked questions
How do I level up to a higher loyalty tier?
Complete your turnover requirement to level up. Keep playing and placing bets. The bigger you bet, the faster you level up.

How do I find out my current tier?
Once you're logged in to Cloudbet, select Rewards at the top navigation to see your current loyalty tier.

How do I check my progress toward the next tier?
Once you're logged in, select Rewards at the top navigation, then select your loyalty tier. You'll see how much more you need to bet before you level up.`;

/**
 * Get conversation context from recent messages
 */
const getConversationContext = (
    runtime: IAgentRuntime,
    currentQuery: string
): string => {
    let context = "";

    try {
        // Check if the query appears to be a follow-up question
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
            context =
                "Note: This appears to be a follow-up question. Consider previous context when answering.";
        }
    } catch (error) {
        elizaLogger.warn("Error gathering conversation context:", error);
    }

    return context;
};

/**
 * Query loyalty program data using LLM
 */
const queryLoyaltyProgramWithLLM = async (
    runtime: IAgentRuntime,
    query: string,
    conversationContext: string = ""
): Promise<string> => {
    try {
        elizaLogger.info(`Querying loyalty program for: ${query}`);

        // Current user tier information (in a real implementation, this would be retrieved from a user profile)
        const userCurrentTier = "Gold";
        const userInfo = `
CURRENT USER INFORMATION:
- Current Loyalty Tier: ${userCurrentTier}
- Current Turnover: $75,000 (75% of the way to the Gold tier requirement)
- Next Tier: Emerald (requires $1,000,000 turnover)
- Current Rakeback: 5%
- Current Boosted Rakeback (with TURBO): 10%
- Total Level-up Rewards earned: $150 (Gold tier)`;

        // Create context with conversation history, loyalty data, user info, and query
        const context = `
${conversationContext ? `PREVIOUS CONVERSATION:\n${conversationContext}\n\n` : ""}
CURRENT USER QUERY: ${query}

${userInfo}

CLOUDBET LOYALTY PROGRAM REFERENCE:
${LOYALTY_BENEFITS_DATA}

INSTRUCTIONS:
- Answer questions about the Cloudbet loyalty program
- Personalize responses based on the user's current tier (Gold)
- Be factual and concise
- Use 1-2 sentences for straightforward questions
- For tier comparisons or benefits explanations, you may use 3-4 sentences maximum
- No unnecessary greetings or pleasantries
- Focus specifically on what they ask about, don't provide unrelated information
- If comparing tiers, be specific about the differences in requirements and benefits
- For "how to" questions, provide clear actionable steps
- Always provide accurate numbers from the reference data
`;

        // Define system prompt to guide the model
        const systemPrompt = `
You are a factual database query system that returns only the exact information requested about Cloudbet's loyalty program.

STRICT RULES:
1. NEVER exceed 3-4 sentences maximum.
2. NEVER use friendly language or unnecessary pleasantries.
3. NEVER ask questions back to the user.
4. ALWAYS personalize responses to the user's Gold tier when relevant.
5. BE SPECIFIC with numbers and requirements from the loyalty program.
6. For tier comparisons, clearly outline the requirements and benefits of each.
7. If information is not available, simply state "This information is not available in the loyalty program reference."
`;

        // Generate response using LLM
        const response = await generateText({
            runtime,
            context,
            modelClass: ModelClass.MEDIUM,
            customSystemPrompt: systemPrompt,
        });

        return response;
    } catch (error) {
        elizaLogger.error("Error querying loyalty program:", error);
        return "I'm having trouble accessing Cloudbet's loyalty program information right now. Please try again later or contact Cloudbet support directly.";
    }
};

export const loyaltyProgramInquiryAction: Action = {
    name: "CLOUDBET_LOYALTY_PROGRAM_INQUIRY",
    similes: [
        "LOYALTY",
        "REWARDS",
        "TIER",
        "BENEFITS",
        "RAKEBACK",
        "VIP",
        "LEVEL",
    ],
    description:
        "Get information about Cloudbet's loyalty program, tiers, and rewards.",
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
                    text: "I need a specific question about Cloudbet's loyalty program to help you. Could you please provide more details about what you'd like to know?",
                });
                return true;
            }

            elizaLogger.info(
                `Processing inquiry about Cloudbet loyalty program: ${query}`
            );

            // Get conversation context to help with follow-up questions
            const conversationContext = getConversationContext(runtime, query);

            // Query the loyalty program data with LLM
            const response = await queryLoyaltyProgramWithLLM(
                runtime,
                query,
                conversationContext
            );

            // Post-process the response to ensure it's concise and factual
            let finalResponse = response;

            // Clean up the response
            finalResponse = finalResponse
                .replace(
                    /\bI would\b|\bI will\b|\bI can\b|\bI'd\b|\bI'm\b|\bI am\b/gi,
                    ""
                )
                .replace(/\s+/g, " ")
                .trim();

            callback({
                text: finalResponse,
            });

            return true;
        } catch (error: any) {
            elizaLogger.error(
                "Error in Cloudbet loyalty program inquiry handler:",
                error
            );
            callback({
                text: "I'm having trouble accessing Cloudbet's loyalty program information right now. Please try again later or contact Cloudbet support directly.",
            });
            return false;
        }
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "What loyalty tier am I in?",
                },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "Let me check your loyalty tier information.",
                    action: "CLOUDBET_LOYALTY_PROGRAM_INQUIRY",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "How can I get promoted to Emerald tier?",
                },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "I'll explain how to reach the Emerald tier.",
                    action: "CLOUDBET_LOYALTY_PROGRAM_INQUIRY",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "What are the benefits of my current loyalty tier?",
                },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "Let me tell you about the benefits of your current tier.",
                    action: "CLOUDBET_LOYALTY_PROGRAM_INQUIRY",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "What's the difference between Gold and Emerald tiers?",
                },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "I'll compare the Gold and Emerald tiers for you.",
                    action: "CLOUDBET_LOYALTY_PROGRAM_INQUIRY",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "How does rakeback work in the loyalty program?",
                },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "I'll explain how rakeback works in Cloudbet's loyalty program.",
                    action: "CLOUDBET_LOYALTY_PROGRAM_INQUIRY",
                },
            },
        ],
    ],
};
