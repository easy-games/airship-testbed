export const SecondsToMinutes = 60;
export const SecondsToHours = 3600;
export const SecondsToDays = 86400;
export const MinutesToDays = 1440;

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Duration {
	export type Seconds = number & { readonly tag?: never };
}

/**
 * Represents a span of time
 */
export class Duration {
	public static readonly zero = new Duration(0);

	private constructor(public readonly totalSeconds: number) {}

	public Add(time: Duration) {
		return new Duration(this.totalSeconds + time.totalSeconds);
	}

	public Sub(time: Duration) {
		return new Duration(this.totalSeconds - time.totalSeconds);
	}

	public Mul(factor: number) {
		return new Duration(this.totalSeconds * factor);
	}

	public Negate() {
		return new Duration(-this.totalSeconds);
	}

	public static FromSeconds(seconds: number) {
		return new Duration(seconds);
	}

	public static FromMinutes(minutes: number) {
		return new Duration(minutes * 60);
	}

	public static FromHours(hours: number) {
		return new Duration(hours * 60 * 60);
	}

	public static FromDays(days: number) {
		return new Duration(days * 60 * 60 * 24);
	}

	public static FromWeeks(weeks: number) {
		return new Duration(weeks * 60 * 60 * 24 * 7);
	}

	public Format(format = "%H:%M:%S") {
		const days = math.floor(this.GetDays());
		const hours = math.floor(this.GetHours());
		const minutes = math.floor(this.GetMinutes());
		const seconds = math.floor(this.GetSeconds()) % SecondsToMinutes;
		const totalSeconds = this.GetTotalSeconds();

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

	public GetDays() {
		return math.floor(this.GetTotalDays());
	}

	public GetHours() {
		return math.floor(this.GetTotalHours()) % 24;
	}

	public GetMinutes() {
		return math.floor(this.GetTotalMinutes()) % 60;
	}

	public GetSeconds() {
		return math.floor(this.GetTotalSeconds()) % SecondsToMinutes;
	}

	public GetTotalDays() {
		return this.totalSeconds / SecondsToDays;
	}

	public GetTotalHours() {
		return this.totalSeconds / SecondsToHours;
	}

	public GetTotalMinutes() {
		return this.totalSeconds / SecondsToMinutes;
	}

	public GetTotalSeconds() {
		return this.totalSeconds;
	}
}
