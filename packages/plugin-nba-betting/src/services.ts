import {
    AcceptPriceChange,
    NBAMoneyLineMarketsResponse,
    PlaceBetOutput,
    Side,
} from "./types";
import { v4 as uuidv4 } from "uuid";
import {
    getEventIdFromName,
    getMarketUrl,
    getPriceFromEventId,
    getSideFromTeamName,
} from "./utils";
import { elizaLogger } from "@elizaos/core";

const BASE_URL = "https://sports-api-stg.cloudbet.com";

export const createNBABettingService = (apiKey: string) => {
    const getNBAMoneyLineMarkets =
        async (): Promise<NBAMoneyLineMarketsResponse> => {
            if (!apiKey) {
                throw new Error("Invalid parameters");
            }

            try {
                const url = `${BASE_URL}/pub/v2/odds/competitions/basketball-usa-nba?markets=basketball.moneyline`;
                const response = await fetch(url, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "X-API-Key": apiKey,
                    },
                });

                const data = await response.json();
                return data;
            } catch (error: any) {
                throw error;
            }
        };

    const placeBet = async (
        eventId: string,
        stake: string,
        outcome: Side,
        price: string
    ): Promise<any> => {
        if (!apiKey) {
            throw new Error("Invalid parameters");
        }

        const payload = {
            acceptPriceChange: AcceptPriceChange.ALL,
            currency: "MATIC",
            eventId,
            marketUrl: `basketball.moneyline/${Side[outcome]}`,
            price,
            stake,
            referenceId: uuidv4(),
            outcome,
        };

        try {
            const url = `${BASE_URL}/pub/v3/bets/place`;
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-API-Key": apiKey,
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            return data as PlaceBetOutput;
        } catch (error: any) {
            throw error;
        }
    };

    return { getNBAMoneyLineMarkets, placeBet };
};
