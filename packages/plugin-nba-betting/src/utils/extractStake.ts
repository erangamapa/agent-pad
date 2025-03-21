/**
 * Extracts a number (integer or float) from a string.
 *
 * @param input - The string to extract a number from
 * @returns The extracted number, or null if no number is found
 */
export function extractStake(input: string): number | null {
    if (!input) {
        return null;
    }

    // Match any integer or float pattern in the string
    const matches = input.match(/([-+]?\d*\.?\d+)/);

    if (!matches || matches.length === 0) {
        return null;
    }

    // Convert the matched string to a number
    const extractedNumber = Number(matches[0]);

    // Check if the conversion resulted in a valid number
    return isNaN(extractedNumber) ? null : extractedNumber;
}
