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
import { getNBAMoneyLineBettingMarketsExamples } from "../examples";
import { createNBABettingService } from "../services";
import { sanitizeMarketResponse } from "../utils/sanitizeMarketResponse";

export const getNBAMoneyLineMarketsAction: Action = {
    name: "NBA_MONEY_LINE_MARKETS",
    similes: ["BASKETBALL", "NBA", "BETTING", "SPORTS"],
    description: "Get the NBA Moneyline betting markets.",
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
            const rawMarketsData = await nbaService.getNBAMoneyLineMarkets();

            // Apply sanitization to filter out OUTRIGHT events and empty markets
            const marketsData = sanitizeMarketResponse(rawMarketsData);

            // Format each event with name and moneyline prices
            const formattedEvents = marketsData.events
                .map((event) => {
                    // Extract moneyline market data - correctly using the markets object structure
                    const moneylineMarket =
                        event.markets && event.markets["basketball.moneyline"]
                            ? event.markets["basketball.moneyline"]
                            : null;

                    // Extract home and away prices if available
                    let homePriceStr = "N/A";
                    let awayPriceStr = "N/A";

                    if (moneylineMarket && moneylineMarket.submarkets) {
                        const submarketKey = "period=ot&period=ft";
                        const mainSubmarket =
                            moneylineMarket.submarkets[submarketKey];

                        if (
                            mainSubmarket &&
                            Array.isArray(mainSubmarket.selections)
                        ) {
                            const homeSelection = mainSubmarket.selections.find(
                                (s) => s.outcome === "home"
                            );
                            const awaySelection = mainSubmarket.selections.find(
                                (s) => s.outcome === "away"
                            );

                            if (
                                homeSelection &&
                                typeof homeSelection.price === "number"
                            ) {
                                homePriceStr = homeSelection.price.toFixed(2);
                            }
                            if (
                                awaySelection &&
                                typeof awaySelection.price === "number"
                            ) {
                                awayPriceStr = awaySelection.price.toFixed(2);
                            }
                        }
                    }

                    // Format the cutoffTime into human readable form
                    let timeStr = "Time not available";
                    if (event.cutoffTime) {
                        const eventDate = new Date(event.cutoffTime);
                        const now = new Date();
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);

                        // Format time as hours and minutes (e.g., "4:30 PM")
                        const timeOptions: Intl.DateTimeFormatOptions = {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                        };
                        const timeFormatted = eventDate.toLocaleTimeString(
                            "en-US",
                            timeOptions
                        );

                        // Check if the event is today or tomorrow
                        if (eventDate.toDateString() === now.toDateString()) {
                            timeStr = `Today at ${timeFormatted}`;
                        } else if (
                            eventDate.toDateString() === tomorrow.toDateString()
                        ) {
                            timeStr = `Tomorrow at ${timeFormatted}`;
                        } else {
                            // Format like "Saturday 11 PM" or "31st March, 11 PM"
                            const isWithinAWeek =
                                eventDate.getTime() - now.getTime() <
                                7 * 24 * 60 * 60 * 1000;

                            if (isWithinAWeek) {
                                // Format as day of week
                                const dayOptions: Intl.DateTimeFormatOptions = {
                                    weekday: "long",
                                };
                                const dayFormatted =
                                    eventDate.toLocaleDateString(
                                        "en-US",
                                        dayOptions
                                    );
                                timeStr = `${dayFormatted} at ${timeFormatted}`;
                            } else {
                                // Format as day and month
                                const dateOptions: Intl.DateTimeFormatOptions =
                                    {
                                        day: "numeric",
                                        month: "long",
                                    };
                                const dateFormatted =
                                    eventDate.toLocaleDateString(
                                        "en-US",
                                        dateOptions
                                    );
                                timeStr = `${dateFormatted} at ${timeFormatted}`;
                            }
                        }
                    }

                    return {
                        formattedText: `On ${timeStr}, ${event.name} with Moneyline odds ${homePriceStr} and ${awayPriceStr} respectively`,
                        hasValidOdds:
                            homePriceStr !== "N/A" && awayPriceStr !== "N/A",
                    };
                })
                // Filter out events with N/A odds
                .filter((item) => item.hasValidOdds)
                .map((item) => item.formattedText);

            aiverseLogger.success(`Successfully fetched NBA Moneyline markets`);

            if (callback) {
                if (formattedEvents.length === 0) {
                    callback({
                        text: `I couldn't find any NBA Moneyline betting markets with available odds right now. Let's try again later.`,
                    });
                } else {
                    callback({
                        text: `Here are the current NBA Moneyline betting markets:\n${formattedEvents.join("\n")}`,
                    });
                }
                return true;
            }
        } catch (error: any) {
            aiverseLogger.error("Error in NBA plugin handler:", error);
            callback({
                text: `I couldn't get the markets from cloudbet. Let's try again later.`,
            });
            return false;
        }
    },
    examples: getNBAMoneyLineBettingMarketsExamples as ActionExample[][],
} as Action;
