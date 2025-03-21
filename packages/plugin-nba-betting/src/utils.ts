import { Side } from "./types";

export const getMarketUrl = (side: Side) => {
    return `basketball.moneyline/${Side[side]}`;
};

export const getEventIdFromName = (eventName: string) => {
    if (eventName.includes("vs")) {
        return 1002;
    }
    return 4444;
};

export const getPriceFromEventId = (eventId: number) => {
    if (eventId === 1002) {
        return 1.5;
    }
    return 2.5;
};

export const getSideFromTeamName = (teamName: string) => {
    return teamName === "something" ? Side.home : Side.away;
};
