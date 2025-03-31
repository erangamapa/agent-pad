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
import { getBetHistoryExamples } from "../examples";
import { createNBABettingService } from "../services";
import { BetDetails } from "../types";

export const getBetHistoryAction: Action = {
    name: "GET_BET_HISTORY",
    similes: ["BASKETBALL", "NBA", "BETTING", "SPORTS", "HISTORY"],
    description: "Get history of NBA bets placed.",
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

        try {
            const betHistoryData = await nbaService.getBetHistory();

            if (!betHistoryData.bets || betHistoryData.bets.length === 0) {
                callback({
                    text: "You don't have any bets in your history yet. Would you like to place a bet?",
                });
                return true;
            }

            // Format the bet history in a readable way
            const formattedBets = betHistoryData.bets.map(
                (bet: BetDetails, index: number) => {
                    // Format the bet time
                    const betDate = new Date(bet.createTime);
                    const formattedDate = betDate.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                    });
                    const formattedTime = betDate.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                    });

                    // Extract team information from the market URL and event name
                    const [sportKey, marketType] = bet.marketUrl.split(".");
                    const outcomeInfo = marketType.split("/")[1]; // home or away

                    // Split the event name to get teams
                    const teams = bet.eventName.split(" v ");
                    const selectedTeam =
                        outcomeInfo === "home" ? teams[0] : teams[1];

                    // Calculate potential return if status is still ACCEPTED
                    const potentialReturn =
                        bet.status === "ACCEPTED"
                            ? (
                                  parseFloat(bet.stake) * parseFloat(bet.price)
                              ).toFixed(2)
                            : bet.returnAmount;

                    return `${index + 1}. ${formattedDate} at ${formattedTime}
   Game: ${bet.eventName}
   Bet: ${bet.stake} ${bet.currency} on ${selectedTeam} @ ${bet.price}
   Status: ${bet.status}
   ${bet.status === "ACCEPTED" ? `Potential Return: ${potentialReturn} ${bet.currency}` : `Return: ${bet.returnAmount} ${bet.currency}`}`;
                }
            );

            // Create the response message
            const totalBets = betHistoryData.totalBets;
            const responseText = `You have placed ${totalBets} bet${parseInt(totalBets) !== 1 ? "s" : ""} in total:\n\n${formattedBets.join("\n\n")}`;

            aiverseLogger.success(
                `Successfully fetched bet history with ${totalBets} bets`
            );

            callback({
                text: responseText,
            });
            return true;
        } catch (error: any) {
            aiverseLogger.error("Error in NBA bet history handler:", error);
            callback({
                text: "I'm having trouble retrieving your betting history right now. Please try again later.",
            });
            return false;
        }
    },
    examples: getBetHistoryExamples as ActionExample[][],
} as Action;
