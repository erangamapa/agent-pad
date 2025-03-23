import {
    elizaLogger,
    generateText,
    ModelClass,
    IAgentRuntime,
} from "@elizaos/core";
import { mockedCloudbetRules } from "./mockRulesData";
import { playerRoundsData } from "./roundsData";

// Content storage to cache the data
let cachedContent: string | null = null;
let cachedRoundsData: any[] | null = null;

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

/**
 * Parse the player rounds data from CSV format
 * @returns Array of parsed round objects
 */
export const parsePlayerRoundsData = (): any[] => {
    // If rounds data is already cached, return it
    if (cachedRoundsData) {
        return cachedRoundsData;
    }

    try {
        elizaLogger.info("Parsing player rounds data...");

        const lines = playerRoundsData.trim().split("\n");
        const headers = lines[0].split(",");

        const rounds = lines.slice(1).map((line) => {
            // Handle commas inside quoted values
            const values: string[] = [];
            let inQuotes = false;
            let currentValue = "";

            for (let i = 0; i < line.length; i++) {
                const char = line[i];

                if (char === '"' && line[i - 1] !== "\\") {
                    inQuotes = !inQuotes;
                } else if (char === "," && !inQuotes) {
                    values.push(currentValue);
                    currentValue = "";
                } else {
                    currentValue += char;
                }
            }

            values.push(currentValue); // Add the last value

            // Create an object with header keys and corresponding values
            const round: Record<string, string> = {};
            headers.forEach((header, index) => {
                round[header.trim()] = values[index]
                    ? values[index].trim()
                    : "";
            });

            return round;
        });

        cachedRoundsData = rounds;
        elizaLogger.success("Successfully parsed player rounds data");

        return rounds;
    } catch (error) {
        elizaLogger.error("Error parsing player rounds data:", error);
        return [];
    }
};

/**
 * Query player rounds data using LLM to interpret and answer questions
 * @param runtime The agent runtime
 * @param query The current user query about their game history
 * @param conversationContext Optional context from previous messages
 */
export const queryPlayerRoundsWithLLM = async (
    runtime: IAgentRuntime,
    query: string,
    conversationContext: string = ""
): Promise<string> => {
    try {
        elizaLogger.info(`Querying player rounds data for: ${query}`);

        // Ensure rounds data is parsed
        const rounds = parsePlayerRoundsData();

        // Create context with conversation history, the rounds data, and user query
        const context = `
${conversationContext ? `PREVIOUS CONVERSATION:\n${conversationContext}\n\n` : ""}
CURRENT USER QUERY: ${query}

PLAYER GAME HISTORY DATA:
The following data represents the player's casino game rounds history. Each row represents a single round of gameplay:

Round ID: Unique identifier for the round
Created At: When the round was started
Completed At: When the round was completed
Game: Name of the game played
Provider: Game provider/developer
Stake: Amount wagered
Payout: Amount won (if any)
GGR: Gross Gaming Revenue (negative values mean player won)
Margin: Profit margin percentage
BonusReturnAmount: Bonus amount returned to the player

TOTAL GAMES PLAYED: ${rounds.length}

${playerRoundsData}

INSTRUCTIONS:
- Analyze the data to answer the player's query accurately
- Be precise with numbers, dates, and statistics
- Use factual data only from the player's history
- Highlight specific rounds when relevant
- Mention dates of played games when appropriate
- No greetings or excessive explanations
- Keep answers concise and focused on the data
`;

        // Define system prompt to guide the model
        const systemPrompt = `
You are a factual data analyst that provides precise information about a player's casino game history.

RULES:
1. Answer ONLY with facts based on the provided data.
2. Be precise with numbers, dates, and game names.
3. When a player asks which game they played the most, count game occurrences and report the most frequent.
4. When a player asks about their best round, find the round with the highest payout.
5. Include the date when the round/game was played.
6. Be concise and direct.
7. Don't use phrases like "Based on the data" or "According to your history".
8. If information cannot be determined from the data, simply state "This information cannot be determined from your game history."

Examples of questions and factual answers:
1. Q: "Which game have I played the most?"
   A: "You've played Live RouletteLive the most with 23 rounds, primarily during April 2021."

2. Q: "What was my best round?"
   A: "Your best round was on June 18, 2021, playing European Roulette Gold with a payout of $4,283.28."

3. Q: "How much have I won in total?"
   A: "Your total winnings across all games amount to $6,320.11, with the largest contribution from European Roulette Gold."

4. Q: "When did I last play Aviator?"
   A: "You last played Aviator on February 27, 2025 at 00:32:49."
`;

        // Use the LLM to generate a response based on the data
        const response = await generateText({
            runtime,
            context,
            modelClass: ModelClass.MEDIUM,
            customSystemPrompt: systemPrompt,
        });

        elizaLogger.success(
            `Successfully generated response for player history query: ${query}`
        );
        return response;
    } catch (error) {
        elizaLogger.error("Error querying player rounds data with LLM:", error);
        return "I'm having trouble analyzing your game history right now. Please try again later.";
    }
};
