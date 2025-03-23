/**
 * Returns a descriptive schema string for the response of getNBAMoneyLineMarkets
 * that can be easily understood by LLMs.
 */
export function getNBAMoneyLineMarketsSchema(): string {
    return `
The NBA MoneyLine Markets data has the following structure:

- name: string (The name of the league, e.g., "NBA")
- key: string (A unique identifier for the league, e.g., "basketball-usa-nba")
- sport: object (Information about the sport)
  - name: string (Name of the sport, e.g., "Basketball")
  - key: string (Sport identifier, e.g., "basketball")
- events: array (An array of events/games with the following properties for each event)
  - sequence: string (A sequence identifier for the event)
  - id: number (Numeric identifier for the event)
  - home: object (Information about the home team)
    - name: string (Full name of the home team, e.g., "Golden State Warriors")
    - key: string (Unique identifier for the home team)
    - abbreviation: string (Team abbreviation, e.g., "GSW")
    - nationality: string (Country code of the team, e.g., "USA")
    - researchId: string (Additional identifier used for research)
  - away: object (Information about the away team with same structure as home team)
  - status: string (Current status of the event, e.g., "TRADING")
  - markets: object (Betting markets available for this event)
    - basketball.moneyline: object (Moneyline betting market)
      - submarkets: object (Different time period options for the market)
        - period=ot&period=ft: object (Market including overtime and full time)
          - sequence: string (Sequence identifier for this submarket)
          - selections: array (Array of betting options)
            - outcome: string (The outcome type, e.g., "home" or "away")
            - params: string (Additional parameters for the selection)
            - price: number (The odds for this selection, e.g., 1.507)
            - minStake: number (Minimum amount that can be bet)
            - maxStake: number (Maximum amount that can be bet)
            - probability: number (Implied probability for this outcome)
            - status: string (Status of this selection, e.g., "SELECTION_ENABLED")
            - side: string (Side of the bet, e.g., "BACK")
  - name: string (Display name of the event, e.g., "Golden State Warriors v Denver Nuggets")
  - key: string (Unique identifier for the event)
  - cutoffTime: string (Deadline for placing bets on this event)
  - metadata: object (Additional data about the event)
    - opinions: object (Opinion-related data)
    - opinion: array (Array of opinions)
  - type: string (Type of the event, e.g., "EVENT_TYPE_EVENT")

This structure allows you to identify available NBA games, the teams playing, and the moneyline odds for betting on either team to win.
  `;
}
