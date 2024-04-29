import StringUtils from "../Types/StringUtil";

interface CallerContext {
	isGame: boolean;
	isPackage: boolean;
	scriptPath: string;
	packageOrg?: string;
	packageName?: string;
}

export class RemoteKeyHasher {
	/**
	 *
	 */
	public static GetCallerContext(): CallerContext | undefined {
		const context = debug.info(4, "s")[0];
		if (!context) return undefined;
		const isPackage = StringUtils.startsWith(context, "@");
		if (!isPackage) {
			return {
				isGame: true,
				isPackage: false,
				scriptPath: context,
			};
		}
		const parts = context.split("/");
		const packageOrg = parts[0];
		const packageName = parts[1];
		return {
			isGame: false,
			isPackage: true,
			scriptPath: context,
			packageName: packageName,
			packageOrg: packageOrg,
		};
	}
}
