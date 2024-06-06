import StringUtils from "../Types/StringUtil";

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

export class RemoteKeyHasher {
	/**
	 * Set of _all_ fully qualified remote identifiers that are _currently_ in use.
	 */
	private static remoteIdentifierCache = new Set<string>();
	/**
	 * Mapping of numeric hash to fully qualified remote name.
	 */
	private static hashToIdentifier = new Map<number, string>();

	/**
	 * Returns the context in which remote function constructor was called.
	 *
	 * @returns The context in which function was called.
	 */
	public static GetCallerContext(): CallerContext | undefined {
		const context = debug.info(4, "s")[0];
		if (!context) return undefined;
		const isPackage = StringUtils.startsWith(context, "airshippackages");
		if (!isPackage) {
			return {
				isGame: true,
				isPackage: false,
				scriptPath: context,
			};
		}
		const parts = context.split("/");
		const packageOrg = parts[1];
		const packageName = parts[2];
		return {
			isGame: false,
			isPackage: true,
			scriptPath: context,
			packageName: packageName,
			packageOrg: packageOrg,
		};
	}

	/**
	 * Computes and returns constructed remote key's hash.
	 *
	 * @param context The context remote function was created in.
	 * @param uniqueIdentifier A unique identifier for remote.
	 * @param append Any additional data to append to hash key.
	 *
	 * @returns Remote key's hash.
	 */
	public static GetRemoteHash(context: CallerContext, uniqueIdentifier: string, append?: string): number {
		let absoluteKey = context.isGame
			? uniqueIdentifier
			: `${context.packageOrg}/${context.packageName}/${uniqueIdentifier}`;
		if (append) absoluteKey = `${absoluteKey}${append}`;
		const keyHash = absoluteKey.hash();
		if (this.remoteIdentifierCache.has(absoluteKey)) {
			error(
				`<b>Remote key ${uniqueIdentifier} is already in use. (${absoluteKey}) Please choose a unique name for remote. If you are seeing this error unexpectedly, please contact support.</b>`,
			);
		}
		if (this.hashToIdentifier.has(keyHash)) {
			const collision = this.hashToIdentifier.get(keyHash);
			error(
				`<b>FATAL ERROR. Remote keys ${absoluteKey} and ${collision} both produced hash ${keyHash}. Please send this error to support.</b>`,
			);
		}
		this.hashToIdentifier.set(keyHash, absoluteKey);
		this.remoteIdentifierCache.add(absoluteKey);
		return keyHash;
	}
}
