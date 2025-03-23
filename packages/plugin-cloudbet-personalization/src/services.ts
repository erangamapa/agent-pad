import {
    elizaLogger,
    generateText,
    ModelClass,
    IAgentRuntime,
} from "@elizaos/core";
import { mockedCloudbetRules } from "./mockRulesData";

// Content storage to cache the data
let cachedContent: string | null = null;

/**
 * Fetch and parse the content from Cloudbet help/rules page
 * In a production environment, this would make a real HTTP request
 * but for this example, we'll use the mock data
 */
export const fetchCloudbetRules = async (): Promise<string> => {
    // If content is already cached, return it
    if (cachedContent) {
        return cachedContent;
    }

    try {
        elizaLogger.info("Loading Cloudbet rules from mock data...");

        // In a real implementation, this would fetch data from the website
        // const response = await axios.get('https://www.cloudbet.com/en/help/rules');
        // const $ = cheerio.load(response.data);
        // Extract content using cheerio...

        // Instead, we'll use our mock data
        const content = mockedCloudbetRules;

        // Cache the content for future use
        cachedContent = content;
        elizaLogger.success("Successfully loaded Cloudbet rules");

        return content;
    } catch (error) {
        elizaLogger.error("Error loading Cloudbet rules:", error);
        throw new Error("Failed to load Cloudbet rules");
    }
};

/**
 * Search for relevant information based on user query
 */
export const searchRulesForQuery = async (query: string): Promise<string> => {
    try {
        // Get the rules content
        const content = await fetchCloudbetRules();

        // Convert query and content to lowercase for case-insensitive matching
        const lowerQuery = query.toLowerCase();

        // Define keywords to search for based on the query
        const keywords = extractKeywords(lowerQuery);

        // Search for paragraphs containing the keywords
        const paragraphs = content.split("\n\n");
        const relevantParagraphs = paragraphs.filter((paragraph) => {
            const lowerParagraph = paragraph.toLowerCase();
            return keywords.some((keyword) => lowerParagraph.includes(keyword));
        });

        // If no relevant paragraphs found, return a default message
        if (relevantParagraphs.length === 0) {
            return "I couldn't find specific information about that in Cloudbet's terms and conditions. Please try asking in a different way or contact Cloudbet support for more detailed information.";
        }

        // Combine relevant paragraphs into a response
        let response = "Based on Cloudbet's terms and conditions:\n\n";
        response += relevantParagraphs.join("\n\n");
        return response;
    } catch (error) {
        elizaLogger.error("Error searching rules:", error);
        return "I'm having trouble accessing Cloudbet's terms and conditions right now. Please try again later or contact Cloudbet support directly.";
    }
};

/**
 * Extract relevant keywords from the user query
 */
const extractKeywords = (query: string): string[] => {
    // Common betting and casino terms to look for
    const commonTerms = [
        "withdrawal",
        "deposit",
        "bonus",
        "bet",
        "odds",
        "cash out",
        "cashout",
        "limit",
        "restriction",
        "account",
        "verification",
        "kyc",
        "terms",
        "conditions",
        "rules",
        "sportsbook",
        "casino",
        "game",
        "stake",
        "playthrough",
        "rollover",
        "wagering",
        "requirement",
        "promotion",
        "responsible",
        "gambling",
        "payout",
        "transaction",
        "fee",
        "bitcoin",
        "crypto",
        "currency",
        "odds",
        "market",
        "live",
        "in-play",
        "settlement",
    ];

    // Extract keywords from the query
    const queryWords = query.split(/\s+/);
    const keywords = queryWords.filter(
        (word) => word.length > 3 || commonTerms.includes(word)
    );

    // Add additional context keywords based on the query
    if (query.includes("withdraw") || query.includes("take out")) {
        keywords.push("withdrawal");
    }

    if (query.includes("bonus") || query.includes("promotion")) {
        keywords.push("bonus", "playthrough", "wagering");
    }

    if (query.includes("cash out") || query.includes("cashout")) {
        keywords.push("cash out", "cashout", "settlement");
    }

    return [...new Set(keywords)]; // Remove duplicates
};

/**
 * Get Cloudbet rules data
 */
export const getCloudbetRulesData = (): string => {
    return mockedCloudbetRules;
};

/**
 * Query Cloudbet rules using LLM capabilities
 * @param runtime The agent runtime
 * @param query The current user query
 * @param conversationContext Optional context from previous messages
 */
export const queryRulesWithLLM = async (
    runtime: IAgentRuntime,
    query: string,
    conversationContext: string = ""
): Promise<string> => {
    try {
        elizaLogger.info(`Querying Cloudbet rules for: ${query}`);

        // Create context with conversation history, the rules data, and user query
        const context = `
${conversationContext ? `PREVIOUS CONVERSATION:\n${conversationContext}\n\n` : ""}
CURRENT USER QUERY: ${query}

CLOUDBET RULES AND TERMS REFERENCE:
${mockedCloudbetRules}

IMPORTANT INSTRUCTIONS:
- Respond ONLY with factual information from the reference.
- Keep your response concise and direct.
- DO NOT include ANY questions in your response.
- DO NOT invite further questions or offer additional help.
- End your response with a clear statement, not a question or invitation.
`;

        // Define system prompt to guide the model
        const systemPrompt = `
You are a knowledgeable assistant for Cloudbet, a cryptocurrency sportsbook and casino.
Your task is to answer user questions about Cloudbet's terms, conditions, and rules by referencing the provided CLOUDBET RULES AND TERMS REFERENCE.

CRITICAL INSTRUCTIONS:
1. NEVER ask questions of any kind in your response.
2. Focus ONLY on information contained in the reference material.
3. If the answer is directly stated in the reference, quote it exactly.
4. If the answer requires synthesis from multiple sections, clearly summarize the relevant information.
5. If the information is not available in the reference, simply state "Based on Cloudbet's terms and conditions: This specific information is not available in the reference material."
6. Keep responses extremely concise - use short, direct sentences.
7. Begin your response with "Based on Cloudbet's terms and conditions:" followed by the relevant information.
8. DO NOT end with phrases like "Can I help with anything else?" or "Do you have other questions?"
9. DO NOT invite further interaction or offer additional assistance.
10. DO NOT suggest the user contact support or take any action.
11. Limit your response to 1-3 sentences whenever possible.

Example of correct formatting:
"Based on Cloudbet's terms and conditions: Withdrawals are processed within 24 hours. The minimum amount is 0.001 BTC."

Example of incorrect formatting:
"Based on Cloudbet's terms and conditions: Withdrawals are processed within 24 hours. The minimum amount is 0.001 BTC. Would you like to know about deposit methods as well?"

The second example contains a question, which is strictly forbidden.`;

        // Use the LLM to generate a response based on the reference material
        const response = await generateText({
            runtime,
            context,
            modelClass: ModelClass.MEDIUM,
            customSystemPrompt: systemPrompt,
        });

        elizaLogger.success(
            `Successfully generated response for query: ${query}`
        );
        return response;
    } catch (error) {
        elizaLogger.error("Error querying Cloudbet rules with LLM:", error);
        return "I'm having trouble accessing Cloudbet's terms and conditions right now. Please try again later or contact Cloudbet support directly.";
    }
};
