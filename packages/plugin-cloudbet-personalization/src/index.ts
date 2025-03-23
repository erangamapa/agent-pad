import { Plugin } from "@elizaos/core";
import { cloudbetRulesInquiryAction } from "./actions/cloudbetRulesInquiry";

export const cloudbetPersonalization: Plugin = {
    name: "cloudbet personalization",
    description:
        "Plugin for personalized Cloudbet information including terms, conditions, and sportsbook rules",
    actions: [cloudbetRulesInquiryAction],
    evaluators: [],
    providers: [],
};

export default cloudbetPersonalization;
