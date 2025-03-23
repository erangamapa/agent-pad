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
`;

        // Define system prompt to guide the model
        const systemPrompt = `
You are a knowledgeable assistant for Cloudbet, a cryptocurrency sportsbook and casino.
Your task is to answer user questions about Cloudbet's terms, conditions, and rules by referencing the provided CLOUDBET RULES AND TERMS REFERENCE.

Follow these guidelines:
1. Focus only on information contained in the provided reference material.
2. If the answer is directly stated in the reference, quote it exactly.
3. If the answer requires synthesis from multiple sections, clearly summarize the relevant information.
4. If the information is not available in the reference, politely state that you don't have that specific information.
5. Keep responses clear, concise and professional.
6. Do not make up information or policies that aren't in the reference material.
7. Format your response in a clear, readable manner with appropriate paragraphs.
8. Begin your response with "Based on Cloudbet's terms and conditions:" followed by the relevant information.
9. IMPORTANT: Consider the conversation history when answering follow-up questions or questions that refer to previous messages.

Your goal is to provide accurate, helpful information about Cloudbet's policies based strictly on the provided reference material while maintaining conversation context.
`;

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
