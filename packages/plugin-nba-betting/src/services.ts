import {
    AcceptPriceChange,
    AccountBalanceResponse,
    BetHistoryResponse,
    NBAMoneyLineMarketsResponse,
    PlaceBetOutput,
    Side,
} from "./types";
import { v4 as uuidv4 } from "uuid";

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
            currency: "USDT",
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

    const getBetHistory = async (): Promise<BetHistoryResponse> => {
        if (!apiKey) {
            throw new Error("Invalid parameters");
        }

        try {
            const url = `${BASE_URL}/pub/v4/bets/history`;
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "X-API-Key": apiKey,
                },
            });

            const data = await response.json();
            return data as BetHistoryResponse;
        } catch (error: any) {
            throw error;
        }
    };

    const getAccountBalance = async (): Promise<AccountBalanceResponse> => {
        if (!apiKey) {
            throw new Error("Invalid parameters");
        }

        try {
            const url = `${BASE_URL}/pub/v1/account/currencies/USDT/balance`;
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "X-API-Key": apiKey,
                },
            });

            const data = await response.json();
            return data as AccountBalanceResponse;
        } catch (error: any) {
            throw error;
        }
    };

    return {
        getNBAMoneyLineMarkets,
        placeBet,
        getBetHistory,
        getAccountBalance,
    };
};
