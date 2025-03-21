import { NBAMoneyLineMarketsResponse } from "../types";

export const sanitizeMarketResponse = (data: NBAMoneyLineMarketsResponse) => {
    // Create a deep copy of the original data to avoid mutations
    const sanitizedData = { ...data };

    // Filter out events that have type "EVENT_TYPE_OUTRIGHT" or empty markets
    sanitizedData.events = data.events.filter((event) => {
        // Check if the event type is not "EVENT_TYPE_OUTRIGHT"
        const isNotOutrightEvent = event.type !== "EVENT_TYPE_OUTRIGHT";

        // Check if the markets object is not empty by checking if it has any keys
        const hasMarkets = Object.keys(event.markets).length > 0;

        // Keep the event only if both conditions are true
        return isNotOutrightEvent && hasMarkets;
    });

    return sanitizedData;
};
