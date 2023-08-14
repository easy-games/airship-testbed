import { ValidateFunction } from "ajv";
interface BuildDecorator {
    name: string;
    internalId: string;
    isFlameworkDecorator: boolean;
}
interface BuildClass {
    filePath: string;
    internalId: string;
    decorators: Array<BuildDecorator>;
}
interface FlameworkBuildInfo {
    version: number;
    flameworkVersion: string;
    identifierPrefix?: string;
    salt?: string;
    stringHashes?: {
        [key: string]: string;
    };
    identifiers: {
        [key: string]: string;
    };
    classes?: Array<BuildClass>;
}
export declare class BuildInfo {
    buildInfoPath: string;
    static validateBuildFn: ValidateFunction;
    static fromPath(fileName: string): BuildInfo;
    static fromDirectory(directory: string): BuildInfo | undefined;
    static validateBuild(value: unknown): value is FlameworkBuildInfo;
    private static candidateCache;
    static findCandidateUpper(startDirectory: string, depth?: number): string | undefined;
    static findCandidates(searchPath: string, depth?: number, isNodeModules?: boolean): string[];
    private buildInfo;
    private buildInfos;
    private identifiersLookup;
    constructor(buildInfoPath: string, buildInfo?: FlameworkBuildInfo);
    /**
     * Saves the build info to a file.
     */
    save(): void;
    /**
     * Retrieves the salt previously used to generate identifiers, or creates one.
     */
    getSalt(): string;
    /**
     * Retrieves the version of flamework that this project was originally compiled on.
     */
    getFlameworkVersion(): string;
    /**
     * Register a build info from an external source, normally packages.
     * @param buildInfo The BuildInfo to add
     */
    addBuildInfo(buildInfo: BuildInfo): void;
    /**
     * Register a new identifier to be saved with the build info.
     * @param internalId The internal, reproducible ID
     * @param id The random or incremental ID
     */
    addIdentifier(internalId: string, id: string): void;
    addBuildClass(classInfo: BuildClass): void;
    getBuildInfoFromFile(fileName: string): BuildInfo | undefined;
    /**
     * Get the random or incremental Id from the internalId.
     * @param internalId The internal, reproducible ID
     */
    getIdentifierFromInternal(internalId: string): string | undefined;
    /**
     * Get the internal, reproducible Id from a random Id.
     * @param id The random or incremental Id
     */
    getInternalFromIdentifier(id: string): string | undefined;
    getBuildClass(internalId: string): BuildClass | undefined;
    /**
     * Returns the next Id for incremental generation.
     */
    getLatestId(): number;
    /**
     * Create a UUID, subsequent calls with the same string will have the same UUID.
     * @param str The string to hash
     */
    hashString(str: string, context?: string): string;
    /**
     * Sets the prefix used for identifiers.
     * Used to generate IDs for packages.
     */
    setIdentifierPrefix(prefix: string | undefined): void;
    /**
     * Gets the prefixed used for identifiers.
     */
    getIdentifierPrefix(): string | undefined;
}
export {};
