import { ActionExample } from "@elizaos/core";

export const getNBAMoneyLineBettingMarketsExamples: ActionExample[][] = [
    [
        {
            user: "{{user1}}",
            content: {
                text: "Can you show me the NBA Moneyline betting markets?",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "Sure! Here are the current NBA Moneyline betting markets:",
                action: "NBA_MONEY_LINE_MARKETS",
            },
        },
    ],
    [
        {
            user: "{{user1}}",
            content: {
                text: "I need the latest NBA Moneyline odds.",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "No problem! Here are the latest NBA Moneyline odds:",
                action: "NBA_MONEY_LINE_MARKETS",
            },
        },
    ],
    [
        {
            user: "{{user1}}",
            content: {
                text: "What are the Moneyline bets for today's NBA games?",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "Here are the Moneyline bets for today's NBA games:",
                action: "NBA_MONEY_LINE_MARKETS",
            },
        },
    ],
    [
        {
            user: "{{user1}}",
            content: {
                text: "Can you provide the NBA Moneyline markets?",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "Of course! Here are the NBA Moneyline markets:",
                action: "NBA_MONEY_LINE_MARKETS",
            },
        },
    ],
    [
        {
            user: "{{user1}}",
            content: {
                text: "Show me the NBA Moneyline betting options.",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "Here are the NBA Moneyline betting options:",
                action: "NBA_MONEY_LINE_MARKETS",
            },
        },
    ],
    [
        {
            user: "{{user1}}",
            content: {
                text: "Can you list the NBA Moneyline markets for me?",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "Sure! Here are the current NBA Moneyline markets:",
                action: "NBA_MONEY_LINE_MARKETS",
            },
        },
        {
            user: "{{user1}}",
            content: {
                text: "Thanks! Can you also provide the odds for these markets?",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "Absolutely! Here are the odds for the listed NBA Moneyline markets:",
                action: "NBA_MONEY_LINE_MARKETS",
            },
        },
    ],
    [
        {
            user: "{{user1}}",
            content: {
                text: "I'm looking for the NBA Moneyline betting markets.",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "Here are the NBA Moneyline betting markets:",
                action: "NBA_MONEY_LINE_MARKETS",
            },
        },
        {
            user: "{{user1}}",
            content: {
                text: "Great! Can you also show me the latest odds?",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "Sure! Here are the latest odds for the NBA Moneyline markets:",
                action: "NBA_MONEY_LINE_MARKETS",
            },
        },
        {
            user: "{{user1}}",
            content: {
                text: "Thank you!",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "You're welcome! If you need any more information, feel free to ask.",
            },
        },
    ],
    [
        {
            user: "{{user1}}",
            content: {
                text: "What types of betting markets are available?",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "We offer various NBA betting markets including Moneyline, Point Spread, and Over/Under. Would you like to see the current Moneyline markets?",
            },
        },
        {
            user: "{{user1}}",
            content: {
                text: "Yes, please show me the Moneyline markets.",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "Here are the current NBA Moneyline betting markets:",
                action: "NBA_MONEY_LINE_MARKETS",
            },
        },
    ],
];

export const placeNBABetExamples: ActionExample[][] = [
    // Basic successful bet examples
    [
        {
            user: "{{user1}}",
            content: {
                text: "Place a bet of 10$ on Clippers in Heat vs Clippers game",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "Successfully placed a bet of $10 on LA Clippers in the Miami Heat v LA Clippers game.",
                action: "PLACE_NBA_BET",
            },
        },
    ],
    [
        {
            user: "{{user1}}",
            content: {
                text: "I want to bet $250 on Mavericks in the Spurs vs Mavericks game",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "Successfully placed a bet of $250 on Dallas Mavericks in the San Antonio Spurs v Dallas Mavericks game.",
                action: "PLACE_NBA_BET",
            },
        },
    ],
    // Different currency format examples
    [
        {
            user: "{{user1}}",
            content: {
                text: "Put USD 50 on Heat in Heat vs Clippers game",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "Successfully placed a bet of $50 on Miami Heat in the Miami Heat v LA Clippers game.",
                action: "PLACE_NBA_BET",
            },
        },
    ],
    [
        {
            user: "{{user1}}",
            content: {
                text: "Bet $100.00 on Spurs in Spurs vs Mavericks game",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "Successfully placed a bet of $100 on San Antonio Spurs in the San Antonio Spurs v Dallas Mavericks game.",
                action: "PLACE_NBA_BET",
            },
        },
    ],
    // Invalid amount examples
    [
        {
            user: "{{user1}}",
            content: {
                text: "Bet -75$ on Clippers in Heat vs Clippers game",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "Error placing bet: Stake amount must be positive.",
                action: "PLACE_NBA_BET",
            },
        },
    ],
    [
        {
            user: "{{user1}}",
            content: {
                text: "Place a 0$ bet on Mavericks in Spurs vs Mavericks game",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "Error placing bet: Stake amount must be greater than zero.",
                action: "PLACE_NBA_BET",
            },
        },
    ],
    // Non-existent game examples
    [
        {
            user: "{{user1}}",
            content: {
                text: "Bet 150$ on Heat in Heat vs Thunder game",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "Error placing bet: This game is not currently available for betting.",
                action: "PLACE_NBA_BET",
            },
        },
    ],
    // Partial information requiring clarification
    [
        {
            user: "{{user1}}",
            content: {
                text: "Place a bet on the Lakers",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "Please specify the bet amount and which Lakers game you'd like to bet on.",
            },
        },
        {
            user: "{{user1}}",
            content: {
                text: "200$ on Lakers vs Celtics game",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "Successfully placed a bet of $200 on LAL Lakers in the LAL Lakers v BOS Celtics game.",
                action: "PLACE_NBA_BET",
            },
        },
    ],
    // Different bet phrasing examples
    [
        {
            user: "{{user1}}",
            content: {
                text: "I'd like to wager 300$ on the Warriors when they play the Nets",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "Successfully placed a bet of $300 on Golden State Warriors in the Golden State Warriors v Brooklyn Nets game.",
                action: "PLACE_NBA_BET",
            },
        },
    ],
    [
        {
            user: "{{user1}}",
            content: {
                text: "Put me down for 25$ on the Bucks tonight vs the Suns",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "Successfully placed a bet of $25 on MIL Bucks in the MIL Bucks v Phoenix Suns game.",
                action: "PLACE_NBA_BET",
            },
        },
    ],
    // Invalid team name examples with suggestions
    [
        {
            user: "{{user1}}",
            content: {
                text: "Bet 100$ on LA in Lakers vs Celtics game",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "Error placing bet: Ambiguous team name 'LA'. Did you mean 'Lakers' (LAL Lakers) or 'Clippers' (LA Clippers)?",
            },
        },
        {
            user: "{{user1}}",
            content: {
                text: "I meant Lakers",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "Successfully placed a bet of $100 on LAL Lakers in the LAL Lakers v BOS Celtics game.",
                action: "PLACE_NBA_BET",
            },
        },
    ],
    [
        {
            user: "{{user1}}",
            content: {
                text: "Put 50$ on Golden State in Warriors vs Nets game",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "Error placing bet: Team name 'Golden State' is incomplete. Did you mean 'Golden State Warriors'?",
            },
        },
        {
            user: "{{user1}}",
            content: {
                text: "Yes, Warriors",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "Successfully placed a bet of $50 on Golden State Warriors in the Golden State Warriors v Brooklyn Nets game.",
                action: "PLACE_NBA_BET",
            },
        },
    ],
    // Invalid game name examples with suggestions
    [
        {
            user: "{{user1}}",
            content: {
                text: "Bet 75$ on Celtics in Boston vs Lakers",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "Error placing bet: Game name 'Boston vs Lakers' not found. Did you mean 'Celtics vs Lakers'? The Celtics are listed as 'BOS Celtics' in our system.",
            },
        },
        {
            user: "{{user1}}",
            content: {
                text: "Yes, Celtics vs Lakers",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "Successfully placed a bet of $75 on BOS Celtics in the BOS Celtics v LAL Lakers game.",
                action: "PLACE_NBA_BET",
            },
        },
    ],
    // Invalid amount format with suggestions
    [
        {
            user: "{{user1}}",
            content: {
                text: "Place a bet of 25.5$ on Bucks in Bucks vs Suns game",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "Error placing bet: Fractional amounts are not accepted. Please round to the nearest dollar (either 25$ or 26$).",
            },
        },
        {
            user: "{{user1}}",
            content: {
                text: "Ok, make it 26$",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "Successfully placed a bet of $26 on MIL Bucks in the MIL Bucks v Phoenix Suns game.",
                action: "PLACE_NBA_BET",
            },
        },
    ],
    // Typo in team name with suggestion
    [
        {
            user: "{{user1}}",
            content: {
                text: "Bet 150$ on Celtic in Celtics vs Lakers game",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "Error placing bet: Team name 'Celtic' not found. Did you mean 'Celtics' (BOS Celtics)?",
            },
        },
        {
            user: "{{user1}}",
            content: {
                text: "Yes, Celtics",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "Successfully placed a bet of $150 on BOS Celtics in the BOS Celtics v LAL Lakers game.",
                action: "PLACE_NBA_BET",
            },
        },
    ],
    // Non-existent game with alternative suggestion
    [
        {
            user: "{{user1}}",
            content: {
                text: "Bet 200$ on Heat in Heat vs Thunder game",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "Error placing bet: Game 'Heat vs Thunder' is not available. The upcoming Heat games are: Heat vs Warriors, Heat vs Clippers, and Heat vs Hawks. Would you like to bet on one of these games instead?",
            },
        },
        {
            user: "{{user1}}",
            content: {
                text: "Ok, I'll bet on Heat vs Warriors instead",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "Successfully placed a bet of $200 on Miami Heat in the Miami Heat v Golden State Warriors game.",
                action: "PLACE_NBA_BET",
            },
        },
    ],
    // Multiple clarification steps
    [
        {
            user: "{{user1}}",
            content: {
                text: "I want to place a bet",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "Please specify the amount you want to bet, the team you're betting on, and which game. For example: '100$ on Lakers in Lakers vs Celtics game'",
            },
        },
        {
            user: "{{user1}}",
            content: {
                text: "500$ on the Celtics",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "Which Celtics game would you like to bet on? Available games are: Celtics vs Lakers, Celtics vs Nets, and Celtics vs Thunder.",
            },
        },
        {
            user: "{{user1}}",
            content: {
                text: "Celtics vs Lakers",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "Successfully placed a bet of $500 on BOS Celtics in the BOS Celtics v LAL Lakers game.",
                action: "PLACE_NBA_BET",
            },
        },
    ],
];

export const getBetHistoryExamples: ActionExample[][] = [
    [
        {
            user: "{{user1}}",
            content: {
                text: "Can you show me my betting history?",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "Here's your betting history:",
                action: "GET_BET_HISTORY",
            },
        },
    ],
    [
        {
            user: "{{user1}}",
            content: {
                text: "I want to see my recent bets.",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "Let me show you your recent bets:",
                action: "GET_BET_HISTORY",
            },
        },
    ],
    [
        {
            user: "{{user1}}",
            content: {
                text: "What bets have I placed so far?",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "Here are the bets you've placed so far:",
                action: "GET_BET_HISTORY",
            },
        },
    ],
    [
        {
            user: "{{user1}}",
            content: {
                text: "Show me my bet history.",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "Here's your bet history:",
                action: "GET_BET_HISTORY",
            },
        },
    ],
];
