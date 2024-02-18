interface JaroConfig {
	caseSensitive?: boolean;
	scalingFactor?: number;
	prefixLength?: number;
}

declare function JaroSimilarity(s: string, t: string, config?: JaroConfig): number;
declare function JaroDistance(s: string, t: string, config?: JaroConfig): number;
declare function JaroWinkler(s: string, t: string, config?: JaroConfig): number;

export { JaroSimilarity, JaroDistance, JaroWinkler, JaroConfig };
