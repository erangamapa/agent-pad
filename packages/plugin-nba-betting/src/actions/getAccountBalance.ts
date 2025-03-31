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
import { getAccountBalanceExamples } from "../examples";
import { createNBABettingService } from "../services";
import { AccountBalanceResponse } from "../types";

export const getAccountBalanceAction: Action = {
    name: "GET_ACCOUNT_BALANCE",
    similes: ["BALANCE", "ACCOUNT", "MONEY", "FUNDS", "USDT"],
    description: "Get your current USDT account balance.",
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
            const balanceData = await nbaService.getAccountBalance();

            if (!balanceData || !balanceData.amount) {
                callback({
                    text: "I'm sorry, I couldn't retrieve your account balance at the moment. Please try again later.",
                });
                return false;
            }

            // Format the balance amount with 2 decimal places
            const rawBalance = parseFloat(balanceData.amount);
            const formattedBalance = rawBalance.toFixed(2);

            aiverseLogger.success(
                `Successfully fetched account balance: ${formattedBalance} USDT`
            );

            callback({
                text: `Your current account balance is ${formattedBalance}$.`,
            });
            return true;
        } catch (error: any) {
            aiverseLogger.error("Error in account balance handler:", error);
            callback({
                text: "I'm having trouble retrieving your account balance right now. Please try again later.",
            });
            return false;
        }
    },
    examples: getAccountBalanceExamples as ActionExample[][],
} as Action;
