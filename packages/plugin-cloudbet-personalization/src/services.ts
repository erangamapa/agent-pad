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
        let response = "\n\n";
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

INSTRUCTIONS:
- Give ONLY the exact answer from the reference material
- Use 1-2 sentences maximum
- No greetings, no explanations, no preamble
- No questions or offers of help
- No pleasantries or emotional language
`;

        // Define system prompt to guide the model
        const systemPrompt = `
You are a factual database query system that returns ONLY the exact information requested about Cloudbet's rules.

STRICT OUTPUT FORMAT:
": [1-2 SENTENCE ANSWER WITH JUST THE FACTS]"

RULES:
1. NEVER exceed 1-2 sentences.
2. NEVER use friendly language or emotional expressions.
3. NEVER ask questions or invite further engagement.
4. NEVER add explanations or justifications.
5. NEVER use phrases like "I hope" or "please" or any pleasantries.
6. ONLY include the EXACT facts from the reference material.
7. If information is not available, respond only with: ": This information is not in the reference material."

CORRECT EXAMPLE:
": Withdrawals are processed within 24 hours. Minimum withdrawal is 0.001 BTC."

INCORRECT EXAMPLES:
": I'm happy to tell you that withdrawals are processed within 24 hours. The minimum amount for withdrawals is 0.001 BTC. Please let me know if you need any other information!"
": Withdrawals are processed within 24 hours, which ensures you get your funds quickly. The minimum withdrawal amount is just 0.001 BTC, making it accessible for all users. Is there anything else you'd like to know about the withdrawal process?"

ANY deviation from the strict output format will result in rejection of your response.`;

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
