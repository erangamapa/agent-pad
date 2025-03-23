import { Plugin } from "@elizaos/core";
import { cloudbetRulesInquiryAction } from "./actions/cloudbetRulesInquiry";
import { playerHistoryInquiryAction } from "./actions/playerHistoryInquiry";
import { loyaltyProgramInquiryAction } from "./actions/loyaltyProgramInquiry";

export const cloudbetPersonalization: Plugin = {
    name: "cloudbet personalization",
    description:
        "Plugin for personalized Cloudbet information including terms, conditions, sportsbook rules, player game history, and loyalty program",
    actions: [
        cloudbetRulesInquiryAction,
        playerHistoryInquiryAction,
        loyaltyProgramInquiryAction,
    ],
    evaluators: [],
    providers: [],
};

export default cloudbetPersonalization;
