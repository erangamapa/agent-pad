import { aiverseLogger, IAgentRuntime, ModelClass } from "@aiverse/core";
import { generateText } from "@aiverse/core";
import { teamNames } from "../referenceData";

interface ExtractedData {
    eventName: string;
    teamName: string;
    stake: number | null;
}

const availableTeamNames = teamNames.join(", ");

export async function extractTeamData(
    runtime: IAgentRuntime,
    text: string
): Promise<ExtractedData> {
    const prompt = `Given the following text about an NBA betting request, extract the event name (which includes both teams playing), the team name that the bet is being placed on, and the amount being bet.

Available team names are: ${availableTeamNames}

Rules for team name matching:
1. All team names in the response (both event name and team name) must exactly match one of the team names from the available list
2. If a partial team name is mentioned in the input text (e.g., "Lakers" or "Warriors"), match it with the corresponding full team name from the available list
3. The event name in the response should be constructed using the exact team names from the available list, even if the input text uses partial names

Text: "${text}"

IMPORTANT: Respond with ONLY a pure JSON object containing these three fields:
1. eventName: The event name with both teams (constructed using exact team names from the available list)
2. teamName: The specific team being bet on (must use exact team name from the available list)
3. stake: The amount being bet (as a number, or null if no amount is specified)

DO NOT include any markdown formatting, code blocks, or additional text. Return ONLY the JSON object.

Example responses:
{"eventName": "Los Angeles Lakers v Golden State Warriors", "teamName": "Los Angeles Lakers", "stake": 100}

or with different team names:
{"eventName": "Boston Celtics v Philadelphia 76ers", "teamName": "Boston Celtics", "stake": null}`;

    try {
        const response = await generateText({
            runtime,
            context: prompt,
            modelClass: ModelClass.SMALL,
        });
        aiverseLogger.success(response);
        const extractedData = JSON.parse(response);
        return extractedData;
    } catch (error) {
        throw new Error("Failed to extract team data using LLM");
    }
}
