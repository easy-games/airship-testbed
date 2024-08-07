import { OnUpdate } from "./Timer";

export function WaitFrame() {
	const promise = new Promise<void>((resolve) => {
		OnUpdate.Once(() => {
			resolve();
		});
	});
	promise.await();
}

export class TimeUtil {
	public static FormatTimeAgo(
		secondsAgo: number,
		config?: {
			includeAgo?: boolean;
		},
	) {
		// anything under 1 hour
		if (secondsAgo < 60 * 60) {
			return "Just now";
		}

		const days = math.floor(secondsAgo / (60 * 60 * 24));
		if (days > 0) {
			return days + " day" + (days > 1 ? "s" : "") + (config?.includeAgo ? " ago" : "");
		}

		const hours = math.floor(secondsAgo / (60 * 60));
		if (hours > 0) {
			return hours + " hour" + (hours > 1 ? "s" : "") + (config?.includeAgo ? " ago" : "");
		}

		return "Long time ago";
	}

	public static FormatCountdown(
		/** The remaining countdown time in seconds */
		timeLeftSec: number,
		config?: {
			seconds?: boolean;
			minutes?: boolean;
			hours?: boolean;
			days?: boolean;
			/**
			 * Makes sure single digits are padded with a 0. (ex. 7 sec -> 07 sec) DEFAULT TRUE.
			 */
			disablePadding?: boolean;
			/**
			 * How many decimals points to append to the seconds time
			 */
			decimalPoints?: number;
			seperator?: string;
		},
	): string {
		// Defaults
		const { minutes = true, seconds = true } = { ...config };

		const daysNumber = math.floor(timeLeftSec / (60 * 60 * 24));
		let days: string = daysNumber + "";
		if (config?.days) {
			timeLeftSec -= daysNumber * (60 * 60 * 24);
		}

		const hoursNumber = math.floor(timeLeftSec / (60 * 60));
		let hours: string = hoursNumber + "";
		if (config?.hours) {
			timeLeftSec -= hoursNumber * (60 * 60);
		}

		const minutesNumber = math.floor(timeLeftSec / 60);
		let minutesStr: string = minutesNumber + "";
		if (minutes) {
			timeLeftSec -= minutesNumber * 60;
		}

		let secondsStr = "";
		secondsStr = math.round(timeLeftSec) + "";
		// secondsStr = StringUtil.roundNumber(timeLeftSec, config?.decimalPoints ?? 0);

		if (days.size() === 0) {
			days = "00";
		} else if (days.size() === 1 && !config?.disablePadding) {
			days = "0" + days;
		}

		if (hours.size() === 0) {
			hours = "00";
		} else if (hours.size() === 1 && !config?.disablePadding) {
			hours = "0" + hours;
		}

		if (minutesStr.size() === 0) {
			minutesStr = "00";
		} else if (minutesStr.size() === 1 && !config?.disablePadding) {
			minutesStr = "0" + minutesStr;
		}

		const secondsSplit = secondsStr.split(".");
		if (secondsStr.size() === 0) {
			secondsStr = "00";
		} else if (secondsSplit[0].size() === 1 && !config?.disablePadding) {
			secondsStr = "0" + secondsStr;
		}

		const seperator = config?.seperator ?? ":";
		let result = `${secondsStr}`;
		if (minutes) {
			result = `${minutesStr}${seperator}${result}`;
		}
		if (config?.hours) {
			result = `${hours}${seperator}${result}`;
		}
		if (config?.days) {
			result = `${days}${seperator}${result}`;
		}
		return result;
	}
}
