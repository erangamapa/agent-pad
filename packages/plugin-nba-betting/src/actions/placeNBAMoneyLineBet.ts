import {
    aiverseLogger,
    Action,
    ActionExample,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State,
} from "@aiverse/core";
import { validateNBAMoneyLineBettingConfig } from "../environment";
import { placeNBABetExamples } from "../examples";
import { createNBABettingService } from "../services";
import { Side } from "../types";
import { sanitizeMarketResponse } from "../utils/sanitizeMarketResponse";
import { extractTeamData } from "../utils/extractTeamData";

// Store bet details in a global variable that can be accessed by other actions
let lastBetDetails: {
    eventName: string;
    teamName: string;
    stake: number | null;
    price: string;
    status: string;
    timestamp: number;
} | null = null;

// Function to get the last bet details
export function getLastBetDetails() {
    return lastBetDetails;
}

export const placeNBAMoneyLineBet: Action = {
    name: "PLACE_NBA_BET",
    similes: ["BASKETBALL", "NBA", "BETTING", "SPORTS"],
    description: "Place the NBA Moneyline bet.",
    suppressInitialMessage: true,
    validate: async (runtime: IAgentRuntime) => {
        await validateNBAMoneyLineBettingConfig(runtime);
        return true;
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        callback: HandlerCallback
    ) => {
        const config = await validateNBAMoneyLineBettingConfig(runtime);
        const nbaService = createNBABettingService(config.CLOUDBET_API_KEY);
        const text = message.content.text;
        let eventName, teamName, stake;
        try {
            ({ eventName, teamName, stake } = await extractTeamData(
                runtime,
                text
            ));
        } catch (error) {
            callback({
                text: "Sorry. I am enabled to find the details of the teams and the event to place. Try again",
            });
            return false;
        }

        if (stake === null) {
            callback({
                text: "I couldn't determine the bet amount. Please specify a valid amount to bet.",
            });
            return false;
        }

        if (!eventName) {
            callback({
                text: "I couldn't determine which game you want to bet on. Please specify a valid NBA game.",
            });
            return false;
        }

        if (!teamName) {
            callback({
                text: "I couldn't determine which team you want to bet on. Please specify a valid team name.",
            });
            return false;
        }

        aiverseLogger.success(`========= Data from text input =========`);
        aiverseLogger.success(eventName);
        aiverseLogger.success(teamName);
        aiverseLogger.success(stake);
        aiverseLogger.success(`========= end =========`);

        let marketsData;
        try {
            const rawMarketsData = await nbaService.getNBAMoneyLineMarkets();
            marketsData = sanitizeMarketResponse(rawMarketsData);
        } catch (error) {
            callback({
                text: "Sorry, I was unable to fetch the current NBA markets. Please try again later.",
            });
            return false;
        }

        // Find the event that matches the eventName
        const matchingEvent = marketsData.events.find(
            (event) => event.name.toLowerCase() === eventName.toLowerCase()
        );

        if (!matchingEvent) {
            callback({
                text: `I could not find such game. Can you try again with a different game ?`,
            });
            return true;
        }

        // Get the eventId from the matching event
        const eventId = matchingEvent.id.toString();

        // Determine if the teamName is the home or away team
        const isHomeTeam =
            matchingEvent.home.name.toLowerCase() === teamName.toLowerCase();
        const isAwayTeam =
            matchingEvent.away.name.toLowerCase() === teamName.toLowerCase();

        if (!isHomeTeam && !isAwayTeam) {
            callback({
                text: `I could not find such team for this game. Can you correct the team name and try again ?`,
            });
            return true;
        }

        // Get the moneyline market data
        const moneylineMarket = matchingEvent.markets["basketball.moneyline"];
        if (!moneylineMarket) {
            callback({
                text: `I could not find such market for this game. Can you try again with a different game ?`,
            });
            return true;
        }

        // Get the selections from the submarkets
        const submarketKey = "period=ot&period=ft"; // This seems to be the standard key from examples
        const selections = moneylineMarket.submarkets[submarketKey]?.selections;

        if (!selections || selections.length === 0) {
            callback({
                text: `I could not find any odds for this market. Can you try again with a different market or a game ?`,
            });
            return true;
        }

        // Find the selection for the team
        const outcome = isHomeTeam ? "home" : "away";
        const selection = selections.find((s) => s.outcome === outcome);

        if (!selection) {
            callback({
                text: `I could not find specific odds you requested for this market. Can you try again with a different market or a game ?`,
            });
            return true;
        }

        // Extract the side and price
        const side = selection.side as Side; // The side should be "BACK" based on examples
        const price = selection.price.toString();

        aiverseLogger.success(
            `========= Data passed in to place bet =========`
        );
        aiverseLogger.success(eventId);
        aiverseLogger.success(stake);
        aiverseLogger.success(outcome);
        aiverseLogger.success(price);
        aiverseLogger.success(`========= end =========`);

        const data = await nbaService.placeBet(
            eventId,
            stake.toString(),
            outcome as Side,
            price
        );
        aiverseLogger.success(
            `========== Returned value from placeBet ============`
        );
        aiverseLogger.success(JSON.stringify(data));
        aiverseLogger.success(`Successfully placed bet on ${teamName}`);

        const acceptedStake = data.stake;
        const acceptedPrice = data.price;

        const status = data.status;
        if (status === "ACCEPTED" || status === "PENDING_ACCEPTANCE") {
            // Store bet details in state for local reference
            state.nbaBetDetails = {
                eventName,
                teamName,
                stake: acceptedStake,
                price: parseFloat(acceptedPrice).toFixed(2),
                status,
                timestamp: Date.now(),
            };

            // Store bet details in the global variable for cross-action access
            lastBetDetails = {
                eventName,
                teamName,
                stake: acceptedStake,
                price: parseFloat(acceptedPrice).toFixed(2),
                status,
                timestamp: Date.now(),
            };

            callback({
                text:
                    status === "ACCEPTED"
                        ? `Successfully placed a bet of $${acceptedStake} on ${teamName} with odds of ${parseFloat(acceptedPrice).toFixed(2)}.`
                        : `Bet is pending for acceptance with $${stake} on ${teamName} in the ${eventName} game. Waiting for acceptance.`,
            });
            return true;
        }

        aiverseLogger.error("Error in NBA plugin handler:");
        callback({
            text: `Sorry. I am unable to take the bet for you. Please try again later.`,
        });
        return false;
    },
    examples: placeNBABetExamples as ActionExample[][],
} as Action;
