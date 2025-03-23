import { elizaLogger } from "@elizaos/core";
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
