/**
 * Represents the context in which function was called.
 */
interface CallerContext {
    /**
     * Whether or not function was called from game code.
     */
    isGame: boolean;
    /**
     * Whether or not function was called from package code.
     */
    isPackage: boolean;
    /**
     * The full script path.
     */
    scriptPath: string;
    /**
     * If called from a package, the package organization.
     */
    packageOrg?: string;
    /**
     * If called from a package, the package name.
     */
    packageName?: string;
}
export declare class RemoteKeyHasher {
    /**
     * Set of _all_ fully qualified remote identifiers that are _currently_ in use.
     */
    private static remoteIdentifierCache;
    /**
     * Mapping of numeric hash to fully qualified remote name.
     */
    private static hashToIdentifier;
    /**
     * Returns the context in which remote function constructor was called.
     *
     * @returns The context in which function was called.
     */
    static GetCallerContext(): CallerContext | undefined;
    /**
     * Computes and returns constructed remote key's hash.
     *
     * @param context The context remote function was created in.
     * @param uniqueIdentifier A unique identifier for remote.
     * @param append Any additional data to append to hash key.
     *
     * @returns Remote key's hash.
     */
    static GetRemoteHash(context: CallerContext, uniqueIdentifier: string, append?: string): number;
}
export {};
