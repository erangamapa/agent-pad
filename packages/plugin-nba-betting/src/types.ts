export interface PlaceBetOutput {
    referenceId: string;
    price: string;
    eventId: string;
    marketUrl: string;
    side: string;
    currency: string;
    stake: string;
    createTime: string;
    status: string;
    returnAmount: string;
    eventName: string;
    sportsKey: string;
    competitionId: string;
    categoryKey: string;
    customerReference: string;
    error: string;
}

export enum AcceptPriceChange {
    NONE = "NONE",
    ALL = "ALL",
    BETTER = "BETTER",
}

export enum Side {
    home = "home",
    away = "away",
}

export type Sport = {
    name: string;
    key: string;
};

export type Category = {
    name: string;
    key: string;
};

export interface NBAMoneyLineMarketsResponse {
    sport: Sport;
    category: Category;
    name: string;
    key: string;
    events: Event[];
}

export interface Event {
    sequence: string;
    id: number;
    home: Team;
    away: Team;
    players: Record<string, unknown>;
    status: string;
    markets: Markets;
    name: string;
    key: string;
    cutoffTime: string;
    metadata: Metadata;
    type: string;
}

export interface Team {
    name: string;
    key: string;
    abbreviation: string;
    nationality: string;
    researchId: string;
}

export interface Markets {
    "basketball.moneyline"?: MoneylineMarket;
}

export interface MoneylineMarket {
    submarkets: {
        "period=ot&period=ft": Submarket;
    };
}

export interface Submarket {
    sequence: string;
    selections: Selection[];
}

export interface Selection {
    outcome: string;
    params: string;
    price: number;
    minStake: number;
    maxStake: number;
    probability: number;
    status: string;
    side: string;
}

export interface Metadata {
    opinions: any;
    opinion: any[];
}

export interface Opinions {
    "period=q1": Period;
    "period=q2": Period;
    "period=q3": Period;
    "period=q4": Period;
}

export interface Period {
    outcomes: any[];
}

export interface BetHistoryResponse {
    bets: BetDetails[];
    totalBets: string;
}

export interface BetDetails {
    referenceId: string;
    price: string;
    eventId: string;
    marketUrl: string;
    side: string;
    currency: string;
    stake: string;
    createTime: string;
    status: string;
    returnAmount: string;
    eventName: string;
    sportsKey: string;
    competitionId: string;
    categoryKey: string;
    customerReference: string;
    error: string;
}

export interface AccountBalanceResponse {
    amount: string;
}
