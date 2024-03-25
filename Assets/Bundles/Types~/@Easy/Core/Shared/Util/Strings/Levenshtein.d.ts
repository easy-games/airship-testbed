/**
 * Calculates the Levenshtein distance of two strings. This function is better than most because it takes utf8 characters into account.
 *
 * More information on it can be seen [here, on wikipedia](https://en.wikipedia.org/wiki/Levenshtein_distance).
 * @param str The string
 * @param cmp The string to compare to
 * @returns A "distance" number - the higher, the further `str` is from `cmp`
 */
declare function Levenshtein(str: string, cmp: string): number;
export { Levenshtein };
