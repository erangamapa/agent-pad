export const tweetTemplate = `
# Context
{{recentMessages}}

# Topics
{{topics}}

# Post Directions
{{postDirections}}

# Recent interactions between {{agentName}} and other users:
{{recentPostInteractions}}

# Task
You need to generate a single tweet that:
1. Relates to the recent conversation or requested topic
2. Matches {{agentName}}'s style and voice
3. Is concise and engaging
4. MUST BE UNDER 280 CHARACTERS (absolute maximum)
5. Ideally around 180 characters for better readability
6. Speaks from the perspective of {{agentName}}

IMPORTANT: Generate ONLY the tweet text - do not include quotation marks, prefixes, or any other commentary.
Avoid hashtags unless they're truly relevant.
Do not explain your reasoning.
Return only the content that should be posted to Twitter.`;
