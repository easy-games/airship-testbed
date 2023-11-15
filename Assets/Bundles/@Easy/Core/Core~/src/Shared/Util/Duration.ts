export const SECONDS_TO_MINUTES = 60;
export const SECONDS_TO_HOURS = 3600;
export const SECONDS_TO_DAYS = 86400;
export const MINUTES_TO_DAYS = 1440;

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Duration {
	export type Seconds = number & { readonly tag?: never };
}

/**
 * Represents a span of time
 */
export class Duration {
	public static readonly ZERO = new Duration(0);

	private constructor(public readonly totalSeconds: number) {}

	public add(time: Duration) {
		return new Duration(this.totalSeconds + time.totalSeconds);
	}

	public sub(time: Duration) {
		return new Duration(this.totalSeconds - time.totalSeconds);
	}

	public mul(factor: number) {
		return new Duration(this.totalSeconds * factor);
	}

	public negate() {
		return new Duration(-this.totalSeconds);
	}

	public static fromSeconds(seconds: number) {
		return new Duration(seconds);
	}

	public static fromMinutes(minutes: number) {
		return new Duration(minutes * 60);
	}

	public static fromHours(hours: number) {
		return new Duration(hours * 60 * 60);
	}

	public static fromDays(days: number) {
		return new Duration(days * 60 * 60 * 24);
	}

	public static fromWeeks(weeks: number) {
		return new Duration(weeks * 60 * 60 * 24 * 7);
	}

	public format(format = "%H:%M:%S") {
		const days = math.floor(this.getDays());
		const hours = math.floor(this.getHours());
		const minutes = math.floor(this.getMinutes());
		const seconds = math.floor(this.getSeconds()) % SECONDS_TO_MINUTES;
		const totalSeconds = this.getTotalSeconds();

		return format.gsub("%%([HhMmSsDdupI][?]*)", {
			H: string.format("%02d", hours),
			M: string.format("%02d", minutes),
			S: string.format("%02d", seconds),
			D: string.format("%02d", days),
			h: hours,
			m: minutes,
			s: seconds,
			d: days,
			u: totalSeconds,
			p: hours >= 12 ? "PM" : "AM",
			I: hours % 12 || 12,
		})[0];
	}

	public getDays() {
		return math.floor(this.getTotalDays());
	}

	public getHours() {
		return math.floor(this.getTotalHours()) % 24;
	}

	public getMinutes() {
		return math.floor(this.getTotalMinutes()) % 60;
	}

	public getSeconds() {
		return math.floor(this.getTotalSeconds()) % SECONDS_TO_MINUTES;
	}

	public getTotalDays() {
		return this.totalSeconds / SECONDS_TO_DAYS;
	}

	public getTotalHours() {
		return this.totalSeconds / SECONDS_TO_HOURS;
	}

	public getTotalMinutes() {
		return this.totalSeconds / SECONDS_TO_MINUTES;
	}

	public getTotalSeconds() {
		return this.totalSeconds;
	}
}
