import StringUtils from "Shared/Util/StringUtil";

export class ChatUtil {
	public static ParseCommandData(commandText: string): CommandData | undefined {
		if (StringUtils.startsWith(commandText, "/")) {
			const text = StringUtils.slice(commandText, 1, commandText.size());
			const split = text.split(" ");

			return {
				label: split.remove(0)!.lower(),
				args: split,
			};
		}

		return undefined;
	}
}

export interface CommandData {
	label: string;
	args: string[];
}
