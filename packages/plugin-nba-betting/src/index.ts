import { Plugin } from "@elizaos/core";
import { getNBAMoneyLineMarketsAction } from "./actions/getNBAMoneyLineMarkets";
import { placeNBAMoneyLineBet } from "./actions/placeNBAMoneyLineBet";
import { generateNBABetSlip } from "./actions/generateNBABetSlip";
import { getBetHistoryAction } from "./actions/getBetHistory";

export const nbaBetting: Plugin = {
    name: "nba betting",
    description: "NBA betting plugin for cloudbet",
    actions: [
        getNBAMoneyLineMarketsAction,
        placeNBAMoneyLineBet,
        generateNBABetSlip,
        getBetHistoryAction,
    ],
    // evaluators analyze the situations and actions taken by the agent. they run after each agent action
    // allowing the agent to reflect on what happened and potentially trigger additional actions or modifications
    evaluators: [],
    // providers supply information and state to the agent's context, help agent access necessary data
    providers: [],
};
export default nbaBetting;
